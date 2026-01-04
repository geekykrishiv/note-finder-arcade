import { cn } from '@/lib/utils';
import { INTERVALS, IntervalName } from '@/hooks/useIntervalMode';

interface IntervalSelectorProps {
  selectedInterval: IntervalName | null;
  onSelectInterval: (interval: IntervalName) => void;
  disabled?: boolean;
}

export function IntervalSelector({ selectedInterval, onSelectInterval, disabled }: IntervalSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-[7px] sm:text-[8px] text-muted-foreground text-center">
        SELECT INTERVAL
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
        {INTERVALS.map((interval) => (
          <button
            key={interval.name}
            onClick={() => onSelectInterval(interval.name)}
            disabled={disabled}
            className={cn(
              'pixel-note-button px-2 py-2 sm:px-3 sm:py-3',
              'flex flex-col items-center gap-0.5',
              selectedInterval === interval.name && 'pixel-note-button-selected',
              disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            <span className="text-[8px] sm:text-[10px] pixel-shadow">{interval.short}</span>
            <span className="text-[5px] sm:text-[6px] text-muted-foreground opacity-70 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {interval.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
