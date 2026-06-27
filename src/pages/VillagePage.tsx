import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MeetingCard } from '../components/domain/MeetingCard';
import { MapPin, Phone, Users } from 'lucide-react';
import { mockHub, mockMeetings } from '../data/mock';

export function VillagePage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* Hub Card */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-h2 font-bold text-ink mb-1">{mockHub.name}</h1>
            <div className="flex items-center gap-2 text-body text-ink-muted">
              <MapPin className="w-4 h-4" />
              <span>{mockHub.address}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-muted rounded-lg">
          <div>
            <p className="text-body text-ink-muted">코디네이터</p>
            <p className="text-body-lg font-semibold text-ink">{mockHub.coordinator.name}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = `tel:${mockHub.coordinator.phone}`}
          >
            <Phone className="w-5 h-5" />
            전화
          </Button>
        </div>
      </Card>

      {/* Weekly Meetings */}
      <section>
        <h2 className="text-h2 font-bold text-ink mb-4">이번 주 모임</h2>

        {mockMeetings.length > 0 ? (
          <div className="space-y-4">
            {mockMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onJoin={() => alert('모임 신청')}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Users className="w-14 h-14 mx-auto mb-4 text-ink-subtle" />
            <p className="text-body-lg text-ink-muted mb-2">
              이번 주는 예정된 모임이 없어요
            </p>
            <Button variant="secondary" onClick={() => alert('모임 만들기')}>
              모임 만들기
            </Button>
          </Card>
        )}
      </section>

      {/* Info */}
      <Card variant="muted" className="mt-6">
        <p className="text-body text-ink-muted">
          마을 사랑방은 이웃들과 함께하는 소통의 공간입니다.
          <br />
          모임에 참여하거나 직접 만들어보세요.
        </p>
      </Card>
    </div>
  );
}
