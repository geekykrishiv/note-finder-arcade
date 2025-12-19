import { cn } from '@/lib/utils';
import { NoteName } from '@/hooks/useAudio';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

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
  if (isCorrect === null) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 p-6 rounded-2xl animate-scale-in',
        isCorrect ? 'bg-success/10' : 'bg-destructive/10',
        isCorrect ? 'feedback-correct' : 'feedback-incorrect',
      )}
    >
      <div className="flex items-center gap-3">
        {isCorrect ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-success" />
            <span className="text-2xl font-bold text-success">Perfect!</span>
            <Sparkles className="w-6 h-6 text-success animate-pulse" />
          </>
        ) : (
          <>
            <XCircle className="w-8 h-8 text-destructive" />
            <span className="text-2xl font-bold text-destructive">Not quite</span>
          </>
        )}
      </div>

      {!isCorrect && targetNote && targetOctave && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground">The note was:</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-mono font-bold text-primary">
              {targetNote}
            </span>
            <span className="text-2xl font-mono text-primary/70">
              {targetOctave}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            You guessed: {selectedNote}{selectedOctave}
          </p>
        </div>
      )}

      {isCorrect && (
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-mono font-bold text-success">
            {targetNote}
          </span>
          <span className="text-2xl font-mono text-success/70">
            {targetOctave}
          </span>
        </div>
      )}
    </div>
  );
}
