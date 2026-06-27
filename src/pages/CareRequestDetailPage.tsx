import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FileText,
  HandHeart,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// care_requests 조회 결과 타입 (requester_id 포함)
type CareRequestDetail = {
  id: string;
  requester_id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  requested_date: string | null;
  start_time: string | null;
  end_time: string | null;
  requested_hours: number;
  status: string;
  created_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  hospital: '병원 동행',
  shopping: '장보기',
  talking: '말벗',
  repairing: '수리',
  moving: '이동 도움',
  cleaning: '청소',
  cooking: '식사 준비',
  other: '기타',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  hospital: '🏥', shopping: '🛒', talking: '💬', repairing: '🔧',
  moving: '🚗', cleaning: '🧹', cooking: '🍱', other: '📋',
};

// 상태 → 한국어 표시
const STATUS_LABELS: Record<string, string> = {
  open: '요청 중',
  matched: '도움 연결됨',
  completed: '도움 완료',
  cancelled: '취소됨',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '날짜 미정';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start && !end) return '시간 미정';
  if (start && end) return `${start.slice(0, 5)} ~ ${end.slice(0, 5)}`;
  if (start) return `${start.slice(0, 5)} 이후`;
  return `${end!.slice(0, 5)}까지`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function CareRequestDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [request, setRequest] = useState<CareRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 수락 처리 상태
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [matchSuccess, setMatchSuccess] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);

  // 요청 데이터 불러오기
  useEffect(() => {
    if (!id) {
      setFetchError('잘못된 접근입니다.');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      const { data, error: dbError } = await supabase
        .from('care_requests')
        .select(
          'id, requester_id, title, category, description, location, requested_date, start_time, end_time, requested_hours, status, created_at'
        )
        .eq('id', id)
        .maybeSingle();

      if (dbError || !data) {
        setFetchError('요청 정보를 불러올 수 없습니다.');
      } else {
        setRequest(data);
      }
      setLoading(false);
    };

    fetchDetail();
  }, [id]);

  // 수락 처리: RPC 함수 호출 (확인 모달에서 최종 실행)
  const handleAccept = async () => {
    if (!id || accepting) return;

    setAccepting(true);
    setAcceptError(null);

    const { data: result, error: rpcError } = await supabase.rpc(
      'fn_accept_care_request',
      { p_request_id: id }
    );

    setAccepting(false);

    if (rpcError) {
      setAcceptError('수락 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setShowAcceptConfirm(false);
      return;
    }

    if (!result?.success) {
      setAcceptError(result?.error ?? '수락할 수 없는 요청입니다.');
      setShowAcceptConfirm(false);
      return;
    }

    // 수락 성공 → 성공 화면으로 전환
    setMatchSuccess(true);
  };

  // ── 로딩 화면 ──
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-body-lg text-ink-muted">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ── 데이터 오류 화면 ──
  if (fetchError || !request) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col">
        <header className="flex items-center px-4 h-[72px] border-b border-line">
          <button
            onClick={() => navigate(-1)}
            className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                       hover:bg-surface-muted transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-ink" />
          </button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <AlertCircle className="w-16 h-16 text-warn mb-4" />
          <p className="text-h3 font-bold text-ink mb-2">
            {fetchError ?? '요청을 찾을 수 없습니다'}
          </p>
          <button
            onClick={() => navigate('/help/offer')}
            className="mt-6 text-body-lg text-primary font-semibold"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[request.category] ?? request.category;
  const categoryEmoji = CATEGORY_EMOJIS[request.category] ?? '📋';
  const isMyRequest = user?.id === request.requester_id;
  const isOpen = request.status === 'open';

  // ── 매칭 성공 화면 ──
  if (matchSuccess) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col">
        <header className="px-4 h-[72px] flex items-center border-b border-line">
          <span className="text-h3 font-bold text-primary">품터</span>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          {/* 성공 아이콘 */}
          <div className="w-24 h-24 mb-6 rounded-full bg-success-light flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>

          <h1 className="text-h1 font-bold text-ink text-center mb-3">
            도움을 주실 분과 연결되었습니다
          </h1>
          <p className="text-body-lg text-ink-muted text-center mb-8">
            요청자에게 연락해 활동 일정을 확인해보세요.
          </p>

          {/* 요청 요약 */}
          <Card className="w-full mb-8 space-y-3">
            <h2 className="text-body-lg font-bold text-ink">{request.title}</h2>

            <div className="flex items-center gap-2 text-body text-ink-muted">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{formatDate(request.requested_date)}</span>
            </div>

            <div className="flex items-center gap-2 text-body text-ink-muted">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <span>
                {formatTimeRange(request.start_time, request.end_time)}
                {' · '}
                {formatTimes(request.requested_hours)}
              </span>
            </div>

            {request.location && (
              <div className="flex items-center gap-2 text-body text-ink-muted">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{request.location}</span>
              </div>
            )}
          </Card>

          {/* 이동 버튼 */}
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={() => navigate('/matches')}
              className="w-full min-h-touch-lg rounded-xl bg-primary text-white
                         font-semibold text-body-lg active:scale-[0.98] transition-transform"
            >
              내 도움 연결 내역 보기
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full min-h-touch-lg rounded-xl border-2 border-line
                         text-ink font-semibold text-body-lg active:scale-[0.98] transition-transform"
            >
              홈으로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 상세 화면 ──
  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-surface-base border-b border-line flex items-center px-4 h-[72px]">
        <button
          onClick={() => navigate(-1)}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                     hover:bg-surface-muted transition-colors mr-2"
        >
          <ChevronLeft className="w-8 h-8 text-ink" />
        </button>
        <h1 className="text-h3 font-bold text-ink">도움 요청 상세</h1>

        {/* 상태 뱃지 */}
        <span className={`ml-auto text-caption font-semibold px-3 py-1.5 rounded-full
          ${request.status === 'open'
            ? 'bg-success-light text-success'
            : request.status === 'matched'
            ? 'bg-primary-light text-primary-dark'
            : 'bg-line text-ink-muted'
          }`}>
          {STATUS_LABELS[request.status] ?? request.status}
        </span>
      </header>

      {/* 본문 */}
      <main className="flex-1 px-6 py-6 pb-32 space-y-6">
        {/* 카테고리 + 제목 */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{categoryEmoji}</span>
            <span className="text-body-lg font-semibold text-primary bg-primary-light
                             px-3 py-1.5 rounded-full">
              {categoryLabel}
            </span>
          </div>
          <h2 className="text-h1 font-bold text-ink leading-tight">{request.title}</h2>
          <p className="text-body text-ink-subtle mt-2">
            등록 {timeAgo(request.created_at)}
          </p>
        </div>

        {/* 핵심 정보 카드 */}
        <Card className="space-y-5">
          {/* 날짜 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-caption text-ink-muted mb-1">요청 날짜</p>
              <p className="text-body-lg font-semibold text-ink">
                {formatDate(request.requested_date)}
              </p>
            </div>
          </div>

          {/* 시간 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-caption text-ink-muted mb-1">시간 및 소요 시간</p>
              <p className="text-body-lg font-semibold text-ink">
                {formatTimeRange(request.start_time, request.end_time)}
              </p>
              <p className="text-body text-ink-muted">
                예상 {formatTimes(request.requested_hours)}
              </p>
            </div>
          </div>

          {/* 장소 */}
          {request.location && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-caption text-ink-muted mb-1">장소</p>
                <p className="text-body-lg font-semibold text-ink">{request.location}</p>
              </div>
            </div>
          )}
        </Card>

        {/* 자세한 설명 */}
        {request.description && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-ink-muted" />
              <h3 className="text-body-lg font-semibold text-ink">자세한 설명</h3>
            </div>
            <Card variant="muted">
              <p className="text-body text-ink leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </Card>
          </div>
        )}

        {/* 내가 등록한 요청 안내 */}
        {isMyRequest && (
          <Card variant="muted" className="text-center py-4">
            <p className="text-body text-ink-muted">내가 등록한 요청입니다.</p>
          </Card>
        )}

        {/* 수락 오류 메시지 */}
        {acceptError && (
          <div className="p-4 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-body text-accent">{acceptError}</p>
          </div>
        )}
      </main>

      {/* 고정 하단: 수락 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-base border-t border-line px-6 py-4 safe-bottom">
        {/* 내 요청 → 비활성 */}
        {isMyRequest && (
          <button
            disabled
            className="w-full min-h-touch-lg rounded-xl bg-line text-ink-muted
                       font-semibold text-body-lg flex items-center justify-center gap-2
                       cursor-not-allowed"
          >
            내가 등록한 요청입니다
          </button>
        )}

        {/* 이미 매칭/완료된 요청 → 비활성 */}
        {!isMyRequest && !isOpen && (
          <button
            disabled
            className="w-full min-h-touch-lg rounded-xl bg-line text-ink-muted
                       font-semibold text-body-lg flex items-center justify-center gap-2
                       cursor-not-allowed"
          >
            {STATUS_LABELS[request.status] ?? request.status} — 수락 불가
          </button>
        )}

        {/* 수락 가능 → 활성 버튼 */}
        {!isMyRequest && isOpen && (
          <button
            onClick={() => { setAcceptError(null); setShowAcceptConfirm(true); }}
            disabled={accepting}
            className="w-full min-h-touch-lg rounded-xl bg-primary text-white
                       font-semibold text-body-lg flex items-center justify-center gap-2
                       active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all"
          >
            <HandHeart className="w-6 h-6" />
            이 도움 수락하기
          </button>
        )}
      </div>

      {/* ── 수락 확인 모달 ── */}
      <Modal
        isOpen={showAcceptConfirm}
        onClose={() => !accepting && setShowAcceptConfirm(false)}
        showClose={false}
        size="md"
      >
        <div className="space-y-6">
          {/* 헤더 아이콘 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-light
                            flex items-center justify-center">
              <HandHeart className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-h2 font-bold text-ink mb-2">
              이 도움을 수락하시겠습니까?
            </h2>
            <p className="text-body-lg text-ink-muted">
              수락하면 도움 연결이 완료됩니다.
            </p>
          </div>

          {/* 요청 정보 요약 */}
          <div className="bg-surface-muted rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-body-lg font-medium text-ink">
                {formatDate(request.requested_date)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-body-lg font-medium text-ink">
                {formatTimeRange(request.start_time, request.end_time)}
              </span>
            </div>
            {request.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-body-lg font-medium text-ink">
                  {request.location}
                </span>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full min-h-[64px] rounded-xl bg-primary text-white
                         font-bold text-h3 active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  수락 중...
                </>
              ) : '예, 수락합니다'}
            </button>
            <button
              onClick={() => setShowAcceptConfirm(false)}
              disabled={accepting}
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
