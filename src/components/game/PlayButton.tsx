import { cn } from '@/lib/utils';

interface PlayButtonProps {
  onClick: () => void;
  isPlaying?: boolean;
  isReplay?: boolean;
  disabled?: boolean;
}

export function PlayButton({ onClick, isPlaying, isReplay, disabled }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isPlaying}
      className={cn(
        'pixel-button-primary px-6 py-4 sm:px-8 sm:py-5',
        'flex items-center gap-3 sm:gap-4',
        'min-w-[180px] sm:min-w-[220px] justify-center',
        (disabled || isPlaying) && 'opacity-50 cursor-not-allowed',
      )}
    >
      {/* Pixel play icon */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="sm:w-5 sm:h-5">
        {isPlaying ? (
          // Pause icon
          <>
            <rect x="2" y="2" width="4" height="12" />
            <rect x="10" y="2" width="4" height="12" />
          </>
        ) : (
          // Play icon
          <>
            <rect x="2" y="0" width="4" height="16" />
            <rect x="6" y="2" width="4" height="12" />
            <rect x="10" y="4" width="4" height="8" />
          </>
        )}
      </svg>
      <span className="text-[8px] sm:text-[10px] pixel-shadow">
        {isPlaying ? 'PLAYING...' : isReplay ? 'REPLAY' : 'PLAY NOTE'}
      </span>
    </button>
  );
}
