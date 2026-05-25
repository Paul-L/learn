import { Icon } from '../ui/Icon';
import { TopSpacer } from '../ui/SafeArea';
import { useVocabBreakdown, useWeeklyActivity } from '../db/hooks';

/**
 * Paliers alignés sur PRD §2.5 F5 : indexés sur des seuils de MOTS MAÎTRISÉS,
 * pas sur des pourcentages — c'est plus concret et plus motivant que la jauge,
 * et ça matérialise la promesse Pareto par étapes utiles.
 */
interface Milestone {
  count: number;
  label: string;
  note: string;
  flag?: string;
}

const MILESTONES: Milestone[] = [
  { count: 250, label: '250 mots maîtrisés', note: 'Survie : commander, se présenter, demander son chemin' },
  { count: 500, label: '500 mots maîtrisés', note: 'Tu suis les échanges du quotidien' },
  { count: 750, label: '750 mots maîtrisés', note: 'Conversation fluide sur les sujets familiers' },
  { count: 1000, label: '1000 mots maîtrisés', note: 'Promesse Pareto atteinte — tu te débrouilles partout', flag: 'Promesse Pareto' },
];

interface ProgressScreenProps {
  userId: string;
}

export function ProgressScreen({ userId }: ProgressScreenProps) {
  const breakdown = useVocabBreakdown(userId);
  const weekly = useWeeklyActivity(userId) ?? [];

  if (!breakdown) {
    return (
      <div className="fade-in absolute inset-0 flex flex-col">
        <TopSpacer />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-[12px] uppercase tracking-[0.18em] text-muted">Chargement…</div>
        </div>
      </div>
    );
  }

  const maxDaily = Math.max(...weekly.map((w) => w.v), 10);
  const weeklyTotal = weekly.reduce((acc, d) => acc + d.v, 0);
  const introduced = breakdown.mastered + breakdown.learning;
  const masteredPct = breakdown.total === 0 ? 0 : (breakdown.mastered / breakdown.total) * 100;
  const learningPct = breakdown.total === 0 ? 0 : (breakdown.learning / breakdown.total) * 100;

  return (
    <div className="fade-in absolute inset-0 flex flex-col">
      <TopSpacer />
      <div className="scroll-y flex-1 px-6 pb-32 pt-2">
        <h1 className="pt-2 text-[22px] font-medium tracking-tight">Progression</h1>
        <p className="mt-1 text-[13px] text-muted">
          Ton parcours Pareto sur les {breakdown.total} mots les plus fréquents.
        </p>

        <div className="mt-5 rounded-2xl border border-line bg-paper p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted">
              Statut du vocabulaire
            </div>
            <div className="text-[12px] text-muted">
              {introduced}/{breakdown.total}
            </div>
          </div>

          <div className="flex h-2.5 overflow-hidden rounded-full bg-softline">
            <div className="bg-accent" style={{ width: `${masteredPct}%` }} />
            <div className="bg-accent/40" style={{ width: `${learningPct}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="inline-block h-2 w-2 rounded-full bg-accent" /> Maîtrisés
              </div>
              <div className="num-serif mt-0.5 text-[22px] leading-none text-ink">
                {breakdown.mastered}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="inline-block h-2 w-2 rounded-full bg-accent/40" /> En cours
              </div>
              <div className="num-serif mt-0.5 text-[22px] leading-none text-ink">
                {breakdown.learning}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="inline-block h-2 w-2 rounded-full border border-line bg-softline" />{' '}
                Restants
              </div>
              <div className="num-serif mt-0.5 text-[22px] leading-none text-ink">
                {breakdown.remaining}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-paper p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted">
              Cette semaine
            </div>
            <div className="text-[12px] text-muted">
              {weeklyTotal} item{weeklyTotal > 1 ? 's' : ''} travaillé{weeklyTotal > 1 ? 's' : ''}
            </div>
          </div>
          <div className="flex h-[120px] items-end justify-between gap-2">
            {weekly.map((w, i) => {
              const h = (w.v / maxDaily) * 100;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-full w-full items-end">
                    <div
                      className={`w-full rounded-md ${
                        w.today
                          ? 'border border-dashed border-accent bg-softline'
                          : 'bg-accent/85'
                      }`}
                      style={{ height: w.v === 0 ? '6%' : `${Math.max(h, 8)}%` }}
                    />
                  </div>
                  <div
                    className={`text-[11px] ${
                      w.today ? 'font-medium text-accent' : 'text-muted'
                    }`}
                  >
                    {w.d}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-[13px] uppercase tracking-[0.14em] text-muted">
            Prochains jalons
          </h3>
          <div className="space-y-2.5">
            {MILESTONES.map((m, i) => {
              const passed = breakdown.mastered >= m.count;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-4"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      passed ? 'bg-sageTint text-sage' : 'bg-softline text-muted'
                    }`}
                  >
                    <Icon name={passed ? 'check' : 'lock'} size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium">{m.label}</span>
                      {!passed && m.flag && (
                        <span className="text-[10px] uppercase tracking-wider text-accent">
                          {m.flag}
                        </span>
                      )}
                    </div>
                    <div className="text-[12.5px] text-muted">{m.note}</div>
                  </div>
                  <div
                    className={`num-serif text-[22px] leading-none ${
                      passed ? 'text-sage' : 'text-muted'
                    }`}
                  >
                    {m.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
