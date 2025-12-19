import { cn } from '@/lib/utils';
import { NoteName } from '@/hooks/useAudio';

interface FeedbackDisplayProps {
  isCorrect: boolean | null;
  targetNote: NoteName | null;
  targetOctave: number | null;
  selectedNote: NoteName | null;
  selectedOctave: number | null;
}

export function FeedbackDisplay({
  isCorrect,
  targetNote,
  targetOctave,
  selectedNote,
  selectedOctave,
}: FeedbackDisplayProps) {
  if (isCorrect === null) return null;

  return (
    <div
      className={cn(
        'p-6 sm:p-8 text-center',
        isCorrect ? 'pixel-feedback-correct' : 'pixel-feedback-incorrect',
      )}
    >
      {/* Result text */}
      <div className="mb-4">
        <span
          className={cn(
            'text-sm sm:text-base pixel-shadow',
            isCorrect ? 'text-foreground' : 'text-foreground',
            'pixel-bounce'
          )}
        >
          {isCorrect ? 'CORRECT!' : 'WRONG!'}
        </span>
      </div>

      {/* Note comparison */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3 text-[8px] sm:text-[10px]">
          <span className="text-foreground/70">ANSWER:</span>
          <span className="text-foreground pixel-shadow">
            {targetNote}{targetOctave}
          </span>
        </div>
        
        {!isCorrect && (
          <div className="flex items-center justify-center gap-3 text-[8px] sm:text-[10px]">
            <span className="text-foreground/70">YOUR GUESS:</span>
            <span className="text-foreground pixel-shadow">
              {selectedNote}{selectedOctave}
            </span>
          </div>
        )}
      </div>

      {/* Encouragement */}
      <div className="mt-4 text-[6px] sm:text-[8px] text-foreground/80">
        {isCorrect 
          ? 'GREAT EAR!' 
          : 'KEEP TRAINING!'}
      </div>
    </div>
  );
}
