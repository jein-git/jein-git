import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Service, Profile } from '../lib/supabase';
import { Clock, User, MapPin, Phone, MessageCircle, ArrowLeft } from 'lucide-react';

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, provider:profiles!services_provider_id_fkey(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setService(data);
        setProvider(data.provider);
      }
    } catch (error) {
      console.error('Error loading service:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center py-12 text-neutral-500">불러오는 중...</div>
    );
  }

  if (!service) {
    return (
      <div className="p-4">
        <div className="card text-center py-12">
          <p className="text-senior text-neutral-600">서비스를 찾을 수 없습니다</p>
          <button onClick={() => navigate(-1)} className="btn-primary mt-4">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isOwnService = profile?.id === service.provider_id;

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-senior text-neutral-600 mb-4
                   min-h-touch px-2"
      >
        <ArrowLeft className="w-5 h-5" />
        이전으로
      </button>

      {/* Service Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm bg-accent-sage/20 text-accent-sage px-3 py-1 rounded-full">
            {service.category}
          </span>
          {!service.is_active && (
            <span className="text-sm bg-neutral-200 text-neutral-600 px-3 py-1 rounded-full">
              비활성
            </span>
          )}
        </div>

        <h1 className="text-senior-xl font-bold mb-4">{service.title}</h1>

        <p className="text-senior text-neutral-700 leading-relaxed mb-6">
          {service.description}
        </p>

        <div className="flex items-center justify-between py-4 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-primary-600">
            <Clock className="w-5 h-5" />
            <span className="text-senior-xl font-bold">{service.time_cost}시간</span>
          </div>
          <div className="text-senior text-neutral-500">
            {new Date(service.created_at).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      {/* Provider Card */}
      <div className="card mb-6">
        <h2 className="text-senior-lg font-semibold mb-4">도움을 줄 분</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            {provider?.profile_image_url ? (
              <img
                src={provider.profile_image_url}
                alt={provider.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary-500" />
            )}
          </div>
          <div>
            <p className="text-senior-lg font-semibold">{provider?.name || '익명'}</p>
            {provider?.intro && (
              <p className="text-senior text-neutral-600 mt-1 line-clamp-2">
                {provider.intro}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact */}
      {!isOwnService && showContact && provider && (
        <div className="card mb-6 bg-primary-50">
          <h2 className="text-senior-lg font-semibold mb-4">연락하기</h2>
          <div className="space-y-3">
            {provider.phone && (
              <a
                href={`tel:${provider.phone}`}
                className="btn-primary block text-center"
              >
                <Phone className="w-5 h-5 inline mr-2" />
                {provider.phone}
              </a>
            )}
            {provider.address && (
              <div className="flex items-center gap-3 text-senior">
                <MapPin className="w-5 h-5 text-neutral-500" />
                <span>{provider.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {!isOwnService ? (
        !showContact ? (
          <button onClick={() => setShowContact(true)} className="btn-primary w-full">
            연락처 보기
          </button>
        ) : (
          <button
            onClick={() => navigate('/request')}
            className="btn-secondary w-full mt-4"
          >
            이 분에게 도움 요청하기
          </button>
        )
      ) : (
        <button
          onClick={() => navigate('/services')}
          className="btn-secondary w-full"
        >
          내 서비스 관리하기
        </button>
      )}
    </div>
  );
}
