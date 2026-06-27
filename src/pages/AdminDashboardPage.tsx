import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Loader2, AlertCircle, Users, Clock, CheckCircle, ListChecks, CalendarCheck, ArrowUp, ArrowDown } from 'lucide-react';

// RPC 반환 타입
type AdminStatsSuccess = {
  success: true;
  total_members: number;
  open_requests: number;
  matched_count: number;
  completed_count: number;
  this_month_completed: number;
  total_earned: number;
  total_spent: number;
};

type AdminStatsError = {
  success: false;
  error: string;
};

type AdminStatsResult = AdminStatsSuccess | AdminStatsError;

// 통계 카드 컴포넌트: 숫자를 크게 표시
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit?: string;
  color: string; // Tailwind 색상 클래스 (text-*)
}) {
  return (
    <div className="bg-surface-card border border-line rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-6 h-6 ${color}`} />
        <p className="text-body text-ink-muted font-medium">{label}</p>
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-[40px] leading-none font-bold ${color}`}>
          {value}
        </span>
        {unit && (
          <span className="text-body-lg text-ink-muted pb-1">{unit}</span>
        )}
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [stats, setStats] = useState<AdminStatsSuccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 관리자 여부 확인 (프로필이 아직 로드 중이면 대기)
  const isAdmin = profile?.role === 'admin';
  const profileLoaded = profile !== null;

  useEffect(() => {
    // 프로필이 아직 null이면 대기
    if (!profileLoaded) return;

    // 비관리자는 RPC 호출하지 않고 즉시 오류 처리
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      const { data: result, error: rpcError } = await supabase.rpc(
        'get_admin_dashboard_stats'
      );

      setLoading(false);

      if (rpcError) {
        setError('통계를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const res = result as AdminStatsResult;

      if (!res?.success) {
        // 서버 측 권한 오류 등
        setError((res as AdminStatsError).error ?? '통계를 불러올 수 없습니다.');
        return;
      }

      setStats(res as AdminStatsSuccess);
    };

    fetchStats();
  }, [isAdmin, profileLoaded]);

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-surface-base border-b border-line
                         flex items-center px-4 h-[72px]">
        <button
          onClick={() => navigate(-1)}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                     hover:bg-surface-muted transition-colors mr-2"
        >
          <ChevronLeft className="w-8 h-8 text-ink" />
        </button>
        <h1 className="text-h3 font-bold text-ink">관리자 대시보드</h1>
        <button
          onClick={() => navigate('/')}
          className="ml-auto text-body-lg text-primary font-semibold px-3 py-2"
        >
          홈으로
        </button>
      </header>

      <main className="flex-1 px-6 py-6 pb-10">
        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-body-lg text-ink-muted">통계를 불러오는 중...</p>
          </div>
        )}

        {/* 권한 없음 또는 오류 */}
        {!loading && (error || !isAdmin) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-16 h-16 text-warn mb-5" />
            <p className="text-h3 font-bold text-ink mb-3">
              {!isAdmin
                ? '관리자만 접근할 수 있습니다.'
                : error}
            </p>
            <p className="text-body-lg text-ink-muted mb-8">
              {!isAdmin && '이 화면은 관리자 계정에서만 볼 수 있습니다.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="min-h-touch px-8 rounded-xl bg-primary text-white
                         font-semibold text-body-lg active:scale-[0.98] transition-transform"
            >
              홈으로 가기
            </button>
          </div>
        )}

        {/* 통계 카드 그리드 */}
        {!loading && stats && (
          <div className="space-y-6">
            {/* 섹션: 회원 */}
            <section>
              <h2 className="text-h3 font-bold text-ink mb-3">회원 현황</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Users}
                  label="전체 회원"
                  value={stats.total_members}
                  unit="명"
                  color="text-primary"
                />
              </div>
            </section>

            {/* 섹션: 돌봄 현황 */}
            <section>
              <h2 className="text-h3 font-bold text-ink mb-3">돌봄 현황</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={Clock}
                  label="요청 중인 돌봄"
                  value={stats.open_requests}
                  unit="건"
                  color="text-warn"
                />
                <StatCard
                  icon={ListChecks}
                  label="도움 연결"
                  value={stats.matched_count}
                  unit="건"
                  color="text-primary"
                />
                <StatCard
                  icon={CheckCircle}
                  label="돌봄 완료"
                  value={stats.completed_count}
                  unit="건"
                  color="text-success"
                />
                <StatCard
                  icon={CalendarCheck}
                  label="이번 달 완료"
                  value={stats.this_month_completed}
                  unit="건"
                  color="text-primary"
                />
              </div>
            </section>

            {/* 섹션: 시간 현황 */}
            <section>
              <h2 className="text-h3 font-bold text-ink mb-3">시간 현황</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={ArrowUp}
                  label="전체 적립 시간"
                  value={
                    Number.isInteger(stats.total_earned)
                      ? stats.total_earned
                      : Number(stats.total_earned).toFixed(1)
                  }
                  unit="타임"
                  color="text-success"
                />
                <StatCard
                  icon={ArrowDown}
                  label="전체 사용 시간"
                  value={
                    Number.isInteger(stats.total_spent)
                      ? stats.total_spent
                      : Number(stats.total_spent).toFixed(1)
                  }
                  unit="타임"
                  color="text-accent"
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
