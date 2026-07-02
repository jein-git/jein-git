import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatTimes } from '../lib/formatTimes';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Loader2,
  AlertCircle,
  HandHeart,
  HandHelping,
  XCircle,
} from 'lucide-react';

// KST 기준으로 도움 시작 시간 이전인지 확인
function isBeforeStart(dateStr: string | null, startTime: string | null): boolean {
  if (!dateStr) return true;
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const todayKST = kstNow.toISOString().split('T')[0];
  if (dateStr > todayKST) return true;
  if (dateStr < todayKST) return false;
  // 오늘 — 시간 비교
  if (!startTime) return true;
  const [h, m] = startTime.split(':').map(Number);
  return h * 60 + m > kstNow.getUTCHours() * 60 + kstNow.getUTCMinutes();
}

// care_matches + joined care_requests 조회 결과 타입
type CareMatch = {
  id: string;
  request_id: string;
  requester_id: string;
  helper_id: string;
  status: string;
  completed_at: string | null;
  created_at: string;
  care_requests: {
    title: string;
    category: string;
    location: string;
    requested_date: string | null;
    start_time: string | null;
    end_time: string | null;
    requested_hours: number;
  } | null;
};

// 상태 → 한국어 + 스타일
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  matched:   { label: '도움 연결됨', className: 'bg-primary-light text-primary-dark' },
  completed: { label: '도움 완료',   className: 'bg-success-light text-success' },
  cancelled: { label: '취소됨',      className: 'bg-line text-ink-muted' },
};

const CATEGORY_LABELS: Record<string, string> = {
  hospital: '병원 동행', shopping: '장보기', talking: '말벗',
  repairing: '수리', moving: '이동 도움', cleaning: '청소',
  cooking: '식사 준비', other: '기타',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  hospital: '🏥', shopping: '🛒', talking: '💬', repairing: '🔧',
  moving: '🚗', cleaning: '🧹', cooking: '🍱', other: '📋',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '날짜 미정';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short',
  });
}

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start && !end) return '시간 미정';
  if (start && end) return `${start.slice(0, 5)} ~ ${end.slice(0, 5)}`;
  if (start) return `${start.slice(0, 5)} 이후`;
  return `${end!.slice(0, 5)}까지`;
}

// 개별 매칭 카드 컴포넌트
function MatchCard({
  match,
  role,
  onComplete,
  completing,
  onCancelRequest,
}: {
  match: CareMatch;
  role: 'provider' | 'requester';
  onComplete: (matchId: string) => void;
  completing: string | null;
  onCancelRequest: (matchId: string) => void;
}) {
  const req = match.care_requests;
  const statusConfig = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.cancelled;
  const categoryLabel = CATEGORY_LABELS[req?.category ?? ''] ?? (req?.category ?? '');
  const categoryEmoji = CATEGORY_EMOJIS[req?.category ?? ''] ?? '📋';
  const isCompleting = completing === match.id;
  const canCancel = match.status === 'matched' &&
    isBeforeStart(req?.requested_date ?? null, req?.start_time ?? null);

  return (
    <Card className="space-y-4">
      {/* 카테고리 + 제목 + 상태 뱃지 */}
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{categoryEmoji}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-h3 font-bold text-ink leading-snug flex-1">
              {req?.title ?? '제목 없음'}
            </h3>
            <span className={`flex-shrink-0 text-caption font-semibold px-2.5 py-1 rounded-full
              ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          </div>
          <span className="text-caption text-primary bg-primary-light px-2 py-0.5 rounded-full">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* 세부 정보 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-body text-ink-muted">
          <Calendar className="w-5 h-5 flex-shrink-0 text-primary" />
          <span>{formatDate(req?.requested_date ?? null)}</span>
        </div>

        <div className="flex items-center gap-2 text-body text-ink-muted">
          <Clock className="w-5 h-5 flex-shrink-0 text-primary" />
          <span>
            {formatTimeRange(req?.start_time ?? null, req?.end_time ?? null)}
            {' · '}
            {formatTimes(req?.requested_hours ?? 0)}
          </span>
        </div>

        {req?.location && (
          <div className="flex items-center gap-2 text-body text-ink-muted">
            <MapPin className="w-5 h-5 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">{req.location}</span>
          </div>
        )}
      </div>

      {/* 역할 안내 */}
      <p className="text-caption text-ink-subtle">
        {role === 'provider' ? '내가 도움을 제공하는 요청' : '내가 도움을 받는 요청'}
      </p>

      {/* 완료 버튼 (matched 상태일 때만) */}
      {match.status === 'matched' && (
        <>
          <button
            onClick={() => onComplete(match.id)}
            disabled={isCompleting}
            className="w-full min-h-touch flex items-center justify-center gap-2
                       rounded-xl border-2 border-success bg-success-light
                       text-success font-semibold text-body-lg
                       active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all"
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                도움이 끝났어요
              </>
            )}
          </button>

          {/* 취소 버튼 또는 취소 불가 안내 */}
          {canCancel ? (
            <button
              onClick={() => onCancelRequest(match.id)}
              className="w-full min-h-touch flex items-center justify-center gap-2
                         rounded-xl border-2 border-accent/40 bg-[#FFF0F0]
                         text-accent font-semibold text-body-lg
                         active:scale-[0.98] transition-all"
            >
              <XCircle className="w-5 h-5" />
              도움 연결 취소
            </button>
          ) : (
            <p className="text-body text-ink-muted text-center py-1">
              시작 시간이 지나 취소할 수 없습니다.
            </p>
          )}
        </>
      )}
    </Card>
  );
}

export function MyMatchesPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [matches, setMatches] = useState<CareMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 완료 처리 상태
  const [completing, setCompleting] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completeSuccess, setCompleteSuccess] = useState(false);

  // 취소 처리 상태
  const [cancelConfirmMatchId, setCancelConfirmMatchId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // 내 매칭 목록 불러오기
  const fetchMatches = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setFetchError(null);

    const { data, error: dbError } = await supabase
      .from('care_matches')
      .select(`
        id, request_id, requester_id, helper_id, status, completed_at, created_at,
        care_requests (
          title, category, location, requested_date, start_time, end_time, requested_hours
        )
      `)
      .or(`helper_id.eq.${user.id},requester_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (dbError) {
      setFetchError('목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      setMatches((data as CareMatch[]) ?? []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // 완료 처리: RPC 함수 호출
  const handleComplete = async (matchId: string) => {
    if (completing) return;

    setCompleting(matchId);
    setCompleteError(null);
    setCompleteSuccess(false);

    const { data: result, error: rpcError } = await supabase.rpc(
      'complete_care_match_with_time',
      { p_match_id: matchId }
    );

    setCompleting(null);

    if (rpcError) {
      setCompleteError('완료 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!result?.success) {
      setCompleteError(result?.error ?? '완료 처리에 실패했습니다.');
      return;
    }

    // 완료 성공 → 프로필 잔액 갱신 + 목록 갱신 + 안내 메시지 표시
    setCompleteSuccess(true);
    setCancelSuccess(false);
    refreshProfile();
    fetchMatches();
  };

  // 취소 처리: RPC 함수 호출
  const handleCancel = async () => {
    if (!cancelConfirmMatchId || cancelling) return;

    setCancelling(true);
    setCancelError(null);

    const { data: result, error: rpcError } = await supabase.rpc(
      'cancel_care_match_before_start',
      { p_match_id: cancelConfirmMatchId }
    );

    setCancelling(false);

    if (rpcError) {
      setCancelError('취소 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setCancelConfirmMatchId(null);
      return;
    }

    if (!result?.success) {
      setCancelError(result?.error ?? '취소할 수 없습니다.');
      setCancelConfirmMatchId(null);
      return;
    }

    // 취소 성공 → 모달 닫고 목록 갱신
    setCancelConfirmMatchId(null);
    setCancelSuccess(true);
    setCompleteSuccess(false);
    fetchMatches();
  };

  // 내가 도움을 주는 매칭
  const givingMatches = matches.filter((m) => m.helper_id === user?.id);
  // 내가 도움을 받는 매칭
  const receivingMatches = matches.filter((m) => m.requester_id === user?.id);

  return (
    <div className="min-h-screen bg-surface-base">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-surface-base border-b border-line flex items-center px-4 h-[72px]">
        <button
          onClick={() => navigate(-1)}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                     hover:bg-surface-muted transition-colors mr-2"
        >
          <ChevronLeft className="w-8 h-8 text-ink" />
        </button>
        <h1 className="text-h3 font-bold text-ink">내 도움 연결 내역</h1>
        <button
          onClick={() => navigate('/')}
          className="ml-auto text-body-lg text-primary font-semibold px-3 py-2"
        >
          홈으로
        </button>
      </header>

      <div className="px-6 py-6 pb-24">
        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-body-lg text-ink-muted">불러오는 중...</p>
          </div>
        )}

        {/* 데이터 오류 */}
        {!loading && fetchError && (
          <Card variant="muted" className="flex items-start gap-3 py-5">
            <AlertCircle className="w-6 h-6 text-warn flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-body font-semibold text-ink mb-1">불러오기 실패</p>
              <p className="text-body text-ink-muted">{fetchError}</p>
              <button
                onClick={fetchMatches}
                className="mt-3 text-body-lg text-primary font-semibold"
              >
                다시 시도
              </button>
            </div>
          </Card>
        )}

        {/* 완료 처리 오류 */}
        {completeError && (
          <div className="mb-4 p-4 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-body text-accent">{completeError}</p>
          </div>
        )}

        {/* 취소 처리 오류 */}
        {cancelError && (
          <div className="mb-4 p-4 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-body text-accent">{cancelError}</p>
          </div>
        )}

        {/* 완료 처리 성공 안내 */}
        {completeSuccess && (
          <Card variant="muted" className="mb-4 flex items-start gap-3 py-4">
            <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
            <p className="text-body text-ink">
              도움이 완료되었습니다.{' '}
              <strong className="text-primary">시간이 반영되었습니다.</strong>
            </p>
          </Card>
        )}

        {/* 취소 성공 안내 */}
        {cancelSuccess && (
          <Card variant="muted" className="mb-4 flex items-start gap-3 py-4">
            <XCircle className="w-6 h-6 text-ink-muted flex-shrink-0 mt-0.5" />
            <p className="text-body text-ink">
              도움 연결이 취소되었습니다.
            </p>
          </Card>
        )}

        {/* 빈 상태 */}
        {!loading && !fetchError && matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HandHeart className="w-16 h-16 text-ink-subtle mb-5" />
            <p className="text-h3 font-bold text-ink mb-2">도움 연결 내역이 없습니다</p>
            <p className="text-body-lg text-ink-muted mb-8">
              도움을 주거나 받으면 여기에 표시됩니다.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => navigate('/help/offer')}
                className="w-full min-h-touch rounded-xl bg-primary text-white
                           font-semibold text-body-lg active:scale-[0.98] transition-transform"
              >
                도움 주러 가기
              </button>
              <button
                onClick={() => navigate('/help/request')}
                className="w-full min-h-touch rounded-xl border-2 border-primary
                           text-primary-dark font-semibold text-body-lg
                           active:scale-[0.98] transition-transform"
              >
                도움 요청하기
              </button>
            </div>
          </div>
        )}

        {/* 매칭 목록 */}
        {!loading && !fetchError && matches.length > 0 && (
          <div className="space-y-8">
            {/* ── 내가 도움 주는 요청 ─────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <HandHeart className="w-6 h-6 text-primary" />
                <h2 className="text-h3 font-bold text-ink">내가 도움 주는 요청</h2>
                <span className="ml-auto text-body text-ink-muted">
                  {givingMatches.length}건
                </span>
              </div>

              {givingMatches.length === 0 ? (
                <Card variant="muted" className="text-center py-6">
                  <p className="text-body text-ink-muted">아직 수락한 요청이 없습니다.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {givingMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      role="provider"
                      onComplete={handleComplete}
                      completing={completing}
                      onCancelRequest={setCancelConfirmMatchId}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── 내가 도움 받는 요청 ─────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <HandHelping className="w-6 h-6 text-primary" />
                <h2 className="text-h3 font-bold text-ink">내가 도움 받는 요청</h2>
                <span className="ml-auto text-body text-ink-muted">
                  {receivingMatches.length}건
                </span>
              </div>

              {receivingMatches.length === 0 ? (
                <Card variant="muted" className="text-center py-6">
                  <p className="text-body text-ink-muted">아직 매칭된 요청이 없습니다.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {receivingMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      role="requester"
                      onComplete={handleComplete}
                      completing={completing}
                      onCancelRequest={setCancelConfirmMatchId}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* ── 취소 확인 모달 ── */}
      <Modal
        isOpen={cancelConfirmMatchId !== null}
        onClose={() => !cancelling && setCancelConfirmMatchId(null)}
        showClose={false}
        size="md"
      >
        <div className="space-y-6">
          {/* 아이콘 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FFF0F0]
                            flex items-center justify-center">
              <XCircle className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-h2 font-bold text-ink mb-3">
              도움 연결을 취소하시겠습니까?
            </h2>
            <p className="text-body-lg text-ink-muted leading-relaxed">
              취소하면 이 도움 요청은 다시
              <br />
              다른 사람이 수락할 수 있게 됩니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full min-h-[64px] rounded-xl bg-accent text-white
                         font-bold text-h3 active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  취소 중...
                </>
              ) : '예, 취소합니다'}
            </button>
            <button
              onClick={() => setCancelConfirmMatchId(null)}
              disabled={cancelling}
              className="w-full min-h-[64px] rounded-xl border-2 border-line
                         bg-surface-card text-ink font-bold text-h3
                         active:scale-[0.98] disabled:opacity-40
                         transition-all"
            >
              아니오
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
