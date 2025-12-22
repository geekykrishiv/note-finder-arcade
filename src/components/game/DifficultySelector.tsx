import { cn } from '@/lib/utils';
import { Difficulty } from '@/hooks/useTrainingSession';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

const difficulties: { value: Difficulty; label: string; range: string; color: string }[] = [
  { value: 'easy', label: 'EASY', range: '3-5', color: 'difficulty-easy' },
  { value: 'medium', label: 'MEDIUM', range: '2-6', color: 'difficulty-medium' },
  { value: 'hard', label: 'HARD', range: '0-7', color: 'difficulty-hard' },
];

export function DifficultySelector({ difficulty, onSelectDifficulty, disabled }: DifficultySelectorProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {difficulties.map((d) => (
        <button
          key={d.value}
          onClick={() => onSelectDifficulty(d.value)}
          disabled={disabled}
          className={cn(
            'pixel-difficulty-button px-3 py-2 sm:px-4 sm:py-2',
            difficulty === d.value && `${d.color}-selected`,
            disabled && 'opacity-40 cursor-not-allowed',
          )}
        >
          <span className="text-[6px] sm:text-[8px] pixel-shadow block">{d.label}</span>
          <span className="text-[5px] sm:text-[6px] text-muted-foreground block mt-0.5">{d.range}</span>
        </button>
      ))}
    </div>
  );
}
