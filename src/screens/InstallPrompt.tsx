import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { TopSpacer } from '../ui/SafeArea';
import type { PwaInstallState } from '../lib/pwa';

interface InstallPromptProps {
  pwa: PwaInstallState;
  onSkip: () => void;
  /** Appelé après une install acceptée (transition fluide vers l'onboarding). */
  onInstalled: () => void;
}

/**
 * Glyphe iOS « Partager » (carré + flèche vers le haut), inline pour ne pas
 * polluer Icon.tsx avec un asset à usage unique.
 */
function IosShareGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12M12 3l-4 4M12 3l4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Glyphe « + dans un carré » (raccourci d'écran d'accueil iOS). */
function PlusSquareGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function InstallPrompt({ pwa, onSkip, onInstalled }: InstallPromptProps) {
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    if (installing) return;
    setInstalling(true);
    try {
      const accepted = await pwa.install();
      if (accepted) onInstalled();
    } finally {
      setInstalling(false);
    }
  };

  const showIosInstructions = pwa.platform === 'ios' && !pwa.canPrompt;
  const showGenericInstructions = !pwa.canPrompt && !showIosInstructions;

  return (
    <div className="fade-in absolute inset-0 flex flex-col">
      <TopSpacer />
      <div className="flex flex-1 flex-col justify-between px-7 pb-10 pt-8">
        <div>
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink">
              <div className="h-3 w-3 rounded-sm bg-accent" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">Pareto English</span>
          </div>

          <h1
            className="mb-4 text-[30px] font-medium leading-[1.1] tracking-tight text-ink"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Installe l'app
            <br />
            sur ton appareil.
          </h1>
          <p
            className="max-w-[320px] text-[14.5px] leading-relaxed text-muted"
            style={{ textWrap: 'pretty' } as React.CSSProperties}
          >
            Pareto English est une application autonome : une fois installée,
            elle fonctionne hors-ligne, sans onglet, depuis l'écran d'accueil.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentTint text-accent">
                  <Icon name="wave" size={18} />
                </div>
                <span className="text-[11.5px] text-muted">Hors-ligne</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentTint text-accent">
                  <Icon name="zap" size={18} />
                </div>
                <span className="text-[11.5px] text-muted">Démarrage rapide</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accentTint text-accent">
                  <Icon name="home" size={18} />
                </div>
                <span className="text-[11.5px] text-muted">Écran d'accueil</span>
              </div>
            </div>
          </div>

          {pwa.canPrompt && (
            <button
              onClick={() => void handleInstall()}
              disabled={installing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[15px] font-medium text-bone transition active:scale-[0.99] disabled:opacity-60"
            >
              {installing ? 'Installation…' : 'Installer Pareto English'}
              {!installing && <Icon name="arrow-right" size={18} />}
            </button>
          )}

          {showIosInstructions && (
            <div className="rounded-2xl border border-accent/20 bg-accentTint/60 p-4">
              <div className="mb-3 text-[10.5px] uppercase tracking-[0.16em] text-accent2">
                Sur iPhone / iPad
              </div>
              <ol className="space-y-2.5 text-[13.5px] text-ink/85">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-muted">1.</span>
                  <span className="flex-1">
                    Touche{' '}
                    <span className="inline-flex translate-y-[3px] items-center px-0.5 text-accent">
                      <IosShareGlyph size={16} />
                    </span>{' '}
                    en bas de l'écran (le bouton Partager).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-muted">2.</span>
                  <span className="flex-1">
                    Fais défiler et choisis{' '}
                    <b className="font-medium text-ink">Sur l'écran d'accueil</b>{' '}
                    <span className="inline-flex translate-y-[3px] items-center px-0.5 text-accent">
                      <PlusSquareGlyph size={16} />
                    </span>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-muted">3.</span>
                  <span className="flex-1">
                    Ouvre l'app depuis sa nouvelle icône — elle se lance en plein
                    écran, sans la barre Safari.
                  </span>
                </li>
              </ol>
            </div>
          )}

          {showGenericInstructions && (
            <div className="rounded-2xl border border-line bg-paper p-4 text-[13.5px] leading-relaxed text-ink/80">
              Dans la barre d'adresse de ton navigateur, cherche l'icône{' '}
              <b className="font-medium text-ink">Installer</b> (souvent un petit
              écran avec une flèche) ou ouvre le menu et choisis{' '}
              <b className="font-medium text-ink">Installer l'application</b>.
            </div>
          )}

          <button
            onClick={onSkip}
            className="block w-full py-2 text-center text-[12.5px] text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Continuer dans le navigateur
          </button>
        </div>
      </div>
    </div>
  );
}
