import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, User, Phone, MapPin, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';

const NOWON_DONGS = [
  '월계1동', '월계2동', '월계3동',
  '공릉1동', '공릉2동',
  '하계1동', '하계2동',
  '중계본동', '중계1동', '중계2·3동', '중계4동',
  '상계1동', '상계2동', '상계3·4동', '상계5동',
  '상계6·7동', '상계8동', '상계9동', '상계10동',
];

export function ProfileSetupPage() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [dong, setDong] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!phone.trim()) {
      setError('전화번호를 입력해주세요.');
      return;
    }
    if (!dong) {
      setError('동을 선택해주세요.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: `노원구 ${dong}`,
    });
    setSaving(false);

    if (updateError) {
      setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-20 h-20 mb-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <Clock className="w-11 h-11 text-white" />
        </div>
        <h1 className="text-h1 font-bold text-primary-dark mb-2">돌봄타임뱅크</h1>
        <p className="text-body-lg text-ink-muted text-center">
          서비스 이용을 위해 추가 정보를 입력해주세요.
        </p>
      </div>

      <div className="bg-surface-card rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="text-h2 font-bold text-ink mb-2">프로필 설정</h2>
        <p className="text-body text-ink-muted mb-6">
          이웃과 연결되기 위해 기본 정보를 입력해주세요.
        </p>

        {error && (
          <div className="mb-5 p-4 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-body text-accent">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">
              이름 <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="input-field pl-12"
              />
            </div>
          </div>

          <div>
            <label className="label-text">
              전화번호 <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="input-field pl-12"
                inputMode="tel"
              />
            </div>
          </div>

          <div>
            <label className="text-h3 font-bold text-ink mb-3 block">
              거주 동 <span className="text-accent">*</span>
            </label>
            <div className="flex items-center gap-3">
              {/* 노원구 고정 텍스트 */}
              <div className="flex items-center gap-2 bg-primary-light border-2 border-primary rounded-lg px-4 min-h-[72px] whitespace-nowrap shrink-0">
                <MapPin className="w-6 h-6 text-primary shrink-0" />
                <span className="text-h3 font-bold text-primary-dark">노원구</span>
              </div>

              {/* 동 드롭다운 */}
              <div className="relative flex-1">
                <select
                  value={dong}
                  onChange={(e) => setDong(e.target.value)}
                  className="w-full min-h-[72px] px-4 pr-12 text-h3 font-medium
                             border-2 border-line rounded-lg bg-white
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light
                             transition-colors appearance-none text-ink"
                >
                  <option value="">동 선택</option>
                  {NOWON_DONGS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-ink-muted pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                저장 중...
              </>
            ) : (
              '완료'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
