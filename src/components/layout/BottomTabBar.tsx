import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, ListChecks, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: '홈', icon: Home },
  { path: '/bankbook', label: '내 시간', icon: Clock },
  { path: '/matches', label: '도움 연결', icon: ListChecks },
  { path: '/me', label: '내 정보', icon: User },
];

export function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-line safe-bottom z-40">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-4
                         min-h-touch transition-colors relative ${
                           isActive ? 'text-primary' : 'text-ink-muted'
                         }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
              <Icon className="w-7 h-7 mb-1" />
              <span className="text-body font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
