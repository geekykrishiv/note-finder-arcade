import { cn } from '@/lib/utils';
import { GameStage } from '@/hooks/useTrainingSession';

interface StageIndicatorProps {
  currentStage: GameStage;
}

const stages: { id: GameStage; label: string }[] = [
  { id: 'listen', label: 'LISTEN' },
  { id: 'guess', label: 'GUESS' },
  { id: 'result', label: 'RESULT' },
];

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {stages.map((stage, index) => {
        const isActive = stage.id === currentStage;
        const isPast = index < currentIndex;
        
        return (
          <div key={stage.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-2">
              {/* Stage box */}
              <div
                className={cn(
                  'pixel-stage w-16 h-10 sm:w-20 sm:h-12',
                  isActive && stage.id === 'listen' && 'pixel-stage-active-listen',
                  isActive && stage.id === 'guess' && 'pixel-stage-active-guess',
                  isActive && stage.id === 'result' && 'pixel-stage-active-result',
                  isPast && 'opacity-50',
                  !isActive && !isPast && 'opacity-30',
                )}
              >
                <span 
                  className={cn(
                    'text-[6px] sm:text-[8px] pixel-shadow',
                    isActive && 'pixel-blink text-foreground',
                    !isActive && 'text-muted-foreground',
                  )}
                >
                  {stage.label}
                </span>
              </div>
            </div>
            
            {/* Arrow connector */}
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'text-[10px] sm:text-xs pixel-shadow',
                  isPast ? 'text-muted-foreground' : 'text-muted',
                )}
              >
                ▶
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
