import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Sparkles,
  ArrowLeftRight,
  Clock,
  Users,
  User,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

type LayoutProps = {
  children: ReactNode;
};

const NAV_ITEMS = [
  { path: '/home', icon: Home, label: '홈' },
  { path: '/assets', icon: Sparkles, label: '내 자산' },
  { path: '/exchange', icon: ArrowLeftRight, label: '주고받기' },
  { path: '/bank', icon: Clock, label: '시간 통장' },
  { path: '/community', icon: Users, label: '사랑방' },
  { path: '/mypage', icon: User, label: '내 정보' },
];

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      {/* Fixed SOS & Help Buttons */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => navigate('/sos')}
          className="w-14 h-14 rounded-full bg-accent shadow-lg
                     flex items-center justify-center
                     hover:scale-105 active:scale-95 transition-transform"
          aria-label="긴급 도움"
        >
          <AlertCircle className="w-7 h-7 text-white" />
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className="w-14 h-14 rounded-full bg-surface-card shadow-lg border border-line
                     flex items-center justify-center
                     hover:scale-105 active:scale-95 transition-transform"
          aria-label="도움말"
        >
          <HelpCircle className="w-7 h-7 text-ink-muted" />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-line safe-bottom z-40">
        <div className="grid grid-cols-6 gap-0 px-1 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-2
                           min-h-touch transition-colors ${
                             isActive
                               ? 'text-primary'
                               : 'text-ink-muted hover:text-ink'
                           }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-caption mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-surface-card rounded-2xl p-6 m-4 max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-h2 font-bold text-ink mb-4">도움말</h2>
            <div className="space-y-4 text-body-lg text-ink-muted">
              <p>
                <strong className="text-ink">타임뱅크</strong>란 서로에게 도움을 주고받으며
                시간을 교환하는 시스템입니다.
              </p>
              <p>
                <strong className="text-ink">내 자산</strong>: 내가 잘하는 것을 등록해보세요.
              </p>
              <p>
                <strong className="text-ink">주고받기</strong>: 도움을 받거나 줄 수 있습니다.
              </p>
              <p>
                <strong className="text-ink">시간 통장</strong>: 시간 잔액과 거래 내역을
                확인합니다.
              </p>
              <p>
                <strong className="text-ink">긴급 버튼(SOS)</strong>: 갑작스러운 위험 상황에
                사용합니다.
              </p>
              <p className="text-primary font-semibold">
                모든 1시간은 소중합니다. 요리든, 청소든, 대화든 같은 1시간입니다.
              </p>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="btn-primary mt-6"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
