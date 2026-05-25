import { Icon } from '../ui/Icon';
import { TopSpacer } from '../ui/SafeArea';

interface OnboardWelcomeProps {
  onNext: () => void;
}

export function OnboardWelcome({ onNext }: OnboardWelcomeProps) {
  return (
    <div className="fade-in absolute inset-0 flex flex-col">
      <TopSpacer />
      <div className="flex flex-1 flex-col justify-between px-7 pb-10 pt-8">
        <div>
          <div className="mb-12 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink">
              <div className="h-3 w-3 rounded-sm bg-accent" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">Pareto English</span>
          </div>

          <h1
            className="mb-5 text-[36px] font-medium leading-[1.05] tracking-tight text-ink"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Comprends <span className="num-serif text-accent">85 %</span>
            <br />
            d'une conversation
            <br />
            avec <span className="num-serif">1 000 mots</span>.
          </h1>
          <p
            className="max-w-[300px] text-[15px] leading-relaxed text-muted"
            style={{ textWrap: 'pretty' } as React.CSSProperties}
          >
            La loi de Pareto, appliquée à l'anglais. Que du vocabulaire utile, 5 à 10 minutes par
            jour. Aucune leçon de grammaire.
          </p>
        </div>

        <div className="relative -mx-2 flex h-[180px] items-end justify-center">
          <svg width="320" height="170" viewBox="0 0 320 170">
            <defs>
              <linearGradient id="grad1" x1="0" x2="1">
                <stop offset="0" stopColor="#C76F4B" stopOpacity="0.0" />
                <stop offset="1" stopColor="#C76F4B" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path
              d="M 30 140 Q 160 -20 290 140"
              stroke="#EFEAE0"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 30 140 Q 130 8 220 60"
              stroke="url(#grad1)"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="220" cy="60" r="8" fill="#C76F4B" />
            <text
              x="160"
              y="155"
              textAnchor="middle"
              className="fill-muted"
              style={{ fontSize: 11, letterSpacing: '0.16em' }}
            >
              VOCABULAIRE FRÉQUENT →
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          <button
            onClick={onNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[15px] font-medium text-bone transition active:scale-[0.99]"
          >
            Commencer
            <Icon name="arrow-right" size={18} />
          </button>
          <p className="text-center text-[12px] text-muted">5–10 min/jour · sans pub · sans compte</p>
        </div>
      </div>
    </div>
  );
}
