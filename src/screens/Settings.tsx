import { useEffect, useState } from 'react';
import { Icon, type IconName } from '../ui/Icon';
import { TopSpacer } from '../ui/SafeArea';
import { updateProfile } from '../db/db';
import { PACE_TO_GOAL, type PaceKey } from '../srs/stats';
import type { User } from '../types/models';

interface SettingsScreenProps {
  user: User;
}

interface PaceOption {
  id: PaceKey;
  label: string;
  desc: string;
  icon: IconName;
}

/**
 * Mêmes paliers que `OnboardSetup` — cohérence garantie via `PACE_TO_GOAL`
 * (la source de vérité de la dérivation pace → dailyGoal).
 */
const PACES: PaceOption[] = [
  { id: 'easy', label: 'Tranquille', desc: '~1 min · 10 mots/jour', icon: 'coffee' },
  { id: 'std', label: 'Standard', desc: '~2-3 min · 20 mots/jour', icon: 'wave' },
  { id: 'intense', label: 'Intensif', desc: '~5 min · 40 mots/jour', icon: 'zap' },
  { id: 'marathon', label: 'Marathon', desc: '~7-8 min · 60 mots/jour', icon: 'mountain' },
];

/** Reconstitue le pace actuel à partir de `dailyGoal` (round-trip stable). */
function paceFromGoal(goal: number): PaceKey {
  const found = (Object.entries(PACE_TO_GOAL) as Array<[PaceKey, number]>).find(
    ([, g]) => g === goal,
  );
  return found?.[0] ?? 'std';
}

export function SettingsScreen({ user }: SettingsScreenProps) {
  // L'input garde son brouillon local pendant la frappe pour ne pas écraser
  // ce que tape l'utilisateur si le live query repasse pendant la saisie ;
  // on persiste au blur (et on revient au nom actuel s'il a tout effacé).
  const [draftName, setDraftName] = useState(user.name);

  useEffect(() => {
    setDraftName(user.name);
  }, [user.name]);

  const currentPace = paceFromGoal(user.dailyGoal);

  const commitName = () => {
    const trimmed = draftName.trim();
    if (trimmed === user.name) return;
    void updateProfile({ name: draftName });
  };

  const handlePace = (pace: PaceKey) => {
    if (pace === currentPace) return;
    void updateProfile({ pace });
  };

  return (
    <div className="fade-in absolute inset-0 flex flex-col">
      <TopSpacer />
      <div className="scroll-y flex-1 px-6 pb-32 pt-3">
        <h1 className="pt-2 text-[22px] font-medium tracking-tight">Réglages</h1>
        <p className="mt-1 text-[13px] text-muted">
          Tu peux ajuster ton rythme et ton prénom quand tu veux. Les
          changements s'appliquent immédiatement.
        </p>

        <section className="mt-6">
          <label className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted">
            Prénom
          </label>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitName}
            placeholder="Camille"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-[15px] focus:border-ink/40 focus:outline-none"
          />
        </section>

        <section className="mt-8">
          <label className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-muted">
            Rythme quotidien
          </label>
          <div className="space-y-2.5">
            {PACES.map((p) => {
              const active = currentPace === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePace(p.id)}
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
                    <div className="text-[15px] font-medium">{p.label}</div>
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
        </section>
      </div>
    </div>
  );
}
