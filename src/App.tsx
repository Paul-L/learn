import { Fragment, useEffect, useState } from 'react';
import { TabBar, type TabId } from './ui/TabBar';
import { InstallPrompt } from './screens/InstallPrompt';
import { OnboardWelcome } from './screens/OnboardWelcome';
import { OnboardSetup } from './screens/OnboardSetup';
import { HomeScreen } from './screens/Home';
import { Session, type ReviewedItemSummary, type SessionFinishResult } from './screens/Session';
import { Recap } from './screens/Recap';
import { ProgressScreen } from './screens/Progress';
import { SettingsScreen } from './screens/Settings';
import {
  DEFAULT_USER_ID,
  completeOnboarding,
  ensureDefaultUser,
  seedCorpus,
} from './db/db';
import { useCurrentUser } from './db/hooks';
import { usePwaInstall } from './lib/pwa';
import type { PaceKey } from './srs/stats';

type Route = 'install' | 'onboard-welcome' | 'onboard-setup' | 'app' | 'session' | 'recap';

interface RecapData {
  items: number;
  correct: number;
  xp: number;
  prevCoverage: number;
  newCoverage: number;
  streak: number;
  reviewedItems: ReviewedItemSummary[];
}

export default function App() {
  // Le user vient de Dexie via useLiveQuery : toute mise à jour (onboarding,
  // changement de rythme…) propage automatiquement sans refetch manuel.
  const user = useCurrentUser();
  const pwa = usePwaInstall();
  const [route, setRoute] = useState<Route | null>(null);
  const [tab, setTab] = useState<TabId>('home');
  const [draftName, setDraftName] = useState('');
  const [draftPace, setDraftPace] = useState<PaceKey>('std');
  const [submitting, setSubmitting] = useState(false);
  const [recapData, setRecapData] = useState<RecapData | null>(null);
  /** L'utilisateur a explicitement décidé de continuer dans le navigateur. */
  const [installSkipped, setInstallSkipped] = useState(false);

  // Amorçage : seed du corpus + création du profil par défaut s'il manque.
  // Le user lui-même est ensuite observé par useCurrentUser().
  useEffect(() => {
    void (async () => {
      await seedCorpus();
      await ensureDefaultUser();
    })();
  }, []);

  // Premier rendu où le user est connu : choisir la route d'entrée et
  // pré-remplir le brouillon d'onboarding. Si on n'est pas en mode PWA et
  // que l'utilisateur n'a pas explicitement skip, on l'invite à installer.
  useEffect(() => {
    if (!user || route !== null) return;
    setDraftName(user.name);
    const needsInstall = !pwa.isStandalone && !installSkipped;
    if (needsInstall) {
      setRoute('install');
    } else {
      setRoute(user.onboardedAt ? 'app' : 'onboard-welcome');
    }
  }, [user, route, pwa.isStandalone, installSkipped]);

  // Si l'utilisateur installe l'app pendant qu'il est sur l'écran d'install
  // (mode standalone détecté après coup), on enchaîne sur l'onboarding.
  useEffect(() => {
    if (route === 'install' && pwa.isStandalone) {
      setRoute(user?.onboardedAt ? 'app' : 'onboard-welcome');
    }
  }, [route, pwa.isStandalone, user?.onboardedAt]);

  const leaveInstallGate = () => {
    setInstallSkipped(true);
    setRoute(user?.onboardedAt ? 'app' : 'onboard-welcome');
  };

  const handleOnboardDone = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await completeOnboarding(draftName, draftPace);
      setRoute('app');
      setTab('home');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSessionFinish = (result: SessionFinishResult) => {
    setRecapData({
      items: result.items,
      correct: result.correct,
      xp: 12 + result.correct * 4,
      prevCoverage: result.prevCoverage,
      newCoverage: result.newCoverage,
      streak: result.streak,
      reviewedItems: result.reviewedItems,
    });
    setRoute('recap');
  };

  if (!user || route === null) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="text-[12px] uppercase tracking-[0.18em] text-muted">Initialisation…</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {route === 'install' && (
        <InstallPrompt
          pwa={pwa}
          onSkip={leaveInstallGate}
          onInstalled={leaveInstallGate}
        />
      )}
      {route === 'onboard-welcome' && (
        <OnboardWelcome onNext={() => setRoute('onboard-setup')} />
      )}
      {route === 'onboard-setup' && (
        <OnboardSetup
          name={draftName}
          setName={setDraftName}
          pace={draftPace}
          setPace={setDraftPace}
          onBack={() => setRoute('onboard-welcome')}
          onDone={() => void handleOnboardDone()}
          submitting={submitting}
        />
      )}
      {route === 'app' && (
        <Fragment>
          {tab === 'home' && (
            <HomeScreen user={user} onStartSession={() => setRoute('session')} />
          )}
          {tab === 'progress' && <ProgressScreen userId={DEFAULT_USER_ID} />}
          {tab === 'settings' && <SettingsScreen user={user} />}
          <TabBar tab={tab} setTab={setTab} />
        </Fragment>
      )}
      {route === 'session' && (
        <Session
          user={user}
          onClose={() => setRoute('app')}
          onFinish={handleSessionFinish}
          onOpenSettings={() => {
            setRoute('app');
            setTab('settings');
          }}
        />
      )}
      {route === 'recap' && recapData && (
        <Recap
          items={recapData.items}
          correct={recapData.correct}
          xp={recapData.xp}
          prevCoverage={recapData.prevCoverage}
          newCoverage={recapData.newCoverage}
          streak={recapData.streak}
          reviewedItems={recapData.reviewedItems}
          userId={user.id}
          dailyGoal={user.dailyGoal}
          onDone={() => {
            setRoute('app');
            setTab('home');
          }}
          onContinue={() => setRoute('session')}
        />
      )}
    </div>
  );
}
