import { cn } from '@/lib/utils';
import { Target, Trophy } from 'lucide-react';

interface GameStatsProps {
  totalRounds: number;
  correctRounds: number;
}

export function GameStats({ totalRounds, correctRounds }: GameStatsProps) {
  const accuracy = totalRounds > 0 ? Math.round((correctRounds / totalRounds) * 100) : 0;

  return (
    <div className="flex items-center justify-center gap-6 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Target className="w-4 h-4" />
        <span>
          <span className="font-mono font-bold text-foreground">{correctRounds}</span>
          <span className="mx-1">/</span>
          <span className="font-mono">{totalRounds}</span>
        </span>
      </div>
      
      {totalRounds > 0 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className={cn('w-4 h-4', accuracy >= 70 && 'text-primary')} />
          <span className={cn('font-mono font-bold', accuracy >= 70 && 'text-primary')}>
            {accuracy}%
          </span>
        </div>
      )}
    </div>
  );
}
