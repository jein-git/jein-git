import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CategoryChip } from '../components/ui/CategoryChip';
import { ChevronRight, ChevronLeft, Sparkles, Mic } from 'lucide-react';
import type { AssetCategory, User, Asset } from '../types';
import { ASSET_CATEGORY_LABELS, ASSET_CATEGORY_ICONS, mockHub } from '../data/mock';

const TOTAL_STEPS = 4;

const ASSET_CATEGORIES: AssetCategory[] = [
  'cooking', 'sewing', 'talking', 'gardening', 'teaching', 'repairing', 'walking', 'cleaning'
];

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const TIME_SLOTS = ['오전', '오후', '저녁'];
const DISTANCES = [
  { key: 'walk10', label: '도보 10분', desc: '가까운 이웃' },
  { key: 'town', label: '우리 동네', desc: '같은 동네' },
  { key: 'car', label: '차로 가능', desc: '인근 지역' },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { setUser, addAsset } = useUser();
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<AssetCategory[]>([]);
  const [descriptions, setDescriptions] = useState<Record<AssetCategory, string>>({} as any);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<'walk10' | 'town' | 'car'>('town');
  const [userName, setUserName] = useState('');
  const [userDistrict, setUserDistrict] = useState('');

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedCategories.length > 0;
      case 2:
        return selectedCategories.every((cat) => descriptions[cat]?.trim());
      case 3:
        return selectedDays.length > 0 && selectedSlots.length > 0;
      case 4:
        return userName.trim().length > 0 && userDistrict.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    // Create user without assets
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: userName || '새 회원',
      nickname: userName || '새 회원',
      age: 65,
      district: userDistrict || '서울',
      joinedAt: new Date().toISOString(),
      hasCoordinatorContact: true,
    };
    setUser(newUser);
    navigate('/');
  };

  const handleComplete = () => {
    // Create user
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: userName,
      nickname: userName,
      age: 65,
      district: userDistrict,
      joinedAt: new Date().toISOString(),
      hasCoordinatorContact: true,
    };
    setUser(newUser);

    // Add first asset
    const firstCategory = selectedCategories[0];
    const newAsset: Omit<Asset, 'id' | 'totalHours'> = {
      category: firstCategory,
      title: ASSET_CATEGORY_LABELS[firstCategory],
      description: descriptions[firstCategory],
      availability: {
        days: selectedDays,
        timeSlots: selectedSlots,
        distance: selectedDistance,
      },
    };
    addAsset(newAsset);

    navigate('/');
  };

  const toggleCategory = (cat: AssetCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));
  };

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-surface-base border-b border-line z-10 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          {step > 1 ? (
            <button onClick={handleBack} className="text-primary text-body-lg flex items-center gap-1">
              <ChevronLeft className="w-5 h-5" />
              이전
            </button>
          ) : (
            <div />
          )}
          <button onClick={handleSkip} className="text-ink-muted text-body-lg">
            건너뛰기
          </button>
        </div>
        <ProgressBar current={step} total={TOTAL_STEPS} showSteps />
      </header>

      {/* Content */}
      <main className="flex-1 p-6 pb-8">
        <div className="max-w-md mx-auto">
          {/* Step 1: Categories */}
          {step === 1 && (
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-h1 font-bold text-ink mb-2">안녕하세요,</h1>
              <h1 className="text-h1 font-bold text-ink mb-4">무엇을 잘하시나요?</h1>
              <p className="text-body-lg text-ink-muted">
                당신이 가진 것부터 알려주세요.
                <br />
                1타임은 누구에게나 같은 1타임이에요.
              </p>
            </div>
          )}

          {/* Step 2: Descriptions */}
          {step === 2 && (
            <div className="text-center mb-8">
              <h1 className="text-h1 font-bold text-ink mb-4">조금 더 자세히 알려주세요</h1>
              <p className="text-body-lg text-ink-muted">
                선택하신 것에 대해 설명해주세요
              </p>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="text-center mb-8">
              <h1 className="text-h1 font-bold text-ink mb-4">언제 가능하신가요?</h1>
              <p className="text-body-lg text-ink-muted">
                편한 시간을 알려주세요
              </p>
            </div>
          )}

          {/* Step 4: User Info */}
          {step === 4 && (
            <div className="text-center mb-8">
              <h1 className="text-h1 font-bold text-ink mb-4">마지막으로,</h1>
              <p className="text-body-lg text-ink-muted">
                기본 정보를 알려주세요
              </p>
            </div>
          )}

          {/* Step 1 Content */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {ASSET_CATEGORIES.map((cat) => (
                <CategoryChip
                  key={cat}
                  label={ASSET_CATEGORY_LABELS[cat]}
                  icon={ASSET_CATEGORY_ICONS[cat]}
                  selected={selectedCategories.includes(cat)}
                  onClick={() => toggleCategory(cat)}
                  size="lg"
                />
              ))}
            </div>
          )}

          {/* Step 2 Content */}
          {step === 2 && (
            <div className="space-y-6">
              {selectedCategories.map((cat) => (
                <div key={cat}>
                  <label className="label-text flex items-center gap-2">
                    <span>{ASSET_CATEGORY_ICONS[cat]}</span>
                    {ASSET_CATEGORY_LABELS[cat]}
                  </label>
                  <div className="relative">
                    <textarea
                      value={descriptions[cat] || ''}
                      onChange={(e) =>
                        setDescriptions({ ...descriptions, [cat]: e.target.value })
                      }
                      placeholder="어떻게 도와주실 수 있나요?"
                      className="input-field min-h-[120px] resize-none pr-14"
                    />
                    <button className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
                      <Mic className="w-5 h-5 text-ink-muted" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3 Content */}
          {step === 3 && (
            <div className="space-y-8">
              {/* Days */}
              <div>
                <label className="label-text">가능한 요일</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`min-h-touch-lg min-w-touch-lg rounded-lg border-2 font-medium transition-all ${
                        selectedDays.includes(day)
                          ? 'border-primary bg-primary-light text-primary-dark'
                          : 'border-line text-ink-muted hover:border-line-strong'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="label-text">가능한 시간</label>
                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      className={`min-h-touch-lg rounded-lg border-2 font-medium transition-all ${
                        selectedSlots.includes(slot)
                          ? 'border-primary bg-primary-light text-primary-dark'
                          : 'border-line text-ink-muted hover:border-line-strong'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="label-text">이동 가능 거리</label>
                <div className="space-y-3">
                  {DISTANCES.map((dist) => (
                    <button
                      key={dist.key}
                      onClick={() => setSelectedDistance(dist.key)}
                      className={`card w-full text-left transition-all ${
                        selectedDistance === dist.key
                          ? 'border-primary bg-primary-light'
                          : 'border-line hover:border-line-strong'
                      }`}
                    >
                      <p className="text-body-lg font-semibold text-ink">{dist.label}</p>
                      <p className="text-body text-ink-muted">{dist.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 Content */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="label-text">이름</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="어떻게 불러드리면 될까요?"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-text">사시는 동네</label>
                <input
                  type="text"
                  value={userDistrict}
                  onChange={(e) => setUserDistrict(e.target.value)}
                  placeholder="예: 마포구 망원동"
                  className="input-field"
                />
              </div>

              {/* Summary */}
              <Card variant="muted">
                <p className="text-body-lg font-semibold text-ink mb-4">입력하신 내용</p>
                <div className="space-y-2 text-body text-ink-muted">
                  <p>
                    <strong className="text-ink">자산:</strong>{' '}
                    {selectedCategories.map((c) => ASSET_CATEGORY_LABELS[c]).join(', ')}
                  </p>
                  <p>
                    <strong className="text-ink">가능 요일:</strong> {selectedDays.join(', ')}
                  </p>
                  <p>
                    <strong className="text-ink">가능 시간:</strong> {selectedSlots.join(', ')}
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-surface-base border-t border-line p-4 safe-bottom">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            {step === TOTAL_STEPS ? (
              <>
                시작하기
                <Sparkles className="w-5 h-5" />
              </>
            ) : (
              <>
                다음
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>

          {step === 1 && (
            <button
              onClick={() => alert('코디네이터 연결 모달')}
              className="w-full mt-3 text-body text-ink-muted underline"
            >
              잘 모르겠어요, 코디네이터와 이야기할래요
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
