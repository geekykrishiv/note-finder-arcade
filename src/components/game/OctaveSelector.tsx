import { cn } from '@/lib/utils';

interface OctaveSelectorProps {
  selectedOctave: number | null;
  onSelectOctave: (octave: number) => void;
  disabled?: boolean;
  minOctave?: number;
  maxOctave?: number;
}

export function OctaveSelector({ 
  selectedOctave, 
  onSelectOctave, 
  disabled,
  minOctave = 2,
  maxOctave = 6,
}: OctaveSelectorProps) {
  // Generate octave range array
  const octaveRange = [];
  for (let i = minOctave; i <= maxOctave; i++) {
    octaveRange.push(i);
  }

  return (
    <div className="space-y-4">
      <label className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-widest pixel-shadow">
        Select Octave
      </label>
      
      <div className="flex justify-center flex-wrap gap-2 sm:gap-3">
        {octaveRange.map((octave) => (
          <button
            key={octave}
            onClick={() => onSelectOctave(octave)}
            disabled={disabled}
            className={cn(
              'pixel-note-button w-12 h-12 sm:w-14 sm:h-14',
              selectedOctave === octave && 'pixel-note-button-selected',
              disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            {octave}
          </button>
        ))}
      </div>
    </div>
  );
}
