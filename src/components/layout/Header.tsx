import { ReactNode } from 'react';
import { ChevronLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
  unreadNotifications?: number;
};

export function Header({
  title,
  showBack = false,
  right,
  unreadNotifications = 0,
}: HeaderProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-surface-base border-b border-line">
      <div className="flex items-center justify-between px-4 h-[72px]">
        {/* Left */}
        <div className="flex items-center min-w-touch">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                         hover:bg-surface-muted transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-ink" />
            </button>
          ) : profile?.name ? (
            <span className="text-h3 font-bold text-ink">{profile.name} 님</span>
          ) : (
            <span className="text-h3 font-bold text-primary">품터</span>
          )}
        </div>

        {/* Center */}
        {title && (
          <h1 className="text-h3 font-bold text-ink absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        )}

        {/* Right: SOS + Notification */}
        <div className="flex items-center gap-2">
          {right}
          <button
            onClick={() => navigate('/notifications')}
            className="relative min-h-12 min-w-12 px-3 bg-primary-light rounded-xl
                       flex items-center justify-center
                       active:scale-95 transition-transform"
            aria-label="알림"
          >
            <Bell className="w-6 h-6 text-primary-dark" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent
                             rounded-full text-white text-caption font-bold
                             flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
