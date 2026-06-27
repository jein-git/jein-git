import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { ChevronLeft, Eye, Volume2, Bell } from 'lucide-react';
import { Card } from '../components/ui/Card';

type FontSize = 'normal' | 'large' | 'xlarge';

export function SettingsPage() {
  const navigate = useNavigate();
  const { fontScale, setFontScale, highContrast, toggleHighContrast, voiceGuide, toggleVoiceGuide } = useAccessibility();

  const fontSizes: { key: FontSize; label: string; preview: string }[] = [
    { key: 'normal', label: '보통', preview: '기본 크기' },
    { key: 'large', label: '크게', preview: '15% 크게' },
    { key: 'xlarge', label: '아주 크게', preview: '30% 크게' },
  ];

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <header className="sticky top-0 bg-surface-base border-b border-line z-10">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                       hover:bg-surface-muted transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-ink" />
          </button>
          <h1 className="text-h3 font-bold text-ink ml-2">설정</h1>
        </div>
      </header>

      <main className="p-6">
        {/* Font Size */}
        <section className="mb-8">
          <h2 className="text-h3 font-bold text-ink mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6" />
            글자 크기
          </h2>

          <div className="space-y-3">
            {fontSizes.map((size) => (
              <button
                key={size.key}
                onClick={() => setFontScale(size.key)}
                className={`card w-full text-left transition-all ${
                  fontScale === size.key
                    ? 'border-primary bg-primary-light'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-lg font-semibold text-ink">{size.label}</p>
                    <p className="text-body text-ink-muted">{size.preview}</p>
                  </div>
                  {fontScale === size.key && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* High Contrast */}
        <section className="mb-8">
          <div className="flex items-center justify-between py-4 border-b border-line">
            <div>
              <p className="text-body-lg font-semibold text-ink">색상 대비 더 진하게</p>
              <p className="text-body text-ink-muted">텍스트와 배경 대비를 높입니다</p>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`w-20 h-12 rounded-full transition-colors relative ${
                highContrast ? 'bg-primary' : 'bg-line'
              }`}
            >
              <div
                className={`absolute top-1 w-10 h-10 rounded-full bg-white shadow transition-transform ${
                  highContrast ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Voice Guide */}
        <section className="mb-8">
          <div className="flex items-center justify-between py-4 border-b border-line">
            <div className="flex items-center gap-3">
              <Volume2 className="w-6 h-6 text-ink-muted" />
              <div>
                <p className="text-body-lg font-semibold text-ink">음성 안내</p>
                <p className="text-body text-ink-muted">화면 내용을 음성으로 안내합니다</p>
              </div>
            </div>
            <button
              onClick={toggleVoiceGuide}
              className={`w-20 h-12 rounded-full transition-colors relative ${
                voiceGuide ? 'bg-primary' : 'bg-line'
              }`}
            >
              <div
                className={`absolute top-1 w-10 h-10 rounded-full bg-white shadow transition-transform ${
                  voiceGuide ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {voiceGuide && (
            <Card variant="muted" className="mt-3">
              <p className="text-body text-ink-muted">
                음성 안내 기능은 준비 중입니다
              </p>
            </Card>
          )}
        </section>

        {/* Quiet Hours */}
        <section className="mb-8">
          <h2 className="text-h3 font-bold text-ink mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            알림 시간
          </h2>

          <Card variant="muted">
            <p className="text-body-lg text-ink mb-2">야간 알림 차단</p>
            <p className="text-body text-ink-muted">
              밤 9시부터 아침 7시까지 알림을 보내지 않습니다
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-body text-ink-muted">차단 시간</span>
              <span className="text-body font-medium text-ink">오후 9시 ~ 오전 7시</span>
            </div>
          </Card>
        </section>

        {/* Info */}
        <Card variant="muted">
          <p className="text-body text-ink-muted">
            접근성 설정은 앱 전체에 적용됩니다. 글자 크기와 색상 대비를 조정하여
            더 편하게 이용하실 수 있습니다.
          </p>
        </Card>
      </main>
    </div>
  );
}
