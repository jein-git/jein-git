type ProgressBarProps = {
  current: number;
  total: number;
  showSteps?: boolean;
  className?: string;
};

export function ProgressBar({ current, total, showSteps = false, className = '' }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showSteps && (
          <span className="text-body text-ink-muted">
            {current} / {total}
          </span>
        )}
        <span className="text-caption text-ink-subtle ml-auto">{percentage}%</span>
      </div>
      <div className="h-3 bg-line rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
