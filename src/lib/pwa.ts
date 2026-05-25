import { useEffect, useState } from 'react';

/**
 * Détection du mode d'exécution PWA + plateforme + prompt d'installation.
 *
 * Réalités à garder en tête :
 *  - Le programmatic install (`prompt()`) n'existe QUE sur Chromium
 *    (Chrome, Edge, Samsung Internet, …). iOS Safari et Firefox n'exposent
 *    rien — il faut afficher des instructions manuelles.
 *  - L'event `beforeinstallprompt` est tiré une seule fois et tôt dans la
 *    vie de la page ; on le capte au module-load pour ne pas le rater.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type Platform = 'ios' | 'android' | 'desktop';

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS Safari : flag legacy non-standard.
  const navStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  if (navStandalone === true) return true;
  return window.matchMedia('(display-mode: standalone)').matches;
}

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'desktop';
  const ua = window.navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

let capturedPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // empêche la mini-infobar Chrome
    capturedPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    capturedPrompt = null;
    listeners.forEach((l) => l());
  });
}

export interface PwaInstallState {
  /** L'app est-elle ouverte en mode standalone (PWA installée) ? */
  isStandalone: boolean;
  platform: Platform;
  /** Vrai si le navigateur peut déclencher un prompt d'install programmatique. */
  canPrompt: boolean;
  /** Déclenche le prompt natif. Renvoie `true` si l'utilisateur a accepté. */
  install: () => Promise<boolean>;
}

export function usePwaInstall(): PwaInstallState {
  const [standalone, setStandalone] = useState(isStandalone);
  const [canPrompt, setCanPrompt] = useState(() => capturedPrompt !== null);

  useEffect(() => {
    const update = () => {
      setCanPrompt(capturedPrompt !== null);
      setStandalone(isStandalone());
    };
    listeners.add(update);

    const mql = window.matchMedia('(display-mode: standalone)');
    mql.addEventListener('change', update);

    return () => {
      listeners.delete(update);
      mql.removeEventListener('change', update);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!capturedPrompt) return false;
    await capturedPrompt.prompt();
    const choice = await capturedPrompt.userChoice;
    capturedPrompt = null;
    listeners.forEach((l) => l());
    return choice.outcome === 'accepted';
  };

  return {
    isStandalone: standalone,
    platform: detectPlatform(),
    canPrompt,
    install,
  };
}
