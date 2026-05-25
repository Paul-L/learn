import { Icon, type IconName } from './Icon';

export type TabId = 'home' | 'progress';

interface TabBarProps {
  tab: TabId;
  setTab: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Accueil', icon: 'home' },
  { id: 'progress', label: 'Progression', icon: 'chart' },
];

export function TabBar({ tab, setTab }: TabBarProps) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper via-paper/95 to-paper/0 px-6 pt-2 backdrop-blur-sm"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)' }}
    >
      <div className="flex items-stretch justify-around rounded-2xl border border-line bg-paper shadow-card">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center py-2.5 transition-colors ${
                active ? 'text-ink' : 'text-muted'
              }`}
            >
              <Icon name={t.icon} size={22} stroke={active ? 2 : 1.6} />
              <span className={`mt-0.5 text-[11px] ${active ? 'font-medium' : ''}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
