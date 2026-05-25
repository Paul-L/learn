import { MATURITY_STEP_COUNT, maturityStepIndex } from '../srs/scheduler';
import type { ReviewItemState } from '../types/models';

interface MaturityBarProps {
  state: ReviewItemState;
  className?: string;
}

/**
 * Barre segmentée représentant le chemin d'un mot vers la maîtrise.
 * Calquée sur le `ProgressBar` de session : segments arrondis,
 * piste `softline`, remplissage `ink`.
 *
 * Pourquoi segmentée et pas continue : la stabilité FSRS démarre minuscule
 * et peut reculer. Une barre continue paraîtrait bloquée au début.
 * Les paliers (`maturity()`) n'avancent qu'en sens positif et par crans
 * nets — c'est l'effet rassurant recherché.
 */
export function MaturityBar({ state, className = '' }: MaturityBarProps) {
  const filled = maturityStepIndex(state);
  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: MATURITY_STEP_COUNT }).map((_, i) => (
        <div
          key={i}
          className="h-[5px] flex-1 overflow-hidden rounded-full bg-softline"
        >
          <div
            className="h-full rounded-full bg-ink transition-all duration-500"
            style={{ width: i < filled ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>
  );
}
