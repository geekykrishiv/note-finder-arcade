import { cn } from '@/lib/utils';
import { NOTE_NAMES, NoteName } from '@/hooks/useAudio';

interface NoteSelectorProps {
  selectedNote: NoteName | null;
  onSelectNote: (note: NoteName) => void;
  disabled?: boolean;
}

// Group notes for visual layout - natural and accidentals
const naturalNotes: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const accidentalNotes: NoteName[] = ['C#', 'D#', 'F#', 'G#', 'A#'];

export function NoteSelector({ selectedNote, onSelectNote, disabled }: NoteSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Select Note
      </label>
      
      {/* Natural notes */}
      <div className="grid grid-cols-7 gap-2">
        {naturalNotes.map((note) => (
          <button
            key={note}
            onClick={() => onSelectNote(note)}
            disabled={disabled}
            className={cn(
              'note-button h-14 sm:h-16 rounded-lg font-mono text-lg sm:text-xl font-bold',
              'transition-all duration-200 press-effect',
              selectedNote === note && 'note-button-selected',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {note}
          </button>
        ))}
      </div>

      {/* Accidental notes (sharps) */}
      <div className="grid grid-cols-5 gap-2 px-4">
        {accidentalNotes.map((note) => (
          <button
            key={note}
            onClick={() => onSelectNote(note)}
            disabled={disabled}
            className={cn(
              'note-button h-12 sm:h-14 rounded-lg font-mono text-base sm:text-lg font-bold',
              'transition-all duration-200 press-effect',
              selectedNote === note && 'note-button-selected',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}
