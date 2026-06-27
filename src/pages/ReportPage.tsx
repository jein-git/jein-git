import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Flag, Shield, Mic, Camera, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type ReportType =
  | 'no-show'
  | 'uncomfortable'
  | 'money'
  | 'safety'
  | 'other';

const REPORT_TYPES: { key: ReportType; label: string }[] = [
  { key: 'no-show', label: '약속 불이행' },
  { key: 'uncomfortable', label: '불편한 행동' },
  { key: 'money', label: '금전 요구' },
  { key: 'safety', label: '안전 걱정' },
  { key: 'other', label: '그 외' },
];

type Report = {
  id: string;
  type: ReportType;
  detail: string;
  anonymous: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'ctb_reports';

export function ReportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [detail, setDetail] = useState('');
  const [anonymous, setAnonymous] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }, []);

  const handleSubmit = () => {
    if (!selectedType) return;

    const report: Report = {
      id: `r_${Date.now()}`,
      type: selectedType,
      detail,
      anonymous,
      createdAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const reports: Report[] = stored ? JSON.parse(stored) : [];
    reports.push(report);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

    setStep('done');
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-surface-base">
        <header className="sticky top-0 bg-surface-base border-b border-line z-10">
          <div className="flex items-center px-4 h-[72px]">
            <button
              onClick={() => navigate(-1)}
              className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                         hover:bg-surface-muted transition-colors"
            >
              <ChevronLeft className="w-8 h-8 text-ink" />
            </button>
            <h1 className="text-h3 font-bold text-ink ml-2">신고하기</h1>
          </div>
        </header>

        <main className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-h2 font-bold text-ink mb-3">신고를 받았어요</h2>
          <p className="text-body-lg text-ink-muted text-center mb-8">
            코디네이터가 곧 확인해 드려요.
          </p>
          <Button variant="primary" onClick={() => navigate('/')} fullWidth>
            홈으로
          </Button>
        </main>
      </div>
    );
  }

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
          <h1 className="text-h3 font-bold text-ink ml-2">신고하기</h1>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Info Box */}
        <Card variant="muted" className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-body text-ink-muted">
            불편한 일이 있으셨나요? 코디네이터가 안전하게 처리해 드려요.
            익명으로 신고하실 수도 있어요.
          </p>
        </Card>

        {/* Report Type */}
        <section>
          <h2 className="text-body-lg font-semibold text-ink mb-4">어떤 일이 있으셨나요?</h2>
          <div className="space-y-3">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 min-h-touch
                           transition-all ${
                             selectedType === type.key
                               ? 'border-primary bg-primary-light'
                               : 'border-line bg-surface-card'
                           }`}
              >
                <span className={`text-body-lg font-medium ${
                  selectedType === type.key ? 'text-primary-dark' : 'text-ink'
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Detail Input */}
        <section>
          <h2 className="text-body-lg font-semibold text-ink mb-4">자세히 알려주세요</h2>
          <div className="relative">
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="어떤 일이 있었는지 자유롭게 적어주세요"
              className="w-full min-h-[7.5rem] px-4 py-3 text-body-lg border-2 border-line
                         rounded-xl bg-white focus:outline-none focus:border-primary
                         focus:ring-2 focus:ring-primary-light transition-colors resize-none"
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center
                           text-ink-subtle hover:bg-line transition-colors"
                aria-label="음성 입력"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center
                           text-ink-subtle hover:bg-line transition-colors"
                aria-label="사진 첨부"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Anonymous Toggle */}
        <section>
          <button
            onClick={() => setAnonymous(!anonymous)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl
                       border-2 border-line bg-surface-card"
          >
            <div className="flex items-center gap-3">
              <Flag className="w-5 h-5 text-ink-muted" />
              <span className="text-body-lg text-ink">내 이름 함께 보내기</span>
            </div>
            <div
              className={`w-14 h-8 rounded-full transition-colors flex items-center
                         ${anonymous ? 'bg-line justify-start' : 'bg-primary justify-end'}`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow mx-1" />
            </div>
          </button>
          {anonymous && (
            <p className="text-caption text-ink-subtle mt-2 ml-1">
              익명으로 신고되며, 내 이름은 공개되지 않아요.
            </p>
          )}
        </section>

        {/* Submit */}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedType}
          fullWidth
          className="min-h-touch-lg"
        >
          보내기
        </Button>
      </main>
    </div>
  );
}
