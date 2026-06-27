import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatTimes } from '../lib/formatTimes';
import type { TimeTransaction } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Clock, ArrowUp, ArrowDown, Loader2, AlertCircle } from 'lucide-react';

// 날짜 포맷: "6월 19일 오후 2:30"
function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// 개별 거래 내역 카드
function TransactionCard({ tx }: { tx: TimeTransaction }) {
  const isEarn = tx.type === 'earn';

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-colors
        ${isEarn
          ? 'bg-success-light border-success/30'
          : 'bg-[#FFF0F0] border-[#FFCACA]'
        }`}
    >
      {/* 방향 아이콘 */}
      <div
        className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center
          ${isEarn ? 'bg-success text-white' : 'bg-accent text-white'}`}
      >
        {isEarn
          ? <ArrowUp className="w-6 h-6" />
          : <ArrowDown className="w-6 h-6" />
        }
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        {/* 적립/차감 금액 */}
        <p className={`text-h3 font-bold mb-1
          ${isEarn ? 'text-success' : 'text-accent'}`}>
          {isEarn ? '+' : '-'}{formatTimes(tx.amount)}
          {' '}
          <span className="text-body font-semibold">
            {isEarn ? '적립' : '사용'}
          </span>
        </p>

        {/* 설명 */}
        {tx.description && (
          <p className="text-body text-ink mb-1 line-clamp-2">{tx.description}</p>
        )}

        {/* 거래 후 잔액 */}
        <p className="text-caption text-ink-muted">
          이후 잔액: {formatTimes(tx.balance_after)}
        </p>

        {/* 날짜 */}
        <p className="text-caption text-ink-subtle mt-0.5">
          {formatDateTime(tx.created_at)}
        </p>
      </div>
    </div>
  );
}

export function BankbookPage() {
  const { profile, user } = useAuth();

  const [transactions, setTransactions] = useState<TimeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 잔액: AuthContext의 profile에서 실시간 반영
  const balance = profile?.time_balance ?? 0;

  // 거래 내역 조회
  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('time_transactions')
      .select('id, user_id, care_match_id, type, amount, balance_after, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      setError('시간 사용 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      setTransactions((data as TimeTransaction[]) ?? []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 이번 달 적립·사용 합산
  const now = new Date();
  const thisMonthTxs = transactions.filter((tx) => {
    const d = new Date(tx.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthEarned = thisMonthTxs
    .filter((t) => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthSpent = thisMonthTxs
    .filter((t) => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen">
      {/* 잔액 Hero: 파란 배경으로 시각적으로 강조 */}
      <div className="bg-primary text-white px-6 pt-6 pb-10">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-7 h-7 opacity-80" />
          <span className="text-body-lg opacity-90">내 시간</span>
        </div>

        {/* 잔액 크게 표시 */}
        <div className="mb-6">
          <p className="text-body opacity-75 mb-1">현재 잔액</p>
          <div className="flex items-end gap-2">
            <span className="text-[64px] leading-none font-bold tracking-tight">
              {Number.isInteger(balance) ? balance : Number(balance).toFixed(1)}
            </span>
            <span className="text-h2 opacity-80 pb-2">타임</span>
          </div>
        </div>

        {/* 이번 달 요약 */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-caption opacity-70 mb-0.5">이번 달 적립</p>
            <div className="flex items-center gap-1.5">
              <ArrowUp className="w-5 h-5 opacity-80" />
              <span className="text-body-lg font-semibold">
                +{formatTimes(monthEarned)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-caption opacity-70 mb-0.5">이번 달 사용</p>
            <div className="flex items-center gap-1.5">
              <ArrowDown className="w-5 h-5 opacity-80" />
              <span className="text-body-lg font-semibold">
                -{formatTimes(monthSpent)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 시간 사용 내역 */}
      <div className="px-6 -mt-6">
        <div className="bg-surface-base rounded-t-3xl pt-8">
          <h2 className="text-h2 font-bold text-ink mb-5">시간 사용 내역</h2>

          {/* 로딩 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-body-lg text-ink-muted">불러오는 중...</p>
            </div>
          )}

          {/* 오류 */}
          {!loading && error && (
            <Card variant="muted" className="flex items-start gap-3 py-5">
              <AlertCircle className="w-6 h-6 text-warn flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-body font-semibold text-ink mb-1">불러오기 실패</p>
                <p className="text-body text-ink-muted">{error}</p>
                <button
                  onClick={fetchTransactions}
                  className="mt-3 text-body-lg text-primary font-semibold"
                >
                  다시 시도
                </button>
              </div>
            </Card>
          )}

          {/* 빈 상태 */}
          {!loading && !error && transactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-16 h-16 text-ink-subtle mb-5" />
              <p className="text-h3 font-bold text-ink mb-2">
                아직 시간 사용 내역이 없습니다
              </p>
              <p className="text-body-lg text-ink-muted">
                도움을 주거나 받으면 여기에 기록됩니다.
              </p>
            </div>
          )}

          {/* 거래 카드 목록 */}
          {!loading && !error && transactions.length > 0 && (
            <div className="space-y-3 pb-10">
              {transactions.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
