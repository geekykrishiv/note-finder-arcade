interface GameStatsProps {
  totalRounds: number;
  correctRounds: number;
}

export function GameStats({ totalRounds, correctRounds }: GameStatsProps) {
  const accuracy = totalRounds > 0 
    ? Math.round((correctRounds / totalRounds) * 100) 
    : 0;

  if (totalRounds === 0) {
    return null;
  }

  return (
    <div className="pixel-panel-inset px-4 py-2 sm:px-5 sm:py-3">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[6px] sm:text-[8px] text-muted-foreground">SCORE:</span>
          <span className="text-[8px] sm:text-[10px] text-primary pixel-shadow">
            {correctRounds}/{totalRounds}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[6px] sm:text-[8px] text-muted-foreground">ACC:</span>
          <span className="text-[8px] sm:text-[10px] text-primary pixel-shadow">
            {accuracy}%
          </span>
        </div>
      </div>
    </div>
  );
}
