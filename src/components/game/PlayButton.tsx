import { cn } from '@/lib/utils';
import { Play, RotateCcw } from 'lucide-react';

interface PlayButtonProps {
  onClick: () => void;
  isReplay?: boolean;
  disabled?: boolean;
  isPlaying?: boolean;
}

export function PlayButton({ onClick, isReplay, disabled, isPlaying }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isPlaying}
      className={cn(
        'retro-button-primary px-8 py-4 sm:px-12 sm:py-5',
        'flex items-center justify-center gap-3',
        'text-lg sm:text-xl font-bold uppercase tracking-wider',
        'transition-all duration-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isPlaying && 'retro-pulse',
      )}
    >
      {isReplay ? (
        <>
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-retro text-2xl sm:text-3xl">REPLAY</span>
        </>
      ) : (
        <>
          <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
          <span className="font-retro text-2xl sm:text-3xl">PLAY NOTE</span>
        </>
      )}
    </button>
  );
}
