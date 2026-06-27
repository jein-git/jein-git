import type { Meeting } from '../../types';
import { Users, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MEETING_CATEGORY_LABELS } from '../../data/mock';

type MeetingCardProps = {
  meeting: Meeting;
  onJoin?: () => void;
};

const MEETING_ICONS: Record<Meeting['category'], string> = {
  banchan: '🍽️',
  class: '📚',
  tea: '☕',
  walk: '🚶',
};

export function MeetingCard({ meeting, onJoin }: MeetingCardProps) {
  const icon = MEETING_ICONS[meeting.category];
  const categoryLabel = MEETING_CATEGORY_LABELS[meeting.category];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]}) ${
      date.getHours() >= 12 ? '오후' : '오전'
    } ${date.getHours() % 12 || 12}시`;
  };

  const progress = (meeting.participants / meeting.capacity) * 100;

  return (
    <Card className="flex gap-4">
      {/* Icon */}
      <div className="w-14 h-14 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-caption px-2 py-0.5 rounded bg-surface-muted text-ink-muted">
            {categoryLabel}
          </span>
        </div>

        <h3 className="text-body-lg font-semibold text-ink mb-2">{meeting.title}</h3>

        <p className="text-body text-ink-muted mb-1">{formatDate(meeting.date)}</p>

        <div className="flex items-center gap-2 text-body text-ink-subtle mb-3">
          <MapPin className="w-4 h-4" />
          <span>{meeting.location}</span>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-caption mb-1">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {meeting.participants}/{meeting.capacity}명
            </span>
            <span className={progress >= 80 ? 'text-accent' : 'text-ink-subtle'}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-line rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progress >= 80 ? 'bg-accent' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Button */}
        <Button
          variant={meeting.isJoined ? 'secondary' : 'primary'}
          size="sm"
          disabled={meeting.isJoined}
          onClick={onJoin}
          className="w-full"
        >
          {meeting.isJoined ? '신청 완료' : '신청하기'}
        </Button>
      </div>
    </Card>
  );
}
