import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Service } from '../lib/supabase';
import { Plus, Sparkles, ChevronRight, Clock } from 'lucide-react';

const ASSET_CATEGORIES = [
  { id: 'cooking', label: '요리하기', icon: '👨‍🍳' },
  { id: 'cleaning', label: '청소하기', icon: '🧹' },
  { id: 'gardening', label: '정원가꾸기', icon: '🌱' },
  { id: 'crafts', label: '만들기/공예', icon: '🎨' },
  { id: 'music', label: '음악/노래', icon: '🎵' },
  { id: 'reading', label: '글 읽어주기', icon: '📖' },
  { id: 'chatting', label: '대화하기', icon: '💬' },
  { id: 'driving', label: '운전하기', icon: '🚗' },
  { id: 'tech', label: '전자기기 도와주기', icon: '📱' },
  { id: 'health', label: '건강 관리', icon: '💪' },
  { id: 'other', label: '기타', icon: '✨' },
];

export function AssetsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [myAssets, setMyAssets] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAsset, setNewAsset] = useState({
    title: '',
    category: '',
    description: '',
    time_cost: 1,
  });

  useEffect(() => {
    if (profile?.id) {
      loadMyAssets();
    }
  }, [profile?.id]);

  const loadMyAssets = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', profile.id)
        .order('created_at', { ascending: false });
      setMyAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async () => {
    if (!profile?.id) return;
    if (!newAsset.title || !newAsset.category) {
      alert('제목과 카테고리를 입력해주세요.');
      return;
    }

    try {
      await supabase.from('services').insert({
        provider_id: profile.id,
        title: newAsset.title,
        category: newAsset.category,
        description: newAsset.description,
        time_cost: newAsset.time_cost,
        is_active: true,
      });
      setNewAsset({ title: '', category: '', description: '', time_cost: 1 });
      setShowAddForm(false);
      loadMyAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('등록에 실패했습니다.');
    }
  };

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h1 font-bold text-ink">내 자산</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="min-h-touch min-w-touch rounded-full bg-primary
                     flex items-center justify-center text-white"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Info */}
      <div className="card bg-surface-muted mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-body-lg font-semibold text-ink mb-1">
              무엇을 잘하시나요?
            </p>
            <p className="text-body text-ink-muted">
              당신의 재능과 경험을 공유해보세요. 1시간의 요리도, 1시간의 대화도
              같은 소중한 시간입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Add Asset Form */}
      {showAddForm && (
        <div className="card mb-6 border-2 border-primary">
          <h2 className="text-h3 font-bold text-ink mb-4">새 자산 등록</h2>

          <div className="space-y-5">
            <div>
              <label className="label-text">무엇을 도와드릴 수 있나요?</label>
              <input
                type="text"
                value={newAsset.title}
                onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                placeholder="예: 집밥 만들어 드려요"
                className="input-field"
              />
            </div>

            <div>
              <label className="label-text">카테고리 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {ASSET_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setNewAsset({ ...newAsset, category: cat.label })}
                    className={`min-h-touch-lg rounded-lg border-2 flex flex-col items-center justify-center p-2
                               transition-colors ${
                                 newAsset.category === cat.label
                                   ? 'border-primary bg-primary-light'
                                   : 'border-line hover:border-line-strong'
                               }`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-caption text-ink">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-text">상세 설명</label>
              <textarea
                value={newAsset.description}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, description: e.target.value })
                }
                placeholder="어떤 도움을 드릴 수 있는지 설명해주세요"
                className="input-field min-h-[120px] resize-none"
              />
            </div>

            <div>
              <label className="label-text">시간 비용</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setNewAsset({
                      ...newAsset,
                      time_cost: Math.max(1, newAsset.time_cost - 1),
                    })
                  }
                  className="min-h-touch min-w-touch rounded-full bg-surface-muted
                             flex items-center justify-center text-h2 font-bold text-ink"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <span className="text-display font-bold text-primary">
                    {newAsset.time_cost}
                  </span>
                  <span className="text-h3 text-ink-muted ml-2">시간</span>
                </div>
                <button
                  onClick={() =>
                    setNewAsset({ ...newAsset, time_cost: newAsset.time_cost + 1 })
                  }
                  className="min-h-touch min-w-touch rounded-full bg-primary
                             flex items-center justify-center text-h2 font-bold text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddAsset} className="btn-primary flex-1">
                등록하기
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Assets List */}
      {loading ? (
        <div className="text-center py-8 text-ink-muted">불러오는 중...</div>
      ) : myAssets.length > 0 ? (
        <div className="space-y-4">
          {myAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => navigate(`/services/${asset.id}`)}
              className="card w-full text-left hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-body-lg font-semibold text-ink">
                  {asset.title}
                </h3>
                <div className="flex items-center gap-1 text-primary font-bold">
                  <Clock className="w-5 h-5" />
                  <span className="text-h3">{asset.time_cost}시간</span>
                </div>
              </div>
              <p className="text-body text-ink-muted mb-2">{asset.category}</p>
              {asset.description && (
                <p className="text-body text-ink-subtle line-clamp-2">
                  {asset.description}
                </p>
              )}
              {!asset.is_active && (
                <span className="inline-block mt-2 text-caption bg-surface-muted px-2 py-1 rounded">
                  비활성
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        !showAddForm && (
          <div className="card text-center py-12">
            <Sparkles className="w-14 h-14 mx-auto mb-4 text-ink-subtle" />
            <p className="text-body-lg text-ink-muted mb-4">
              아직 등록한 자산이 없습니다
            </p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              첫 자산 등록하기
            </button>
          </div>
        )
      )}
    </div>
  );
}
