import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HandHeart,
  HandHelping,
  Clock,
  ListChecks,
  Phone,
  Newspaper,
  Flag,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { profile, signOut, profileError } = useAuth();

  // 잔액: Supabase profiles.time_balance 실제 값
  const balance = profile?.time_balance ?? 0;
  // 관리자 여부: public.profiles.role = 'admin'
  const isAdmin = profile?.role === 'admin';

  // 퀵 메뉴: 용어 개선 + 아이콘/글자 크기 증가
  const quickMenus = [
    { label: '내 시간', icon: Clock, path: '/bankbook' },
    { label: '도움 연결', icon: ListChecks, path: '/matches' },
    { label: '공지·후기', icon: Newspaper, path: '/community' },
    { label: '전화 도움', icon: Phone, action: 'phone-help' as const },
    { label: '신고하기', icon: Flag, path: '/report' },
    { label: '로그아웃', icon: LogOut, action: 'logout' as const },
  ];

  return (
    <div className="pb-6">
      {/* 인사 섹션 */}
      <section className="px-6 py-6">
        <h1 className="text-h1 font-bold text-ink mb-2">
          {profile?.name ? `${profile.name}님, 안녕하세요.` : '안녕하세요.'}
        </h1>
        <p className="text-body-lg text-ink-muted">
          오늘도 따뜻한 시간을 나누어 보세요.
        </p>

        {/* 프로필 조회 오류 배너 */}
        {profileError && (
          <div className="mt-3 p-3 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl">
            <p className="text-body text-accent font-medium">{profileError}</p>
          </div>
        )}
      </section>

      {/* 내 시간 Hero */}
      <section className="px-6 mb-6">
        <button
          onClick={() => navigate('/bankbook')}
          className="w-full bg-primary text-white rounded-2xl p-8 text-center
                     active:scale-[0.98] transition-transform shadow-lg"
        >
          <p className="text-body-lg opacity-90 mb-3">내가 쌓은 시간</p>
          <div className="flex items-end justify-center gap-3 mb-4">
            <span className="text-[72px] leading-none font-bold tracking-tight">
              {Number.isInteger(balance) ? balance : balance.toFixed(1)}
            </span>
            <span className="text-h1 opacity-80 pb-2">타임</span>
          </div>
          <p className="text-body-lg opacity-80">눌러서 사용 내역 보기</p>
        </button>
      </section>

      {/* 핵심 두 버튼 */}
      <section className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/help/offer')}
            className="bg-primary-light border-2 border-primary rounded-2xl
                       min-h-[148px] p-6 flex flex-col items-center justify-center
                       active:scale-[0.97] transition-transform"
          >
            <HandHeart className="w-12 h-12 text-primary mb-3" />
            <span className="text-h2 font-bold text-primary-dark">도움 주기</span>
            <span className="text-body-lg text-ink-muted mt-1.5">이웃을 도와요</span>
          </button>

          <button
            onClick={() => navigate('/help/request')}
            className="bg-primary-light border-2 border-primary rounded-2xl
                       min-h-[148px] p-6 flex flex-col items-center justify-center
                       active:scale-[0.97] transition-transform"
          >
            <HandHelping className="w-12 h-12 text-primary mb-3" />
            <span className="text-h2 font-bold text-primary-dark">도움 받기</span>
            <span className="text-body-lg text-ink-muted mt-1.5">도움이 필요해요</span>
          </button>
        </div>
      </section>

      {/* 퀵 메뉴 */}
      <section className="px-6">
        <div className="grid grid-cols-3 gap-3">
          {quickMenus.map((menu) => {
            const Icon = menu.icon;
            const isLogout = 'action' in menu && menu.action === 'logout';

            const handleClick = async () => {
              if ('action' in menu) {
                if (menu.action === 'phone-help') {
                  window.dispatchEvent(new CustomEvent('open-phone-help'));
                } else if (menu.action === 'logout') {
                  await signOut();
                }
              } else if (menu.path) {
                navigate(menu.path);
              }
            };

            return (
              <button
                key={menu.label}
                onClick={handleClick}
                className={`border rounded-xl min-h-[80px] flex flex-col items-center
                           justify-center gap-2 active:scale-[0.97] transition-transform px-2
                           ${isLogout
                             ? 'bg-[#FFF0F0] border-[#FFCACA]'
                             : 'bg-surface-card border-line'
                           }`}
              >
                <Icon
                  className={`w-7 h-7 flex-shrink-0 ${
                    isLogout ? 'text-accent' : 'text-primary'
                  }`}
                />
                <span
                  className={`text-body-lg font-medium text-center leading-tight ${
                    isLogout ? 'text-accent' : 'text-ink'
                  }`}
                >
                  {menu.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 관리자 메뉴: admin 사용자에게만 표시 */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="mt-3 w-full border-2 border-primary-dark bg-primary-light
                       rounded-xl min-h-[64px] flex items-center justify-center gap-3
                       active:scale-[0.97] transition-transform"
          >
            <LayoutDashboard className="w-7 h-7 text-primary-dark" />
            <span className="text-h3 font-bold text-primary-dark">
              관리자 대시보드
            </span>
          </button>
        )}
      </section>
    </div>
  );
}
