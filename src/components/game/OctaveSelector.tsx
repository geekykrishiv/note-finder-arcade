import { cn } from '@/lib/utils';

interface OctaveSelectorProps {
  selectedOctave: number | null;
  onSelectOctave: (octave: number) => void;
  disabled?: boolean;
}

// Playable octave range (3-5 for pleasant sounds in training)
const octaveRange = [3, 4, 5];

export function OctaveSelector({ selectedOctave, onSelectOctave, disabled }: OctaveSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="font-retro text-lg text-muted-foreground uppercase tracking-widest">
        Select Octave
      </label>
      
      <div className="flex justify-center gap-4">
        {octaveRange.map((octave) => (
          <button
            key={octave}
            onClick={() => onSelectOctave(octave)}
            disabled={disabled}
            className={cn(
              'retro-note-button w-18 sm:w-24 h-14 sm:h-16',
              'font-retro text-3xl sm:text-4xl',
              selectedOctave === octave && 'retro-note-button-selected',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            {octave}
          </button>
        ))}
      </div>
    </div>
  );
}
