import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Clock, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';

type Notification = {
  id: string;
  icon: 'match' | 'gratitude' | 'complete' | 'alert';
  content: string;
  time: string;
  isRead: boolean;
};

const STORAGE_KEY = 'ctb_notifications';

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'n_001',
    icon: 'match',
    content: '민서엄마님이 한복 수선을 요청했어요.',
    time: '2시간 전',
    isRead: false,
  },
  {
    id: 'n_002',
    icon: 'gratitude',
    content: '지영씨가 감사 메시지를 보냈어요.',
    time: '어제',
    isRead: false,
  },
  {
    id: 'n_003',
    icon: 'complete',
    content: '안부 전화 활동이 완료되었어요. 1타임이 적립되었어요.',
    time: '3일 전',
    isRead: true,
  },
];

const ICON_MAP = {
  match: { Icon: Bell, color: 'text-primary', bg: 'bg-primary-light' },
  gratitude: { Icon: Heart, color: 'text-accent', bg: 'bg-accent-light' },
  complete: { Icon: CheckCircle, color: 'text-success', bg: 'bg-success-light' },
  alert: { Icon: AlertCircle, color: 'text-warn', bg: 'bg-warn-light' },
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } else {
      setNotifications(DEFAULT_NOTIFICATIONS);
    }
  }, []);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <header className="sticky top-0 bg-surface-base border-b border-line z-10">
        <div className="flex items-center px-4 h-[72px]">
          <button
            onClick={() => navigate(-1)}
            className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                       hover:bg-surface-muted transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-ink" />
          </button>
          <h1 className="text-h3 font-bold text-ink ml-2">알림</h1>
          {unreadCount > 0 && (
            <span className="ml-2 bg-accent text-white text-caption font-bold
                           px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </header>

      {/* Notification List */}
      <main className="p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-14 h-14 mx-auto mb-4 text-ink-subtle" />
            <p className="text-body-lg text-ink-muted">알림이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const { Icon, color, bg } = ICON_MAP[notification.icon];
              return (
                <Card
                  key={notification.id}
                  hoverable
                  onClick={() => markAsRead(notification.id)}
                  className="flex items-start gap-4"
                >
                  <div
                    className={`w-12 h-12 rounded-full ${bg} flex items-center
                               justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-body-lg text-ink">{notification.content}</p>
                    <p className="text-caption text-ink-subtle mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {notification.time}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
