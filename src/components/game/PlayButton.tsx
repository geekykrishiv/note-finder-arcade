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
        'relative flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5',
        'rounded-2xl font-semibold text-lg sm:text-xl',
        'bg-primary text-primary-foreground',
        'transition-all duration-300 press-effect',
        'play-button-glow hover:scale-105',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        isPlaying && 'animate-pulse',
      )}
    >
      {isReplay ? (
        <>
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          <span>Replay Note</span>
        </>
      ) : (
        <>
          <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
          <span>Play Note</span>
        </>
      )}
      
      {/* Subtle ring animation */}
      {!disabled && !isPlaying && (
        <span className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-20" />
      )}
    </button>
  );
}
