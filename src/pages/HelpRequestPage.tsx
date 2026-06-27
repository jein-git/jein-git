import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Minus,
  Plus,
  Home,
} from 'lucide-react';

// 도움 카테고리 목록
const CATEGORIES = [
  { value: 'hospital', label: '병원 동행', emoji: '🏥' },
  { value: 'shopping', label: '장보기', emoji: '🛒' },
  { value: 'talking', label: '말벗', emoji: '💬' },
  { value: 'repairing', label: '수리', emoji: '🔧' },
  { value: 'moving', label: '이동 도움', emoji: '🚗' },
  { value: 'cleaning', label: '청소', emoji: '🧹' },
  { value: 'cooking', label: '식사 준비', emoji: '🍱' },
  { value: 'other', label: '기타', emoji: '📋' },
] as const;

type Category = typeof CATEGORIES[number]['value'];

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환 (date input의 min 값)
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function HelpRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 폼 필드 상태
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [description, setDescription] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(1);

  // UI 상태
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 로그인하지 않은 사용자는 접근 불가
  if (!user) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-6">
        <AlertCircle className="w-14 h-14 text-warn mb-4" />
        <h2 className="text-h2 font-bold text-ink mb-3">로그인이 필요합니다</h2>
        <p className="text-body-lg text-ink-muted text-center mb-6">
          도움 요청을 작성하려면 먼저 로그인해주세요.
        </p>
        <Button onClick={() => navigate('/login')}>로그인하기</Button>
      </div>
    );
  }

  const validate = (): string | null => {
    if (!title.trim()) return '제목을 입력해주세요.';
    if (!category) return '도움 종류를 선택해주세요.';
    if (!requestDate) return '날짜를 선택해주세요.';
    if (estimatedHours < 0.5) return '예상 소요 시간을 선택해주세요.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    // care_requests 테이블에 새 요청 저장
    const { error: dbError } = await supabase.from('care_requests').insert({
      requester_id: user.id,
      title: title.trim(),
      category,
      description: description.trim(),
      requested_date: requestDate,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location.trim(),
      requested_hours: estimatedHours,
      status: 'open', // 기본값: 대기 중
    });

    setSubmitting(false);

    if (dbError) {
      setError('요청 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }

    setSuccess(true);
  };

  // 예상 소요 시간 스텝 조절 (0.5 단위)
  const decreaseHours = () => setEstimatedHours((h) => Math.max(0.5, h - 0.5));
  const increaseHours = () => setEstimatedHours((h) => Math.min(24, h + 0.5));

  const formatHours = (h: number) =>
    Number.isInteger(h) ? `${h}타임` : `${h.toFixed(1)}타임`;

  // ── 등록 완료 화면 ──
  if (success) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col">
        <header className="px-4 h-[72px] flex items-center border-b border-line">
          <span className="text-h3 font-bold text-primary">품터</span>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="w-24 h-24 mb-6 rounded-full bg-success-light flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>

          <h1 className="text-h1 font-bold text-ink text-center mb-3">
            도움 요청이 등록되었습니다
          </h1>
          <p className="text-body-lg text-ink-muted text-center mb-10">
            코디네이터가 검토 후 적합한 이웃을 연결해 드릴게요.
          </p>

          {/* 요청 요약 */}
          <Card variant="muted" className="w-full mb-8">
            <div className="space-y-2 text-body">
              <p>
                <span className="text-ink-muted">제목:</span>{' '}
                <span className="font-semibold text-ink">{title}</span>
              </p>
              <p>
                <span className="text-ink-muted">도움 종류:</span>{' '}
                <span className="font-semibold text-ink">
                  {CATEGORIES.find((c) => c.value === category)?.label}
                </span>
              </p>
              <p>
                <span className="text-ink-muted">날짜:</span>{' '}
                <span className="font-semibold text-ink">
                  {new Date(requestDate).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </span>
              </p>
              <p>
                <span className="text-ink-muted">예상 시간:</span>{' '}
                <span className="font-semibold text-ink">{formatHours(estimatedHours)}</span>
              </p>
            </div>
          </Card>

          <div className="flex flex-col w-full gap-3">
            <Button onClick={() => navigate('/help/offer')}>
              도움 요청 목록 보기
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── 요청 작성 폼 ──
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
        <h1 className="text-h3 font-bold text-ink">도움 요청하기</h1>
        <button
          onClick={() => navigate('/')}
          className="ml-auto min-h-touch min-w-touch flex items-center justify-center
                     rounded-full hover:bg-surface-muted transition-colors"
          aria-label="홈으로 가기"
        >
          <Home className="w-7 h-7 text-primary" />
        </button>
      </header>

      {/* 폼 */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32"
      >
        {/* 오류 메시지 */}
        {error && (
          <div className="p-4 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-body text-accent">{error}</p>
          </div>
        )}

        {/* ① 제목 */}
        <div>
          <label className="label-text">
            제목 <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 정형외과 병원 동행"
            className="input-field"
            maxLength={60}
          />
        </div>

        {/* ② 도움 종류 */}
        <div>
          <label className="label-text">
            도움 종류 <span className="text-accent">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                           text-left min-h-[68px]
                           ${category === cat.value
                             ? 'border-primary bg-primary-light'
                             : 'border-line bg-surface-card hover:border-primary/40'
                           }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span
                  className={`text-body-lg font-medium ${
                    category === cat.value ? 'text-primary-dark' : 'text-ink'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ③ 날짜 */}
        <div>
          <label className="label-text">
            요청 날짜 <span className="text-accent">*</span>
          </label>
          <input
            type="date"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
            min={todayStr()}
            className="input-field"
          />
        </div>

        {/* ④ 시간 */}
        <div>
          <label className="label-text">시작/종료 시간</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-body text-ink-muted mb-2">시작 시간</p>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <p className="text-body text-ink-muted mb-2">종료 시간</p>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* ⑤ 장소 */}
        <div>
          <label className="label-text">장소</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 서울시 마포구 망원동, 집 근처 병원"
            className="input-field"
          />
        </div>

        {/* ⑥ 예상 소요 시간 */}
        <div>
          <label className="label-text">
            예상 소요 시간 <span className="text-accent">*</span>
          </label>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={decreaseHours}
              disabled={estimatedHours <= 0.5}
              className="w-14 h-14 rounded-full border-2 border-line bg-surface-card
                         flex items-center justify-center hover:border-primary
                         disabled:opacity-30 active:scale-95 transition-all"
            >
              <Minus className="w-6 h-6 text-ink" />
            </button>

            <div className="flex-1 text-center">
              <span className="text-display font-bold text-primary-dark">
                {formatHours(estimatedHours)}
              </span>
            </div>

            <button
              type="button"
              onClick={increaseHours}
              disabled={estimatedHours >= 24}
              className="w-14 h-14 rounded-full border-2 border-line bg-surface-card
                         flex items-center justify-center hover:border-primary
                         disabled:opacity-30 active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6 text-ink" />
            </button>
          </div>
          <p className="text-body text-ink-muted text-center mt-2">
            1타임 = 1시간 기준입니다
          </p>
        </div>

        {/* ⑦ 자세한 설명 */}
        <div>
          <label className="label-text">자세한 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="어떤 도움이 필요한지 자세히 설명해주세요.&#10;&#10;예: 무릎이 좋지 않아 대중교통 이용이 어렵습니다. 정형외과까지 동행해 주실 분을 찾습니다."
            className="input-field min-h-[140px] resize-none"
            maxLength={500}
          />
          <p className="text-caption text-ink-subtle text-right mt-1">
            {description.length}/500
          </p>
        </div>
      </form>

      {/* 고정 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-base border-t border-line px-6 py-4 safe-bottom">
        <Button
          type="submit"
          fullWidth
          loading={submitting}
          onClick={handleSubmit}
        >
          {submitting ? '등록 중...' : '요청 등록하기'}
        </Button>
      </div>
    </div>
  );
}
