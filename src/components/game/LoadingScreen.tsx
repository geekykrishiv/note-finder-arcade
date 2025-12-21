interface LoadingScreenProps {
  progress: number;
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-base sm:text-lg pixel-shadow">
            <span className="neon-text-cyan">EAR</span>
            <span className="neon-text-magenta">TRAINING</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground neon-text-yellow">
            ARCADE
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-64 sm:w-80">
          <div className="pixel-loading-bar h-6 sm:h-8 relative">
            <div 
              className="pixel-loading-fill"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] text-foreground pixel-shadow">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <p className="text-[6px] sm:text-[8px] text-muted-foreground pixel-blink">
          LOADING PIANO SAMPLES...
        </p>
      </div>
    </div>
  );
}
