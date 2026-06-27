import type { Transaction } from '../../types';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatTimes } from '../../lib/formatTimes';

type TransactionItemProps = {
  transaction: Transaction;
  onClick?: () => void;
};

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const isEarn = transaction.type === 'earn';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card hoverable={!!onClick} onClick={onClick} className="flex items-center gap-4">
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                   ${isEarn ? 'bg-success-light' : 'bg-warn-light'}`}
      >
        {isEarn ? (
          <ArrowUp className="w-6 h-6 text-success" />
        ) : (
          <ArrowDown className="w-6 h-6 text-warn" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-body-lg font-semibold text-ink truncate">
          {transaction.activityTitle}
        </h3>
        <p className="text-body text-ink-muted">
          {transaction.counterpartyNickname} · {transaction.category}
        </p>
        <p className="text-caption text-ink-subtle">{formatDate(transaction.date)}</p>
      </div>

      {/* Hours */}
      <div className="text-right">
        <p className={`text-h3 font-bold ${isEarn ? 'text-success' : 'text-warn'}`}>
          {isEarn ? '+' : '-'}{formatTimes(transaction.hours)}
        </p>
      </div>
    </Card>
  );
}
