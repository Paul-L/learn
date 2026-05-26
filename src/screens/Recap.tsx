import { CoverageGauge } from '../ui/CoverageGauge';
import { Icon } from '../ui/Icon';
import { MaturityBar } from '../ui/MaturityBar';
import { TopSpacer } from '../ui/SafeArea';
import { useSessionPreview } from '../db/hooks';
import type { ReviewedItemSummary } from './Session';

interface RecapProps {
  items: number;
  correct: number;
  xp: number;
  prevCoverage: number;
  newCoverage: number;
  streak: number;
  reviewedItems: ReviewedItemSummary[];
  userId: string;
  dailyGoal: number;
  onDone: () => void;
  /** Relance immédiatement une nouvelle session sans repasser par Home. */
  onContinue: () => void;
}

export function Recap({
  items,
  correct,
  xp,
  prevCoverage,
  newCoverage,
  streak,
  reviewedItems,
  userId,
  dailyGoal,
  onDone,
  onContinue,
}: RecapProps) {
  const accuracy = items > 0 ? Math.round((correct / items) * 100) : 100;
  const delta = newCoverage - prevCoverage;
  // Aperçu live de la file post-session : sert à masquer « Continuer »
  // quand il ne reste plus rien à réviser, plutôt que de proposer un
  // bouton qui mènerait à l'écran « Rien à réviser ».
  const nextPreview = useSessionPreview(userId, dailyGoal);
  const canContinue = (nextPreview?.length ?? 0) > 0;

  return (
    <div className="fade-in absolute inset-0 z-40 flex flex-col bg-bone">
      <TopSpacer />
      <div className="scroll-y flex-1 px-6 pb-8 pt-2">
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10.5px] uppercase tracking-[0.16em] text-muted">
            Bilan de session
          </span>
          <button onClick={onDone} className="-mr-1 p-1 text-muted">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="mt-4">
          <h1
            className="text-[30px] font-medium leading-tight tracking-tight"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Belle session.
            <br />
            <span className="text-muted">Tu avances bien.</span>
          </h1>
        </div>

        <div className="mt-2 rounded-3xl border border-line bg-paper p-3 pb-5 shadow-card">
          <div className="flex items-center justify-between px-3 pt-1">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted">
              Ta couverture progresse
            </div>
            <div className="text-[11px] text-accent">
              {delta >= 0 ? '+' : ''}
              {delta.toFixed(1)} %
            </div>
          </div>
          <div className="flex justify-center">
            <CoverageGauge value={newCoverage} size={260} target={85} animated />
          </div>
          <div className="mt-1 text-center text-[12px] text-muted">
            {prevCoverage.toFixed(1)} % →{' '}
            <span className="font-medium text-ink">{newCoverage.toFixed(1)} %</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-muted">
              <Icon name="check" size={13} />
              <span className="text-[10.5px] uppercase tracking-[0.14em]">Réussite</span>
            </div>
            <div className="num-serif text-[26px] leading-none text-ink">
              {accuracy} <span className="text-[16px] text-muted">%</span>
            </div>
            <div className="mt-1 text-[12px] text-muted">
              {correct}/{items} items justes
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-muted">
              <Icon name="sparkle" size={13} />
              <span className="text-[10.5px] uppercase tracking-[0.14em]">XP gagné</span>
            </div>
            <div className="num-serif text-[26px] leading-none text-ink">+{xp}</div>
            <div className="mt-1 text-[12px] text-muted">cette session</div>
          </div>
          {streak > 0 && (
            <div className="col-span-2 flex items-center gap-4 rounded-2xl border border-line bg-paper p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accentTint text-accent">
                <Icon name="flame" size={22} />
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-medium">
                  {streak === 1
                    ? 'Série lancée — 1 jour'
                    : `Série confirmée — ${streak} jours`}
                </div>
                <div className="text-[12.5px] text-muted">À demain, même heure ?</div>
              </div>
              <div className="num-serif text-[28px] leading-none text-ink">{streak}</div>
            </div>
          )}
        </div>

        {reviewedItems.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-[13px] uppercase tracking-[0.14em] text-muted">
              Items vus
            </h3>
            <div className="divide-y divide-softline rounded-2xl border border-line bg-paper">
              {reviewedItems.map((it, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[15px] text-ink">{it.en}</span>
                      {it.isNew && (
                        <span className="shrink-0 text-[10.5px] uppercase tracking-wider text-accent">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <div className="truncate text-[12px] text-muted">{it.fr}</div>
                  </div>
                  <div className="w-[60px] shrink-0">
                    <MaturityBar state={it.maturity} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quand une session suivante est dispo, « Continuer » est l'action
            attendue après un bilan réussi : on lui donne le primary. Sinon,
            Home reprend naturellement la place principale. Pas de relance
            automatique, l'utilisateur reste maître du clic. */}
        <div className="mt-6 space-y-2.5">
          {canContinue ? (
            <>
              <button
                onClick={onContinue}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[15px] font-medium text-bone transition active:scale-[0.99]"
              >
                Continuer la révision
                <Icon name="arrow-right" size={18} />
              </button>
              <button
                onClick={onDone}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-paper py-3.5 text-[14.5px] font-medium text-ink transition active:scale-[0.99]"
              >
                <Icon name="home" size={16} />
                Retour à l'accueil
              </button>
            </>
          ) : (
            <button
              onClick={onDone}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[15px] font-medium text-bone transition active:scale-[0.99]"
            >
              Retour à l'accueil
              <Icon name="arrow-right" size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
