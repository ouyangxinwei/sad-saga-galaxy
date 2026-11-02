import { Link, useLocation } from 'react-router-dom';
import GameIcon from './GameIcon';
import { useGame } from '@/lib/GameContext';

const ITEMS = [
  { to: '/', icon: 'Map', key: 'nav.home' },
  { to: '/formation', icon: 'Users', key: 'nav.formation' },
  { to: '/synthesis', icon: 'Sparkles', key: 'nav.synthesis' },
  { to: '/forge', icon: 'Hammer', key: 'nav.forge' },
  { to: '/settings', icon: 'Settings2', key: 'nav.settings' },
];

export default function BottomNav() {
  const { t } = useGame();
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] px-3 pb-3 pt-2">
      <div className="saga-panel mx-auto flex max-w-[620px] items-center justify-between gap-1 rounded-2xl px-2 py-2">
        {ITEMS.map((item) => {
          const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`tap flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] tracking-wide ${
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GameIcon name={item.icon} className="h-[18px] w-[18px]" />
              <span className="whitespace-nowrap">{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}