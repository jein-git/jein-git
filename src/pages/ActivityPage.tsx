import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { HelpRequest, Service, Transaction } from '../lib/supabase';
import { Clock, Heart, CheckCircle, XCircle, MessageSquare, User } from 'lucide-react';
import { STATUS_LABELS } from '../lib/supabase';

type Tab = 'requests' | 'services' | 'history';

export function ActivityPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('requests');
  const [myRequests, setMyRequests] = useState<HelpRequest[]>([]);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const [requestsResult, servicesResult, transactionsResult] = await Promise.all([
        supabase
          .from('help_requests')
          .select('*')
          .eq('requester_id', profile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('services')
          .select('*')
          .eq('provider_id', profile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('transactions')
          .select('*, provider:profiles!transactions_provider_id_fkey(*), requester:profiles!transactions_requester_id_fkey(*)')
          .or(`provider_id.eq.${profile.id},requester_id.eq.${profile.id}`)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      setMyRequests(requestsResult.data || []);
      setMyServices(servicesResult.data || []);
      setMyTransactions(transactionsResult.data || []);
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchService = async (requestId: string, service: Service) => {
    try {
      // Start a transaction-like flow
      // 1. Update help request
      await supabase
        .from('help_requests')
        .update({
          matched_provider_id: service.provider_id,
          status: 'matched',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      // 2. Create transaction
      const request = myRequests.find((r) => r.id === requestId);
      if (request) {
        await supabase.from('transactions').insert({
          provider_id: service.provider_id,
          requester_id: profile!.id,
          help_request_id: requestId,
          time_amount: request.time_cost,
          status: 'pending',
        });
      }

      loadData();
    } catch (error) {
      console.error('Error matching service:', error);
      alert('매칭에 실패했습니다.');
    }
  };

  const handleCompleteTransaction = async (transactionId: string, isProvider: boolean) => {
    try {
      const transaction = myTransactions.find((t) => t.id === transactionId);
      if (!transaction) return;

      // Update transaction status
      await supabase
        .from('transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      // Update help request status
      if (transaction.help_request_id) {
        await supabase
          .from('help_requests')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', transaction.help_request_id);
      }

      // Update time balances
      const providerId = transaction.provider_id;
      const requesterId = transaction.requester_id;
      const timeAmount = transaction.time_amount;

      await supabase.rpc('update_time_balance', {
        user_id: providerId,
        amount: timeAmount,
      });

      await supabase.rpc('update_time_balance', {
        user_id: requesterId,
        amount: -timeAmount,
      });

      loadData();
      refreshProfile();
    } catch (error) {
      console.error('Error completing transaction:', error);
      alert('완료 처리에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'requests', label: '요청', count: myRequests.length },
    { key: 'services', label: '서비스', count: myServices.length },
    { key: 'history', label: '거래 내역', count: myTransactions.length },
  ];

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`min-h-touch flex items-center gap-2 px-4 rounded-xl whitespace-nowrap
                       transition-colors ${
                         activeTab === tab.key
                           ? 'bg-primary-500 text-white'
                           : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                       }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-sm ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-300 text-neutral-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-neutral-500">불러오는 중...</div>
      ) : (
        <>
          {/* My Help Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {myRequests.length > 0 ? (
                myRequests.map((request) => (
                  <div key={request.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-senior-lg font-semibold">{request.title}</h3>
                        <p className="text-senior text-neutral-600">{request.category}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            request.status === 'open'
                              ? 'bg-green-100 text-green-700'
                              : request.status === 'matched'
                              ? 'bg-blue-100 text-blue-700'
                              : request.status === 'completed'
                              ? 'bg-neutral-100 text-neutral-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {STATUS_LABELS[request.status]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-senior text-neutral-600">
                      <span>{formatDate(request.created_at)}</span>
                      <span className="flex items-center gap-1 font-medium text-primary-600">
                        <Clock className="w-4 h-4" />
                        {request.time_cost}시간
                      </span>
                    </div>

                    {request.status === 'matched' && request.matched_provider_id && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-senior text-blue-700">
                          도움을 줄 분과 매칭되었습니다!
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="card text-center py-8 text-neutral-500">
                  아직 요청한 도움이 없습니다
                </div>
              )}
            </div>
          )}

          {/* My Services */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              {myServices.length > 0 ? (
                myServices.map((service) => (
                  <div key={service.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-senior-lg font-semibold">{service.title}</h3>
                      {!service.is_active && (
                        <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded">
                          비활성
                        </span>
                      )}
                    </div>
                    <p className="text-senior text-neutral-600 mb-2">{service.category}</p>
                    <p className="text-senior text-neutral-700 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                      <span className="text-senior text-neutral-600">
                        {formatDate(service.created_at)}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-primary-600">
                        <Clock className="w-4 h-4" />
                        {service.time_cost}시간
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-8 text-neutral-500">
                  등록된 서비스가 없습니다
                </div>
              )}
            </div>
          )}

          {/* Transaction History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {myTransactions.length > 0 ? (
                myTransactions.map((transaction) => {
                  const isProvider = transaction.provider_id === profile?.id;
                  return (
                    <div key={transaction.id} className="card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {isProvider ? (
                            <CheckCircle className="w-6 h-6 text-accent-sage" />
                          ) : (
                            <Heart className="w-6 h-6 text-accent-coral" />
                          )}
                          <span className="text-senior font-medium">
                            {isProvider ? '도움을 드렸어요' : '도움을 받았어요'}
                          </span>
                        </div>
                        <div
                          className={`font-bold text-lg ${
                            isProvider ? 'text-accent-sage' : 'text-accent-coral'
                          }`}
                        >
                          {isProvider ? '+' : '-'}
                          {transaction.time_amount}시간
                        </div>
                      </div>

                      <p className="text-senior text-neutral-600 mb-3">
                        {isProvider
                          ? `${transaction.requester?.name || '익명'}님께`
                          : `${transaction.provider?.name || '익명'}님으로부터`}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <span className="text-senior text-neutral-500">
                          {formatDate(transaction.created_at)}
                        </span>
                        {transaction.status === 'completed' ? (
                          <span className="text-senior text-accent-sage font-medium flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            완료
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCompleteTransaction(transaction.id, isProvider)}
                            className="btn-secondary text-senior py-2 px-4"
                          >
                            완료 확인
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="card text-center py-8 text-neutral-500">
                  거래 내역이 없습니다
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
