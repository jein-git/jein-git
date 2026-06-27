import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SERVICE_CATEGORIES } from '../lib/supabase';
import type { Service } from '../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Send } from 'lucide-react';

export function ServiceRegistrationPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [timeCost, setTimeCost] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      loadMyServices();
    }
  }, [profile?.id]);

  const loadMyServices = async () => {
    if (!profile?.id) return;

    try {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', profile.id)
        .order('created_at', { ascending: false });

      setMyServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    if (!title.trim() || !description.trim() || !category) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from('services')
          .update({
            title: title.trim(),
            description: description.trim(),
            category,
            time_cost: timeCost,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('services').insert({
          provider_id: profile.id,
          title: title.trim(),
          description: description.trim(),
          category,
          time_cost: timeCost,
          is_active: true,
        });

        if (insertError) throw insertError;
      }

      resetForm();
      loadMyServices();
    } catch (err) {
      setError('등록에 실패했습니다. 다시 시도해주세요.');
      console.error('Error saving service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setTitle(service.title);
    setDescription(service.description);
    setCategory(service.category);
    setTimeCost(service.time_cost);
    setShowForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('정말 이 서비스를 삭제하시겠습니까?')) return;

    try {
      await supabase.from('services').delete().eq('id', serviceId);
      loadMyServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('services')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId);
      loadMyServices();
    } catch (error) {
      console.error('Error toggling service:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setTimeCost(1);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">내 서비스</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            등록하기
          </button>
        )}
      </div>

      {/* Service Form */}
      {showForm && (
        <div className="card mb-6">
          <h3 className="text-senior-lg font-semibold mb-4">
            {editingId ? '서비스 수정' : '새 서비스 등록'}
          </h3>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-senior">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-text">서비스 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="어떤 도움을 드릴 수 있나요?"
                className="input-field"
                maxLength={100}
              />
            </div>

            <div>
              <label className="label-text">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                <option value="">카테고리를 선택하세요</option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text">시간 비용</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTimeCost(Math.max(1, timeCost - 1))}
                  className="min-h-touch min-w-touch rounded-full bg-neutral-200 text-neutral-700
                             text-2xl font-bold hover:bg-neutral-300 transition-colors"
                >
                  -
                </button>
                <span className="text-3xl font-bold text-primary-600 min-w-[4rem] text-center">
                  {timeCost}
                </span>
                <button
                  type="button"
                  onClick={() => setTimeCost(Math.min(10, timeCost + 1))}
                  className="min-h-touch min-w-touch rounded-full bg-primary-500 text-white
                             text-2xl font-bold hover:bg-primary-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="label-text">상세 설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="서비스에 대해 자세히 설명해주세요"
                className="input-field min-h-[120px] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? '저장 중...' : editingId ? '수정하기' : '등록하기'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Services List */}
      {myServices.length > 0 ? (
        <div className="space-y-4">
          {myServices.map((service) => (
            <div key={service.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-senior-lg font-semibold">{service.title}</h3>
                    {!service.is_active && (
                      <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded">
                        비활성
                      </span>
                    )}
                  </div>
                  <p className="text-senior text-neutral-600">{service.category}</p>
                </div>
                <div className="text-primary-600 font-bold text-lg">
                  {service.time_cost}시간
                </div>
              </div>

              <p className="text-senior text-neutral-700 mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 min-h-touch flex items-center justify-center gap-2
                             bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>
                <button
                  onClick={() => handleToggleActive(service.id, service.is_active)}
                  className="flex-1 min-h-touch flex items-center justify-center gap-2
                             bg-primary-100 hover:bg-primary-200 rounded-xl transition-colors
                             text-primary-700"
                >
                  {service.is_active ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      숨기기
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      보이기
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="min-h-touch min-w-touch flex items-center justify-center
                             bg-red-100 hover:bg-red-200 rounded-xl transition-colors text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="card text-center py-12">
            <p className="text-senior text-neutral-600 mb-4">
              아직 등록된 서비스가 없습니다
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              첫 서비스 등록하기
            </button>
          </div>
        )
      )}
    </div>
  );
}
