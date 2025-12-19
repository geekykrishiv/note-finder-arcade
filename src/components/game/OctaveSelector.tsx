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
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Select Octave
      </label>
      
      <div className="flex justify-center gap-3">
        {octaveRange.map((octave) => (
          <button
            key={octave}
            onClick={() => onSelectOctave(octave)}
            disabled={disabled}
            className={cn(
              'note-button w-16 sm:w-20 h-14 sm:h-16 rounded-xl font-mono text-xl sm:text-2xl font-bold',
              'transition-all duration-200 press-effect',
              selectedOctave === octave && 'note-button-selected',
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
