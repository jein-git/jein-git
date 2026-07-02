import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
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

type DebugInfo = {
  email: string | null;
  userId: string | null;
  dbRole: string | null;
  dbName: string | null;
  dbTotalTime: number | null;
  fetchError: string | null;
};

export function HomePage() {
  const navigate = useNavigate();
  const { profile, signOut, profileError } = useAuth();

  const [debug, setDebug] = useState<DebugInfo>({
    email: null,
    userId: null,
    dbRole: null,
    dbName: null,
    dbTotalTime: null,
    fetchError: null,
  });

  useEffect(() => {
    const loadDebug = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setDebug(prev => ({ ...prev, fetchError: authError?.message ?? '로그인 정보 없음' }));
        return;
      }

      setDebug(prev => ({ ...prev, email: user.email ?? null, userId: user.id }));

      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, role, total_time')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('[디버그] profiles 조회 오류:', profileError);
        setDebug(prev => ({ ...prev, fetchError: profileError.message }));
        return;
      }

      if (!profileRow) {
        console.warn('[디버그] profiles 행 없음 - user.id:', user.id);
        setDebug(prev => ({ ...prev, fetchError: 'profiles 행을 찾을 수 없습니다' }));
        return;
      }

      console.log('[디버그] profiles 조회 결과:', profileRow);
      setDebug(prev => ({
        ...prev,
        dbRole: profileRow.role ?? null,
        dbName: profileRow.name ?? null,
        dbTotalTime: profileRow.total_time ?? null,
        fetchError: null,
      }));
    };

    loadDebug();
  }, []);

  const balance = profile?.total_time ?? profile?.time_balance ?? 0;
  const isAdmin = profile?.role === 'admin';

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
      <section className="px-6 py-6">
        <h1 className="text-h1 font-bold text-ink mb-2">
          {profile?.name ? `${profile.name}님, 안녕하세요.` : '안녕하세요.'}
        </h1>
        <p className="text-body-lg text-ink-muted">
          오늘도 따뜻한 시간을 나누어 보세요.
        </p>
        {profileError && (
          <div className="mt-3 p-3 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl">
            <p className="text-body text-accent font-medium">{profileError}</p>
          </div>
        )}
      </section>

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
                           ${isLogout ? 'bg-[#FFF0F0] border-[#FFCACA]' : 'bg-surface-card border-line'}`}
              >
                <Icon className={`w-7 h-7 flex-shrink-0 ${isLogout ? 'text-accent' : 'text-primary'}`} />
                <span className={`text-body-lg font-medium text-center leading-tight ${isLogout ? 'text-accent' : 'text-ink'}`}>
                  {menu.label}
                </span>
              </button>
            );
          })}
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="mt-3 w-full border-2 border-primary-dark bg-primary-light
                       rounded-xl min-h-[64px] flex items-center justify-center gap-3
                       active:scale-[0.97] transition-transform"
          >
            <LayoutDashboard className="w-7 h-7 text-primary-dark" />
            <span className="text-h3 font-bold text-primary-dark">관리자 대시보드</span>
          </button>
        )}
      </section>

      {/* 디버그 패널 */}
      {(isAdmin || debug.dbRole === 'admin') && <section className="mx-6 mt-6 p-4 bg-gray-100 border border-gray-300 rounded-xl text-left space-y-1">
        <p className="text-caption font-bold text-gray-500 mb-2">[ 디버그 패널 ]</p>
        <p className="text-body text-gray-800"><span className="font-semibold">현재 로그인 이메일: </span>{debug.email ?? '(없음)'}</p>
        <p className="text-body text-gray-800"><span className="font-semibold">현재 로그인 user.id: </span>{debug.userId ?? '(없음)'}</p>
        <p className="text-body text-gray-800">
          <span className="font-semibold">DB에서 읽은 role: </span>
          <span className={debug.dbRole === 'admin' ? 'text-green-600 font-bold' : 'text-red-500'}>
            {debug.dbRole ?? '(null — DB에 값 없음)'}
          </span>
        </p>
        <p className="text-body text-gray-800"><span className="font-semibold">DB에서 읽은 name: </span>{debug.dbName ?? '(null)'}</p>
        <p className="text-body text-gray-800"><span className="font-semibold">DB에서 읽은 total_time: </span>{debug.dbTotalTime ?? '(null)'}</p>
        <p className="text-body text-gray-800">
          <span className="font-semibold">관리자 버튼 표시 여부: </span>
          <span className={isAdmin ? 'text-green-600 font-bold' : 'text-red-500'}>
            {isAdmin ? '표시 중 (admin)' : '숨김 (admin 아님)'}
          </span>
        </p>
        {debug.fetchError && <p className="text-body text-red-600 font-semibold mt-2">오류: {debug.fetchError}</p>}
        {profileError && <p className="text-body text-red-600">AuthContext 오류: {profileError}</p>}
      </section>}
    </div>
  );
}