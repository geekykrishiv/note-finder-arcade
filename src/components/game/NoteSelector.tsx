import { cn } from '@/lib/utils';
import { NOTE_NAMES, NoteName } from '@/hooks/useAudio';

interface NoteSelectorProps {
  selectedNote: NoteName | null;
  onSelectNote: (note: NoteName) => void;
  disabled?: boolean;
}

// Group notes for visual layout - natural and accidentals (FLATS)
const naturalNotes: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const accidentalNotes: NoteName[] = ['Db', 'Eb', 'Gb', 'Ab', 'Bb'];

export function NoteSelector({ selectedNote, onSelectNote, disabled }: NoteSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-widest pixel-shadow">
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
              'pixel-note-button h-12 sm:h-14',
              selectedNote === note && 'pixel-note-button-selected',
              disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            {note}
          </button>
        ))}
      </div>

      {/* Accidental notes (flats) */}
      <div className="grid grid-cols-5 gap-2 px-4 sm:px-6">
        {accidentalNotes.map((note) => (
          <button
            key={note}
            onClick={() => onSelectNote(note)}
            disabled={disabled}
            className={cn(
              'pixel-note-button h-10 sm:h-12',
              selectedNote === note && 'pixel-note-button-selected',
              disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}
