import { cn } from '@/lib/utils';
import { Target, Trophy } from 'lucide-react';

interface GameStatsProps {
  totalRounds: number;
  correctRounds: number;
}

export function GameStats({ totalRounds, correctRounds }: GameStatsProps) {
  const accuracy = totalRounds > 0 ? Math.round((correctRounds / totalRounds) * 100) : 0;

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <div className="retro-panel-inset px-4 py-2 flex items-center gap-2">
        <Target className="w-4 h-4 text-muted-foreground" />
        <span className="font-retro text-xl">
          <span className="text-primary">{correctRounds}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-foreground">{totalRounds}</span>
        </span>
      </div>
      
      {totalRounds > 0 && (
        <div className="retro-panel-inset px-4 py-2 flex items-center gap-2">
          <Trophy className={cn('w-4 h-4', accuracy >= 70 ? 'text-retro-accent' : 'text-muted-foreground')} />
          <span className={cn('font-retro text-xl', accuracy >= 70 ? 'text-retro-accent' : 'text-foreground')}>
            {accuracy}%
          </span>
        </div>
      )}
    </div>
  );
}
