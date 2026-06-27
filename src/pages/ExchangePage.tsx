import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { HelpRequest, Service, Profile } from '../lib/supabase';
import { ArrowUp, ArrowDown, ChevronLeft, Clock, Users } from 'lucide-react';

type Tab = 'receive' | 'give';

export function ExchangePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('receive');
  const [services, setServices] = useState<(Service & { provider: Profile })[]>([]);
  const [requests, setRequests] = useState<(HelpRequest & { requester: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesRes, requestsRes] = await Promise.all([
        supabase
          .from('services')
          .select('*, provider:profiles!services_provider_id_fkey(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('help_requests')
          .select('*, requester:profiles!help_requests_requester_id_fkey(*)')
          .eq('status', 'open')
          .order('created_at', { ascending: false }),
      ]);

      setServices((servicesRes.data as any) || []);
      setRequests((requestsRes.data as any) || []);
    } catch (error) {
      console.error('Error loading exchange data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <header className="sticky top-0 bg-surface-base border-b border-line z-10">
        <div className="px-5 py-4">
          <h1 className="text-h1 font-bold text-ink text-center">주고받기</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line">
          <button
            onClick={() => setActiveTab('receive')}
            className={`flex-1 min-h-touch-lg flex items-center justify-center gap-2
                       transition-colors border-b-2 ${
                         activeTab === 'receive'
                           ? 'border-primary text-primary font-semibold'
                           : 'border-transparent text-ink-muted'
                       }`}
          >
            <ArrowDown className="w-6 h-6" />
            <span className="text-body-lg">도움 받기</span>
          </button>
          <button
            onClick={() => setActiveTab('give')}
            className={`flex-1 min-h-touch-lg flex items-center justify-center gap-2
                       transition-colors border-b-2 ${
                         activeTab === 'give'
                           ? 'border-primary text-primary font-semibold'
                           : 'border-transparent text-ink-muted'
                       }`}
          >
            <ArrowUp className="w-6 h-6" />
            <span className="text-body-lg">도움 주기</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-5">
        {loading ? (
          <div className="text-center py-12 text-ink-muted">불러오는 중...</div>
        ) : activeTab === 'receive' ? (
          <>
            {/* Receive Info */}
            <div className="card bg-surface-muted mb-6">
              <p className="text-body-lg text-ink">
                도움이 필요하신가요? 이웃들이 제안하는 서비스를 확인해보세요.
              </p>
            </div>

            {/* Services List */}
            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="card w-full text-left hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-light
                                     flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-body-lg font-semibold text-ink mb-1">
                          {service.title}
                        </h3>
                        <p className="text-body text-ink-muted mb-2">
                          {service.provider?.name}
                        </p>
                        <p className="text-body text-ink-subtle line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <Clock className="w-5 h-5" />
                          <span className="text-h3">{service.time_cost}</span>
                        </div>
                        <p className="text-caption text-ink-subtle mt-1">
                          {formatTime(service.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-body-lg text-ink-muted">
                  현재 제안된 서비스가 없습니다
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Give Info */}
            <div className="card bg-surface-muted mb-6">
              <p className="text-body-lg text-ink">
                도움이 필요한 이웃에게 당신의 시간을 나눠주세요.
              </p>
            </div>

            {/* Requests List */}
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => navigate(`/request/${request.id}`)}
                    className="card w-full text-left hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-warn-light
                                     flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-warn" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-body-lg font-semibold text-ink mb-1">
                          {request.title}
                        </h3>
                        <p className="text-body text-ink-muted mb-2">
                          {request.requester?.name}
                        </p>
                        <p className="text-body text-ink-subtle line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <Clock className="w-5 h-5" />
                          <span className="text-h3">{request.time_cost}</span>
                        </div>
                        <p className="text-caption text-ink-subtle mt-1">
                          {formatTime(request.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-body-lg text-ink-muted">
                  도움 요청이 없습니다
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
