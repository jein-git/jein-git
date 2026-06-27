import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AssetCard } from '../components/domain/AssetCard';
import { Sparkles, Plus } from 'lucide-react';

export function MyAssetsPage() {
  const navigate = useNavigate();
  const { assets } = useUser();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h1 font-bold text-ink">내 자산</h1>
        <button
          onClick={() => navigate('/assets/new')}
          className="min-h-touch min-w-touch rounded-full bg-primary
                     flex items-center justify-center text-white
                     hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Info */}
      <Card variant="muted" className="mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-body-lg font-semibold text-ink mb-1">
              무엇을 잘하시나요?
            </p>
            <p className="text-body text-ink-muted">
              당신의 재능과 경험을 이웃과 나눠보세요.
              <br />
              1타임의 요리도, 1타임의 대화도 같은 소중한 시간입니다.
            </p>
          </div>
        </div>
      </Card>

      {/* Assets List */}
      {assets.length === 0 ? (
        <Card className="text-center py-12">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-ink-subtle" />
          <p className="text-body-lg text-ink-muted mb-2">
            당신의 첫 자산을 찾아볼까요?
          </p>
          <p className="text-body text-ink-subtle mb-6">
            무엇이든 좋습니다. 잘하는 것,
            <br />
            좋아하는 것을 알려주세요.
          </p>
          <Button onClick={() => navigate('/assets/new')}>
            자산 등록하러 가기
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={() => navigate(`/assets/${asset.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
