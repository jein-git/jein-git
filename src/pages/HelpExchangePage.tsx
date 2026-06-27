import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { formatTimes } from '../lib/formatTimes';
import {
  ArrowDown,
  ArrowUp,
  Clock,
  ChevronRight,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { mockTransactions, mockHub } from '../data/mock';

type Tab = 'receive' | 'give' | 'ongoing';

type CareRequest = {
  id: string;
  title: string;
  category: string;
  location: string;
  requested_date: string | null;
  requested_hours: number;
  status: string;
  created_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  hospital: '병원 동행',
  shopping: '장보기',
  talking: '말벗',
  repairing: '수리',
  moving: '이사 도움',
  cleaning: '청소',
  cooking: '식사 준비',
  other: '기타',
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  open: { label: '대기중', className: 'bg-success-light text-success' },
  matched: { label: '도움 연결됨', className: 'bg-primary-light text-primary' },
  in_progress: { label: '진행중', className: 'bg-warn-light text-warn' },
  completed: { label: '완료', className: 'bg-line text-ink-muted' },
};

function formatRequestDate(dateStr: string | null) {
  if (!dateStr) return '날짜 미정';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function CareRequestCard({ req }: { req: CareRequest }) {
  const badge = STATUS_BADGES[req.status] ?? STATUS_BADGES.open;
  const categoryLabel =
    CATEGORY_LABELS[req.category] ?? req.category;

  return (
    <Card className="space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-body-lg font-bold text-ink flex-1 leading-snug">
          {req.title}
        </h3>
        <span
          className={`flex-shrink-0 text-caption font-semibold px-2.5 py-1 rounded-full ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Category chip */}
      <span className="inline-block text-caption font-medium text-primary bg-primary-light px-2.5 py-1 rounded-full">
        {categoryLabel}
      </span>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {req.location && (
          <div className="flex items-center gap-1.5 text-body text-ink-muted">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{req.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-body text-ink-muted">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{formatRequestDate(req.requested_date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-body text-ink-muted">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{formatTimes(req.requested_hours)}</span>
        </div>
      </div>
    </Card>
  );
}

type HelpExchangePageProps = {
  defaultTab?: Tab;
};

export function HelpExchangePage({ defaultTab = 'receive' }: HelpExchangePageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  // Give tab — care_requests data
  const [careRequests, setCareRequests] = useState<CareRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'give') {
      fetchCareRequests();
    }
  }, [activeTab]);

  const fetchCareRequests = async () => {
    setLoading(true);
    setError(null);
    const { data, error: sbError } = await supabase
      .from('care_requests')
      .select('id, title, category, location, requested_date, requested_hours, status, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (sbError) {
      setError('목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      setCareRequests(data ?? []);
    }
    setLoading(false);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'receive', label: '받기', icon: <ArrowDown className="w-6 h-6" /> },
    { key: 'give', label: '주기', icon: <ArrowUp className="w-6 h-6" /> },
    { key: 'ongoing', label: '진행 중', icon: <Clock className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Tabs */}
      <div className="bg-surface-base border-b border-line sticky top-0 z-10">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-h-touch-lg flex items-center justify-center gap-2
                         transition-colors border-b-2 ${
                           activeTab === tab.key
                             ? 'border-primary text-primary font-semibold'
                             : 'border-transparent text-ink-muted'
                         }`}
            >
              {tab.icon}
              <span className="text-body-lg">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pb-32">
        {/* ── 받기 탭 ─────────────────────────────── */}
        {activeTab === 'receive' && (
          <div className="space-y-6">
            <Card hoverable onClick={() => navigate('/help/request')} className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-full flex items-center justify-center">
                <ArrowDown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-h3 font-bold text-ink mb-2">도움 요청하기</h3>
              <p className="text-body text-ink-muted">필요한 도움을 말씀해주세요</p>
            </Card>

            <div>
              <h3 className="text-body-lg font-semibold text-ink mb-3">지난 요청</h3>
              <div className="space-y-2">
                {mockTransactions
                  .filter((t) => t.type === 'spend')
                  .slice(0, 2)
                  .map((t) => (
                    <Card key={t.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-body font-semibold text-ink">{t.activityTitle}</p>
                        <p className="text-caption text-ink-muted">{t.date}</p>
                      </div>
                      <span className="text-body-lg font-bold text-primary-dark">
                        -{formatTimes(t.hours)}
                      </span>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 주기 탭 ─────────────────────────────── */}
        {activeTab === 'give' && (
          <div className="space-y-4">
            <p className="text-body text-ink-muted">
              도움이 필요한 이웃을 도와주세요. 활동 후 타임이 적립됩니다.
            </p>

            {/* 로딩 */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
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
                    onClick={fetchCareRequests}
                    className="mt-3 text-body-lg text-primary font-medium"
                  >
                    다시 시도
                  </button>
                </div>
              </Card>
            )}

            {/* 빈 결과 */}
            {!loading && !error && careRequests.length === 0 && (
              <Card className="text-center py-16">
                <Clock className="w-14 h-14 mx-auto mb-4 text-ink-subtle" />
                <p className="text-body-lg text-ink-muted">
                  현재 등록된 도움 요청이 없습니다.
                </p>
                <p className="text-body text-ink-subtle mt-2">
                  코디네이터가 새 요청을 연결해 드릴게요!
                </p>
              </Card>
            )}

            {/* 목록 */}
            {!loading && !error && careRequests.length > 0 && (
              <div className="space-y-3">
                {careRequests.map((req) => (
                  <CareRequestCard key={req.id} req={req} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 진행 중 탭 ──────────────────────────── */}
        {activeTab === 'ongoing' && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-body-lg font-semibold text-ink mb-1">진행 중인 활동</p>
                  <p className="text-body text-ink-muted">현재 진행 중인 활동이 없습니다</p>
                </div>
              </div>
            </Card>

            <Card variant="muted">
              <p className="text-body text-ink-muted mb-3">코디네이터가 매칭을 도와드려요</p>
              <p className="text-caption text-ink-subtle">연락처: {mockHub.coordinator.phone}</p>
            </Card>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-24 left-0 right-0 px-6">
        <Button variant="secondary" onClick={() => navigate('/help/request')} fullWidth>
          도움 요청하러 가기
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
