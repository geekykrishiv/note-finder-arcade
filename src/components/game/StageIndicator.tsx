import { cn } from '@/lib/utils';
import { GameStage } from '@/hooks/useTrainingSession';
import { Ear, HelpCircle, CheckCircle } from 'lucide-react';

interface StageIndicatorProps {
  currentStage: GameStage;
}

const stages: { id: GameStage; label: string; icon: typeof Ear }[] = [
  { id: 'listen', label: 'Listen', icon: Ear },
  { id: 'guess', label: 'Guess', icon: HelpCircle },
  { id: 'result', label: 'Result', icon: CheckCircle },
];

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {stages.map((stage, index) => {
        const Icon = stage.icon;
        const isActive = stage.id === currentStage;
        const isPast = index < currentIndex;
        
        return (
          <div key={stage.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300',
                  isActive && stage.id === 'listen' && 'bg-stage-listen/20 text-stage-listen',
                  isActive && stage.id === 'guess' && 'bg-stage-guess/20 text-stage-guess',
                  isActive && stage.id === 'result' && 'bg-stage-result/20 text-stage-result',
                  isPast && 'bg-muted text-muted-foreground',
                  !isActive && !isPast && 'bg-muted/50 text-muted-foreground/50',
                  isActive && 'ring-2 ring-offset-2 ring-offset-background',
                  isActive && stage.id === 'listen' && 'ring-stage-listen',
                  isActive && stage.id === 'guess' && 'ring-stage-guess',
                  isActive && stage.id === 'result' && 'ring-stage-result',
                )}
              >
                <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', isActive && 'animate-pulse-glow')} />
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300',
                  isActive && 'text-foreground',
                  !isActive && 'text-muted-foreground',
                )}
              >
                {stage.label}
              </span>
            </div>
            
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'w-8 sm:w-12 h-0.5 rounded-full transition-colors duration-300 -mt-5',
                  isPast ? 'bg-muted-foreground' : 'bg-muted',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
