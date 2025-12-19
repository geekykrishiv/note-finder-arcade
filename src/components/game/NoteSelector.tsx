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
    <div className="space-y-4">
      <label className="font-retro text-lg text-muted-foreground uppercase tracking-widest">
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
              'retro-note-button h-14 sm:h-16',
              'font-retro text-2xl sm:text-3xl',
              selectedNote === note && 'retro-note-button-selected',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {note}
          </button>
        ))}
      </div>

      {/* Accidental notes (sharps) */}
      <div className="grid grid-cols-5 gap-2 px-6">
        {accidentalNotes.map((note) => (
          <button
            key={note}
            onClick={() => onSelectNote(note)}
            disabled={disabled}
            className={cn(
              'retro-note-button h-12 sm:h-14',
              'font-retro text-xl sm:text-2xl',
              selectedNote === note && 'retro-note-button-selected',
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
