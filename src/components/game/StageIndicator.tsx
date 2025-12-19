import { cn } from '@/lib/utils';
import { GameStage } from '@/hooks/useTrainingSession';
import { Ear, HelpCircle, CheckCircle } from 'lucide-react';

interface StageIndicatorProps {
  currentStage: GameStage;
}

const stages: { id: GameStage; label: string; icon: typeof Ear }[] = [
  { id: 'listen', label: 'LISTEN', icon: Ear },
  { id: 'guess', label: 'GUESS', icon: HelpCircle },
  { id: 'result', label: 'RESULT', icon: CheckCircle },
];

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {stages.map((stage, index) => {
        const Icon = stage.icon;
        const isActive = stage.id === currentStage;
        const isPast = index < currentIndex;
        
        return (
          <div key={stage.id} className="flex items-center gap-3 sm:gap-6">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'retro-stage w-12 h-12 sm:w-14 sm:h-14 transition-all duration-200',
                  isActive && stage.id === 'listen' && 'retro-stage-active !border-stage-listen',
                  isActive && stage.id === 'guess' && 'retro-stage-active',
                  isActive && stage.id === 'result' && 'retro-stage-active !border-stage-result',
                  isPast && 'opacity-60',
                  !isActive && !isPast && 'opacity-40',
                )}
                style={isActive ? {
                  boxShadow: stage.id === 'listen' 
                    ? '0 0 12px hsl(var(--stage-listen) / 0.4)'
                    : stage.id === 'result'
                    ? '0 0 12px hsl(var(--stage-result) / 0.4)'
                    : '0 0 12px hsl(var(--stage-guess) / 0.4)'
                } : undefined}
              >
                <Icon 
                  className={cn(
                    'w-5 h-5 sm:w-6 sm:h-6',
                    isActive && stage.id === 'listen' && 'text-stage-listen',
                    isActive && stage.id === 'guess' && 'text-stage-guess',
                    isActive && stage.id === 'result' && 'text-stage-result',
                    !isActive && 'text-muted-foreground',
                    isActive && 'retro-pulse'
                  )} 
                />
              </div>
              <span
                className={cn(
                  'font-retro text-sm sm:text-base tracking-wider transition-colors duration-200',
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
                  'w-6 sm:w-10 h-1 rounded-sm transition-colors duration-200 -mt-6',
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
