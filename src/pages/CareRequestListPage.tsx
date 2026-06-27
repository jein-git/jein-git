import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatTimes } from '../lib/formatTimes';
import { Card } from '../components/ui/Card';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';

// DB에서 가져오는 care_request 행의 타입
type CareRequest = {
  id: string;
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

// KST 기준으로 요청이 아직 수락 가능한 시간인지 확인
function isRequestUpcoming(req: CareRequest): boolean {
  if (!req.requested_date) return true; // 날짜 미정: 목록에 표시

  const now = new Date();
  // UTC + 9h = KST
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const todayKST = kstNow.toISOString().split('T')[0]; // "YYYY-MM-DD"

  if (req.requested_date > todayKST) return true;  // 미래 날짜
  if (req.requested_date < todayKST) return false; // 과거 날짜

  // 오늘 날짜 — 시간 비교 (start_time 또는 end_time 기준)
  const refTime = req.start_time ?? req.end_time;
  if (!refTime) return true; // 시간 미정: 표시

  const [hours, minutes] = refTime.split(':').map(Number);
  const kstH = kstNow.getUTCHours();
  const kstM = kstNow.getUTCMinutes();

  return hours * 60 + minutes > kstH * 60 + kstM;
}

// 카테고리 이름 변환 테이블
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

// 날짜 포맷: "6월 20일 (금)"
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '날짜 미정';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

// 시간 포맷: "10:00 ~ 12:00" 또는 "시간 미정"
function formatTimeRange(start: string | null, end: string | null): string {
  if (!start && !end) return '시간 미정';
  if (start && end) return `${start.slice(0, 5)} ~ ${end.slice(0, 5)}`;
  if (start) return `${start.slice(0, 5)} 이후`;
  return `${end!.slice(0, 5)}까지`;
}

// 요청 카드 컴포넌트
function CareRequestCard({
  req,
  onDetail,
}: {
  req: CareRequest;
  onDetail: () => void;
}) {
  const categoryLabel = CATEGORY_LABELS[req.category] ?? req.category;
  const categoryEmoji = CATEGORY_EMOJIS[req.category] ?? '📋';

  return (
    <Card className="space-y-4">
      {/* 카테고리 뱃지 + 제목 */}
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{categoryEmoji}</span>
        <div className="flex-1">
          <span className="inline-block text-caption font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full mb-2">
            {categoryLabel}
          </span>
          <h3 className="text-h3 font-bold text-ink leading-snug">{req.title}</h3>
        </div>
      </div>

      {/* 세부 정보 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-body text-ink-muted">
          <Calendar className="w-5 h-5 flex-shrink-0 text-primary" />
          <span>{formatDate(req.requested_date)}</span>
        </div>

        <div className="flex items-center gap-2 text-body text-ink-muted">
          <Clock className="w-5 h-5 flex-shrink-0 text-primary" />
          <span>
            {formatTimeRange(req.start_time, req.end_time)}
            {' · '}
            {formatTimes(req.requested_hours)}
          </span>
        </div>

        {req.location && (
          <div className="flex items-center gap-2 text-body text-ink-muted">
            <MapPin className="w-5 h-5 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">{req.location}</span>
          </div>
        )}
      </div>

      {/* 자세히 보기 버튼 */}
      <button
        onClick={onDetail}
        className="w-full min-h-touch flex items-center justify-center gap-2
                   border-2 border-primary rounded-xl text-body-lg font-semibold
                   text-primary-dark hover:bg-primary-light active:scale-[0.98]
                   transition-all"
      >
        자세히 보기
        <ChevronRight className="w-5 h-5" />
      </button>
    </Card>
  );
}

export function CareRequestListPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 open 상태의 도움 요청 목록 불러오기
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('care_requests')
      .select(
        'id, title, category, description, location, requested_date, start_time, end_time, requested_hours, status, created_at'
      )
      .eq('status', 'open')
      .order('created_at', { ascending: false }); // 최신순 정렬

    if (dbError) {
      setError('목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      // 지난 요청(과거 날짜/시간)은 클라이언트에서 필터링
      const upcoming = (data ?? []).filter(isRequestUpcoming);
      setRequests(upcoming);
    }

    setLoading(false);
  };

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
        <h1 className="text-h3 font-bold text-ink">도움 요청 목록</h1>

        {/* 새 요청 등록 버튼 */}
        <button
          onClick={() => navigate('/help/request')}
          className="ml-auto min-h-touch flex items-center gap-1.5 px-4
                     bg-primary text-white rounded-xl text-body font-semibold
                     active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
          요청 등록
        </button>
      </header>

      {/* 안내 문구 */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-body-lg text-ink-muted">
          도움이 필요한 이웃을 찾아주세요.
          <br />
          도움을 드리면 타임이 적립됩니다.
        </p>
      </div>

      {/* 목록 영역 */}
      <main className="flex-1 px-6 py-4 pb-10">
        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-body-lg text-ink-muted">불러오는 중...</p>
          </div>
        )}

        {/* 오류 */}
        {!loading && error && (
          <Card variant="muted" className="flex items-start gap-3 py-5">
            <AlertCircle className="w-6 h-6 text-warn flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-body font-semibold text-ink mb-1">오류가 발생했습니다</p>
              <p className="text-body text-ink-muted">{error}</p>
              <button
                onClick={fetchRequests}
                className="mt-3 text-body-lg text-primary font-semibold"
              >
                다시 시도
              </button>
            </div>
          </Card>
        )}

        {/* 빈 목록 */}
        {!loading && !error && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="w-16 h-16 text-ink-subtle mb-5" />
            <p className="text-h3 font-bold text-ink mb-2">
              현재 등록된 도움 요청이 없습니다
            </p>
            <p className="text-body-lg text-ink-muted mb-8">
              새로운 도움 요청을 등록해보세요.
            </p>
            <button
              onClick={() => navigate('/help/request')}
              className="btn-primary max-w-xs"
            >
              도움 요청 등록하기
            </button>
          </div>
        )}

        {/* 요청 카드 목록 */}
        {!loading && !error && requests.length > 0 && (
          <>
            <p className="text-body text-ink-muted mb-4">
              총 {requests.length}건의 도움 요청이 있습니다.
            </p>
            <div className="space-y-4">
              {requests.map((req) => (
                <CareRequestCard
                  key={req.id}
                  req={req}
                  onDetail={() => navigate(`/help/request/${req.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
