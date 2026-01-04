import { cn } from '@/lib/utils';

export type GameMode = 'single-note' | 'interval';

interface ModeSelectorProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  disabled?: boolean;
}

const modes: { value: GameMode; label: string; description: string }[] = [
  { value: 'single-note', label: 'SINGLE NOTE', description: 'IDENTIFY THE NOTE' },
  { value: 'interval', label: 'INTERVAL', description: 'IDENTIFY THE DISTANCE' },
];

export function ModeSelector({ mode, onSelectMode, disabled }: ModeSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onSelectMode(m.value)}
          disabled={disabled}
          className={cn(
            'pixel-mode-button',
            'px-4 py-3 sm:px-6 sm:py-4',
            'min-w-[120px] sm:min-w-[150px]',
            'flex flex-col items-center gap-1',
            mode === m.value && 'pixel-mode-button-selected',
            disabled && 'opacity-40 cursor-not-allowed',
          )}
        >
          <span className="text-[8px] sm:text-[10px] pixel-shadow block">{m.label}</span>
          <span className="text-[5px] sm:text-[6px] text-muted-foreground block opacity-70">{m.description}</span>
        </button>
      ))}
    </div>
  );
}
