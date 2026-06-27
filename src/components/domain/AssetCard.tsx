import type { Asset } from '../../types';
import { Clock } from 'lucide-react';
import { ASSET_CATEGORY_LABELS, ASSET_CATEGORY_ICONS } from '../../data/mock';
import { Card } from '../ui/Card';
import { formatTimes } from '../../lib/formatTimes';

type AssetCardProps = {
  asset: Asset;
  onClick?: () => void;
  showHours?: boolean;
};

export function AssetCard({ asset, onClick, showHours = true }: AssetCardProps) {
  const icon = ASSET_CATEGORY_ICONS[asset.category];
  const label = ASSET_CATEGORY_LABELS[asset.category];

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className="flex items-start gap-4"
    >
      {/* Icon Box */}
      <div className="w-14 h-14 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-body-lg font-semibold text-ink mb-1">{asset.title}</h3>
        <p className="text-body text-ink-muted line-clamp-2 mb-2">{asset.description}</p>
        <div className="flex items-center gap-3 text-caption text-ink-subtle">
          <span>{label}</span>
          {showHours && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTimes(asset.totalHours)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
