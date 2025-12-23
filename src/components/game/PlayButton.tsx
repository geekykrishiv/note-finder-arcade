import { cn } from '@/lib/utils';

interface PlayButtonProps {
  onClick: () => void;
  isPlaying?: boolean;
  isReplay?: boolean;
  disabled?: boolean;
  playbackProgress?: number; // 0-100
}

export function PlayButton({ onClick, isPlaying, isReplay, disabled, playbackProgress = 0 }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isPlaying}
      className={cn(
        'pixel-button-primary px-6 py-4 sm:px-8 sm:py-5',
        'flex items-center gap-3 sm:gap-4',
        'min-w-[180px] sm:min-w-[220px] justify-center',
        'relative overflow-hidden',
        (disabled || isPlaying) && 'cursor-not-allowed',
      )}
    >
      {/* Cooldown progress overlay */}
      {isPlaying && (
        <div 
          className="absolute inset-0 bg-primary/30 transition-none"
          style={{ 
            width: `${100 - playbackProgress}%`,
            right: 0,
            left: 'auto',
          }}
        />
      )}
      
      {/* Content wrapper */}
      <div className={cn(
        'relative z-10 flex items-center gap-3 sm:gap-4',
        isPlaying && 'opacity-70'
      )}>
        {/* Pixel play icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="sm:w-5 sm:h-5">
          {isPlaying ? (
            // Sound waves icon (playing indicator)
            <>
              <rect x="1" y="6" width="2" height="4" className="animate-pulse" />
              <rect x="5" y="4" width="2" height="8" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
              <rect x="9" y="2" width="2" height="12" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
              <rect x="13" y="5" width="2" height="6" className="animate-pulse" style={{ animationDelay: '0.15s' }} />
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
      </div>
    </button>
  );
}