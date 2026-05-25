import { Icon, type IconName } from '../ui/Icon';
import { TopSpacer } from '../ui/SafeArea';
import type { PaceKey } from '../srs/stats';

interface OnboardSetupProps {
  name: string;
  setName: (name: string) => void;
  pace: PaceKey;
  setPace: (pace: PaceKey) => void;
  onBack: () => void;
  onDone: () => void;
  submitting?: boolean;
}

interface PaceOption {
  id: PaceKey;
  label: string;
  desc: string;
  icon: IconName;
  recommended?: boolean;
}

const PACES: PaceOption[] = [
  { id: 'easy', label: 'Tranquille', desc: '5 min · 6 mots/jour', icon: 'coffee' },
  { id: 'std', label: 'Standard', desc: '8 min · 10 mots/jour', icon: 'wave', recommended: true },
  { id: 'intense', label: 'Intensif', desc: '15 min · 18 mots/jour', icon: 'zap' },
];

export function OnboardSetup({
  name,
  setName,
  pace,
  setPace,
  onBack,
  onDone,
  submitting = false,
}: OnboardSetupProps) {
  const canSubmit = name.trim().length > 0 && !submitting;
  return (
    <div className="fade-in absolute inset-0 flex flex-col">
      <TopSpacer />
      <div className="px-7 pb-3 pt-2">
        <button onClick={onBack} className="-ml-1 p-1 text-muted">
          <Icon name="arrow-left" size={20} />
        </button>
      </div>
      <div className="flex flex-1 flex-col px-7 pb-8 pt-2">
        <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">Étape 1 sur 1</div>
        <h2 className="mb-1 text-[26px] font-medium leading-tight tracking-tight">
          On se présente.
        </h2>
        <p className="mb-6 text-[14px] text-muted">
          On va caler ton rythme. Tu pourras le changer plus tard.
        </p>

        <label className="mb-2 text-[12px] uppercase tracking-[0.14em] text-muted">Prénom</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Camille"
          className="w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-[15px] focus:border-ink/40 focus:outline-none"
        />

        <label className="mb-2 mt-6 text-[12px] uppercase tracking-[0.14em] text-muted">
          Rythme quotidien
        </label>
        <div className="space-y-2.5">
          {PACES.map((p) => {
            const active = pace === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPace(p.id)}
                className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition ${
                  active ? 'border-ink bg-paper' : 'border-line bg-paper/60 hover:bg-paper'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    active ? 'bg-accentTint text-accent' : 'bg-softline text-muted'
                  }`}
                >
                  <Icon name={p.icon} size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium">{p.label}</span>
                    {p.recommended && (
                      <span className="text-[10px] uppercase tracking-wider text-accent">
                        Suggéré
                      </span>
                    )}
                  </div>
                  <div className="text-[12.5px] text-muted">{p.desc}</div>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    active ? 'border-ink' : 'border-line'
                  }`}
                >
                  {active && <div className="h-2.5 w-2.5 rounded-full bg-ink" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
          <button
            onClick={onDone}
            disabled={!canSubmit}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-medium transition ${
              canSubmit
                ? 'bg-ink text-bone active:scale-[0.99]'
                : 'cursor-not-allowed bg-line text-muted'
            }`}
          >
            {submitting ? 'Enregistrement…' : 'Continuer'}
            {!submitting && <Icon name="arrow-right" size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
