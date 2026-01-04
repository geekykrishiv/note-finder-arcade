import { cn } from '@/lib/utils';
import { Difficulty } from '@/hooks/useTrainingSession';

interface LevelSelectorProps {
  level: Difficulty;
  onSelectLevel: (level: Difficulty) => void;
  disabled?: boolean;
}

const levels: { value: Difficulty; label: string; range: string; color: string }[] = [
  { value: 'easy', label: 'LEVEL 1', range: 'OCTAVES 3-5', color: 'level-1' },
  { value: 'medium', label: 'LEVEL 2', range: 'OCTAVES 2-6', color: 'level-2' },
  { value: 'hard', label: 'LEVEL 3', range: 'OCTAVES 0-7', color: 'level-3' },
];

export function LevelSelector({ level, onSelectLevel, disabled }: LevelSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[8px] sm:text-[10px] text-muted-foreground pixel-shadow">
        SELECT LEVEL
      </span>
      <div className="flex items-center gap-3 sm:gap-4">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => onSelectLevel(l.value)}
            disabled={disabled}
            className={cn(
              'pixel-level-button',
              'px-4 py-3 sm:px-6 sm:py-4',
              'min-w-[80px] sm:min-w-[100px]',
              'flex flex-col items-center gap-1',
              level === l.value && `${l.color}-selected`,
              disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            <span className="text-[10px] sm:text-xs pixel-shadow block whitespace-nowrap">{l.label}</span>
            <span className="text-[6px] sm:text-[8px] text-muted-foreground block opacity-80">{l.range}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
