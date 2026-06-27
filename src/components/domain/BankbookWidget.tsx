import { Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatTimes } from '../../lib/formatTimes';

type BankbookWidgetProps = {
  balance: number;
  earnedThisMonth: number;
  spentThisMonth: number;
  onClick?: () => void;
};

export function BankbookWidget({
  balance,
  earnedThisMonth,
  spentThisMonth,
  onClick,
}: BankbookWidgetProps) {
  return (
    <Card
      variant="primary"
      hoverable={!!onClick}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 opacity-80" />
          <span className="text-body-lg opacity-90">내 시간 통장</span>
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-display font-bold">{formatTimes(balance)}</span>
      </div>

      <div className="flex gap-6 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <ArrowUp className="w-5 h-5 opacity-80" />
          <span className="text-body-lg">+{formatTimes(earnedThisMonth)}</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowDown className="w-5 h-5 opacity-80" />
          <span className="text-body-lg">-{formatTimes(spentThisMonth)}</span>
        </div>
      </div>
    </Card>
  );
}
