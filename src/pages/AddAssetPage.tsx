import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CategoryChip } from '../components/ui/CategoryChip';
import { ChevronLeft, ChevronRight, Mic, Sparkles } from 'lucide-react';
import type { AssetCategory, Asset } from '../types';
import { ASSET_CATEGORY_LABELS, ASSET_CATEGORY_ICONS } from '../data/mock';

const TOTAL_STEPS = 3;

const ASSET_CATEGORIES: AssetCategory[] = [
  'cooking', 'sewing', 'talking', 'gardening', 'teaching', 'repairing', 'walking', 'cleaning'
];

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const TIME_SLOTS = ['오전', '오후', '저녁'];
const DISTANCES = [
  { key: 'walk10', label: '도보 10분' },
  { key: 'town', label: '우리 동네' },
  { key: 'car', label: '차로 가능' },
] as const;

export function AddAssetPage() {
  const navigate = useNavigate();
  const { addAsset } = useUser();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<AssetCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<'walk10' | 'town' | 'car'>('town');

  const canProceed = () => {
    switch (step) {
      case 1:
        return category !== null;
      case 2:
        return title.trim().length > 0 && description.trim().length > 0;
      case 3:
        return selectedDays.length > 0 && selectedSlots.length > 0;
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
    } else {
      navigate(-1);
    }
  };

  const handleComplete = () => {
    if (!category) return;

    addAsset({
      category,
      title,
      description,
      availability: {
        days: selectedDays,
        timeSlots: selectedSlots,
        distance: selectedDistance,
      },
    });

    navigate('/assets');
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));
  };

  const handleCategorySelect = (cat: AssetCategory) => {
    setCategory(cat);
    setTitle(ASSET_CATEGORY_LABELS[cat]);
  };

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-surface-base border-b border-line z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="text-primary text-body-lg flex items-center gap-1">
            <ChevronLeft className="w-5 h-5" />
            이전
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full flex-1 transition-colors ${
                idx + 1 <= step ? 'bg-primary' : 'bg-line'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 pb-8">
        <div className="max-w-md mx-auto">
          {/* Step 1: Category */}
          {step === 1 && (
            <div className="text-center mb-8">
              <h1 className="text-h1 font-bold text-ink mb-4">어떤 자산인가요?</h1>
              <p className="text-body-lg text-ink-muted">카테고리를 선택해주세요</p>
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="text-center mb-8">
              <h1 className="text-h1 font-bold text-ink mb-4">자세히 알려주세요</h1>
              <p className="text-body-lg text-ink-muted">어떻게 도와주실 수 있나요?</p>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="text-center mb-8">
              <h1 className="text-h1 font-bold text-ink mb-4">언제 가능하신가요?</h1>
              <p className="text-body-lg text-ink-muted">편한 시간을 알려주세요</p>
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
                  selected={category === cat}
                  onClick={() => handleCategorySelect(cat)}
                  size="lg"
                />
              ))}
            </div>
          )}

          {/* Step 2 Content */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="label-text">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="무엇을 도와드릴 수 있나요?"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-text">상세 설명</label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="어떤 도움을 드릴 수 있는지 설명해주세요"
                    className="input-field min-h-[150px] resize-none pr-14"
                  />
                  <button className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
                    <Mic className="w-5 h-5 text-ink-muted" />
                  </button>
                </div>
              </div>
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
                <div className="space-y-2">
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
                      <p className="text-body-lg font-medium text-ink">{dist.label}</p>
                    </button>
                  ))}
                </div>
              </div>
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
                <Sparkles className="w-5 h-5" />
                등록하기
              </>
            ) : (
              <>
                다음
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
