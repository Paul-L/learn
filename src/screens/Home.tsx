import { useMemo } from 'react';
import { CoverageGauge } from '../ui/CoverageGauge';
import { Icon, type IconName } from '../ui/Icon';
import { TopSpacer } from '../ui/SafeArea';
import { useHomeStats, useSessionPreview } from '../db/hooks';
import type { SessionStep } from '../srs/session';
import type { User } from '../types/models';

interface StatRowProps {
  icon: IconName;
  value: string;
  label: string;
  accent?: boolean;
}

function StatRow({ icon, value, label, accent = false }: StatRowProps) {
  return (
    <div className="flex flex-1 flex-col items-start gap-1 px-4 py-3">
      <div className={`flex items-center gap-1.5 ${accent ? 'text-accent' : 'text-muted'}`}>
        <Icon name={icon} size={14} />
        <span className="text-[10.5px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className="text-[22px] font-medium leading-none text-ink">{value}</div>
    </div>
  );
}

interface HomeScreenProps {
  user: User;
  onStartSession: () => void;
}

interface ProgramRow {
  icon: IconName;
  label: string;
  primary: string;
  secondary: string;
}

function programFromSession(steps: SessionStep[]): ProgramRow[] {
  if (steps.length === 0) return [];
  const rows: ProgramRow[] = [];
  const discovers = steps.filter((s) => s.kind === 'discover');
  if (discovers.length > 0) {
    const w = discovers[0].kind === 'discover' ? discovers[0].word : null;
    rows.push({
      icon: 'sparkle',
      label: `Découvrir${discovers.length > 1 ? ` (${discovers.length})` : ''}`,
      primary: w ? w.lemma : '—',
      secondary: w ? w.translationFr : '',
    });
  }
  const recogs = steps.filter((s) => s.kind === 'recognize');
  if (recogs.length > 0) {
    const words = recogs
      .map((s) => (s.kind === 'recognize' ? s.word.lemma : ''))
      .filter(Boolean)
      .slice(0, 3);
    rows.push({
      icon: 'check',
      label: 'Reconnaître',
      primary: words.join(' · '),
      secondary: `${recogs.length} mot${recogs.length > 1 ? 's' : ''}`,
    });
  }
  const recalls = steps.filter((s) => s.kind === 'recall');
  if (recalls.length > 0) {
    const w = recalls[0].kind === 'recall' ? recalls[0].word : null;
    rows.push({
      icon: 'refresh',
      label: 'Restituer',
      primary: w ? w.translationFr : '—',
      secondary: `${recalls.length} mot${recalls.length > 1 ? 's' : ''}`,
    });
  }
  const listens = steps.filter((s) => s.kind === 'listen');
  if (listens.length > 0) {
    const w = listens[0].kind === 'listen' ? listens[0].word : null;
    rows.push({
      icon: 'volume-sm',
      label: 'Écouter',
      primary: w ? w.lemma : '—',
      secondary: `${listens.length} mot${listens.length > 1 ? 's' : ''}`,
    });
  }
  const clozes = steps.filter((s) => s.kind === 'cloze');
  if (clozes.length > 0) {
    const p = clozes[0].kind === 'cloze' ? clozes[0].phrase : null;
    rows.push({
      icon: 'book',
      label: 'Compléter',
      primary: p ? p.textEn.replace(clozes[0].kind === 'cloze' ? clozes[0].blank : '', '___') : '—',
      secondary: 'expression',
    });
  }
  return rows;
}

function paretoGapHint(coverage: number): { reached: boolean; remaining: number } {
  if (coverage >= 85) return { reached: true, remaining: 0 };
  return { reached: false, remaining: Math.round(85 - coverage) };
}

interface DailyGoalProps {
  seen: number;
  goal: number;
}

/**
 * Objectif quotidien — affichage sobre, sans culpabilisation. Une fois
 * l'objectif atteint, la barre passe en sage et un check apparaît : la
 * journée valide la série (cf. `computeStreak`).
 */
function DailyGoal({ seen, goal }: DailyGoalProps) {
  if (goal <= 0) return null;
  const reached = seen >= goal;
  const pct = Math.min(100, (seen / goal) * 100);
  return (
    <div className="mt-3 px-1">
      <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
        <span className={`flex items-center gap-1 ${reached ? 'text-sage' : 'text-muted'}`}>
          {reached && <Icon name="check" size={12} />}
          {reached ? "Objectif du jour atteint" : "Objectif du jour"}
        </span>
        <span className="font-medium text-ink">
          {Math.min(seen, goal)}/{goal}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-softline">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            reached ? 'bg-sage' : 'bg-accent'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function HomeScreen({ user, onStartSession }: HomeScreenProps) {
  const stats = useHomeStats(user.id);
  const steps = useSessionPreview(user.id, user.dailyGoal);
  const program = useMemo(() => (steps ? programFromSession(steps) : []), [steps]);
  const sessionSize = steps?.length ?? 0;

  const initial = (user.name || 'M').slice(0, 1).toUpperCase();
  const coverage = stats?.coverage ?? 0;
  const dueCount = stats?.dueCount ?? 0;
  const newCount = stats?.newCount ?? 0;
  const streak = stats?.streak ?? 0;
  const gap = paretoGapHint(coverage);
  const minutesEstimate = Math.max(2, Math.round(sessionSize * 0.6));
  const newInSession = program.find((p) => p.label.startsWith('Découvrir'));

  return (
    <div className="fade-in absolute inset-0 flex flex-col">
      <TopSpacer />
      <div className="scroll-y flex-1 px-6 pb-32 pt-3">
        {/* L'avatar est intégré au header de la jauge — pas de greeting
            séparé, ressenti app-first. Le palier 85 % reste matérialisé
            par le repère sur l'arc, donc plus besoin du texte « Objectif ». */}
        <div className="rounded-3xl border border-line bg-paper p-3 pb-5 shadow-card">
          <div className="flex items-center justify-between px-3 pt-1">
            <div className="flex items-center gap-1.5 text-muted">
              <Icon name="target" size={14} />
              <span className="text-[10.5px] uppercase tracking-[0.14em]">
                Ta couverture Pareto
              </span>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[11.5px] font-medium text-bone"
              title={user.name || undefined}
            >
              {initial}
            </div>
          </div>
          <div className="mt-1 flex justify-center">
            <CoverageGauge value={coverage} size={280} target={85} />
          </div>
          <div className="mt-2 flex items-center justify-between px-2 text-[11.5px] text-muted">
            <span>{newCount} mots restants à introduire</span>
            <span className="flex items-center gap-1 text-accent">
              <Icon name="sparkle" size={12} />
              {gap.reached ? (
                <span>
                  Palier <b className="font-medium text-ink">85 %</b> atteint
                </span>
              ) : (
                <span>
                  Plus que <b className="font-medium text-ink">{gap.remaining} %</b> avant le palier
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="mt-3 flex divide-x divide-line rounded-2xl border border-line bg-paper">
          <StatRow icon="flame" value={String(streak)} label="Série" accent />
          <StatRow icon="refresh" value={String(dueCount)} label="Révisions" />
          <StatRow icon="sparkle" value={String(newCount)} label="Nouveaux" />
        </div>

        <button
          onClick={onStartSession}
          disabled={sessionSize === 0}
          className={`mt-4 flex w-full items-center gap-4 rounded-2xl p-5 shadow-card transition ${
            sessionSize === 0
              ? 'cursor-not-allowed bg-line text-muted'
              : 'bg-ink text-bone active:scale-[0.995]'
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              sessionSize === 0 ? 'bg-softline text-muted' : 'bg-accent/95'
            }`}
          >
            <Icon name="play" size={20} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[15px] font-medium">
              {sessionSize === 0 ? 'Rien à réviser pour l’instant' : 'Démarrer la session du jour'}
            </div>
            {sessionSize > 0 && (
              <div className="text-[12.5px] text-bone/60">
                ≈ {minutesEstimate} min · {sessionSize} étapes
                {newInSession ? ` · ${newInSession.secondary || newInSession.primary} nouveau${newInSession.primary.includes(' ') ? 'x' : ''}` : ''}
              </div>
            )}
          </div>
          {sessionSize > 0 && <Icon name="chevron-right" size={20} />}
        </button>

        <DailyGoal seen={stats?.todayItemsSeen ?? 0} goal={user.dailyGoal} />

        {program.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-[13px] uppercase tracking-[0.14em] text-muted">Au programme</h3>
              <span className="text-[12px] text-muted">
                {program.length} étape{program.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="divide-y divide-softline rounded-2xl border border-line bg-paper">
              {program.map((row, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-softline text-muted">
                    <Icon name={row.icon} size={15} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] text-muted">{row.label}</div>
                    <div className="truncate text-[14px] text-ink">{row.primary}</div>
                  </div>
                  <span className="text-[12px] text-muted">{row.secondary}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-accent/15 bg-accentTint/60 p-4">
          <div className="mb-1 flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] text-accent2">
            <Icon name="sparkle" size={12} />
            Le principe Pareto
          </div>
          <p
            className="text-[13.5px] leading-relaxed text-ink/80"
            style={{ textWrap: 'pretty' } as React.CSSProperties}
          >
            Les 100 mots anglais les plus fréquents apparaissent dans{' '}
            <b className="text-ink">≈ 50 %</b> de tout ce qui se dit. Apprendre peu, mais utile.
          </p>
        </div>
      </div>
    </div>
  );
}
