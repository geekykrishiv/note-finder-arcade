import { cn } from '@/lib/utils';
import { NoteName } from '@/hooks/useAudio';
import { CheckCircle2, XCircle, Star } from 'lucide-react';

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
        'flex flex-col items-center gap-4 p-6 rounded-xl animate-scale-in',
        isCorrect ? 'retro-feedback-correct' : 'retro-feedback-incorrect',
      )}
    >
      <div className="flex items-center gap-3">
        {isCorrect ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-success" />
            <span className="font-pixel text-lg sm:text-xl text-success">PERFECT!</span>
            <Star className="w-6 h-6 text-success fill-success" />
          </>
        ) : (
          <>
            <XCircle className="w-8 h-8 text-destructive" />
            <span className="font-pixel text-lg sm:text-xl text-destructive">TRY AGAIN</span>
          </>
        )}
      </div>

      {!isCorrect && targetNote && targetOctave && (
        <div className="flex flex-col items-center gap-3">
          <p className="font-retro text-xl text-muted-foreground">The note was:</p>
          <div className="flex items-baseline gap-1">
            <span className="font-pixel text-4xl text-primary">
              {targetNote}
            </span>
            <span className="font-retro text-3xl text-primary/70">
              {targetOctave}
            </span>
          </div>
          <p className="font-retro text-lg text-muted-foreground mt-1">
            You guessed: <span className="text-foreground">{selectedNote}{selectedOctave}</span>
          </p>
        </div>
      )}

      {isCorrect && (
        <div className="flex items-baseline gap-1">
          <span className="font-pixel text-4xl text-success">
            {targetNote}
          </span>
          <span className="font-retro text-3xl text-success/70">
            {targetOctave}
          </span>
        </div>
      )}
    </div>
  );
}
