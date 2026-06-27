import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Transaction, ThankYouMessage } from '../lib/supabase';
import { Clock, ArrowUp, ArrowDown, Heart } from 'lucide-react';

export function TimeBankPage() {
  const { profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [thankYouCount, setThankYouCount] = useState(0);
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
      const [transRes, thankYouRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, provider:profiles!transactions_provider_id_fkey(*), requester:profiles!transactions_requester_id_fkey(*)')
          .or(`provider_id.eq.${profile.id},requester_id.eq.${profile.id}`)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(30),
        supabase
          .from('thank_you_messages')
          .select('id', { count: 'exact' })
          .eq('receiver_id', profile.id),
      ]);

      setTransactions(transRes.data || []);
      setThankYouCount(thankYouRes.count || 0);
    } catch (error) {
      console.error('Error loading bank data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = transactions
    .filter((t) => t.provider_id === profile?.id)
    .reduce((sum, t) => sum + t.time_amount, 0);

  const totalSpent = transactions
    .filter((t) => t.requester_id === profile?.id)
    .reduce((sum, t) => sum + t.time_amount, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-5">
      {/* Balance Card */}
      <div className="card bg-gradient-to-br from-primary to-primary-dark text-white mb-6">
        <div className="text-center py-6">
          <p className="text-body-lg opacity-90 mb-2">나의 시간 잔액</p>
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-12 h-12 opacity-80" />
            <span className="text-display font-bold">{profile?.time_balance || 0}</span>
          </div>
          <p className="text-h3 opacity-80 mt-1">시간</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card bg-success-light">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="w-7 h-7 text-success" />
            <span className="text-body text-ink-muted">적립</span>
          </div>
          <p className="text-h1 font-bold text-success">{totalEarned}시간</p>
        </div>
        <div className="card bg-warn-light">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="w-7 h-7 text-warn" />
            <span className="text-body text-ink-muted">사용</span>
          </div>
          <p className="text-h1 font-bold text-warn">{totalSpent}시간</p>
        </div>
      </div>

      {/* Thank You Count */}
      <div className="card mb-6 bg-surface-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <div>
              <p className="text-body-lg font-semibold text-ink">받은 감사</p>
              <p className="text-body text-ink-muted">도와드려서 감사합니다</p>
            </div>
          </div>
          <div className="text-h1 font-bold text-primary">{thankYouCount}</div>
        </div>
      </div>

      {/* Transaction History */}
      <section>
        <h2 className="section-title">거래 내역</h2>

        {loading ? (
          <div className="text-center py-8 text-ink-muted">불러오는 중...</div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isEarning = transaction.provider_id === profile?.id;
              const otherPerson = isEarning ? transaction.requester : transaction.provider;
              return (
                <div key={transaction.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center
                                   ${isEarning ? 'bg-success-light' : 'bg-warn-light'}`}
                      >
                        {isEarning ? (
                          <ArrowUp className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowDown className="w-5 h-5 text-warn" />
                        )}
                      </div>
                      <div>
                        <p className="text-body-lg font-semibold text-ink">
                          {isEarning ? '도움을 드렸어요' : '도움을 받았어요'}
                        </p>
                        <p className="text-body text-ink-muted">
                          {otherPerson?.name || '익명'}님
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-h3 font-bold ${
                          isEarning ? 'text-success' : 'text-warn'
                        }`}
                      >
                        {isEarning ? '+' : '-'}
                        {transaction.time_amount}시간
                      </p>
                      <p className="text-caption text-ink-subtle">
                        {formatDate(transaction.completed_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Clock className="w-14 h-14 mx-auto mb-4 text-ink-subtle" />
            <p className="text-body-lg text-ink-muted">아직 거래 내역이 없습니다</p>
          </div>
        )}
      </section>
    </div>
  );
}
