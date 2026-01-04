import { cn } from '@/lib/utils';
import { NoteName } from '@/hooks/useAudio';
import { IntervalName, INTERVALS } from '@/hooks/useIntervalMode';

interface IntervalFeedbackProps {
  isCorrect: boolean | null;
  targetInterval: typeof INTERVALS[number] | null;
  selectedInterval: IntervalName | null;
  firstNote: NoteName | null;
  secondNote: NoteName | null;
  octave: number | null;
}

export function IntervalFeedback({
  isCorrect,
  targetInterval,
  selectedInterval,
  firstNote,
  secondNote,
  octave,
}: IntervalFeedbackProps) {
  if (isCorrect === null) return null;

  return (
    <div
      className={cn(
        'p-4 sm:p-6 text-center',
        isCorrect ? 'pixel-feedback-correct' : 'pixel-feedback-incorrect',
      )}
    >
      {/* Result Icon */}
      <div className="flex justify-center mb-3">
        <div className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center',
          isCorrect ? 'text-[#0a2f1a]' : 'text-foreground'
        )}>
          <span className="text-2xl sm:text-3xl pixel-shadow">
            {isCorrect ? '★' : '✕'}
          </span>
        </div>
      </div>

      {/* Result Text */}
      <p className="text-[10px] sm:text-xs pixel-shadow mb-2">
        {isCorrect ? 'CORRECT!' : 'WRONG!'}
      </p>

      {/* Notes Played */}
      <p className="text-[8px] sm:text-[10px] mb-2 opacity-90">
        {firstNote}{octave} → {secondNote}{octave}
      </p>

      {/* Answer Details */}
      <div className="text-[7px] sm:text-[8px] space-y-1 opacity-80">
        {!isCorrect && (
          <>
            <p>YOU SAID: {selectedInterval}</p>
            <p>ANSWER: {targetInterval?.name}</p>
          </>
        )}
        {isCorrect && (
          <p>{targetInterval?.name}</p>
        )}
      </div>
    </div>
  );
}
