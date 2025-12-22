import { useState, useCallback } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { useTrainingSession } from '@/hooks/useTrainingSession';
import {
  StageIndicator,
  NoteSelector,
  OctaveSelector,
  FeedbackDisplay,
  PlayButton,
  GameStats,
  ParallaxBackground,
  LoadingScreen,
  DifficultySelector,
} from '@/components/game';
import { cn } from '@/lib/utils';

const Index = () => {
  const { playNote, isSupported, isLoading, loadProgress } = useAudio();
  const {
    state,
    startRound,
    selectNote,
    selectOctave,
    submitGuess,
    nextRound,
    setDifficulty,
    canSubmit,
    canReplay,
    minOctave,
    maxOctave,
  } = useTrainingSession();

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayNote = useCallback(() => {
    if (state.stage === 'listen') {
      // Start a new round
      const { note, octave } = startRound();
      setIsPlaying(true);
      playNote(note, octave);
      setTimeout(() => setIsPlaying(false), 2000);
    } else if (canReplay && state.targetNote && state.targetOctave) {
      // Replay the current note
      setIsPlaying(true);
      playNote(state.targetNote, state.targetOctave);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  }, [state.stage, state.targetNote, state.targetOctave, canReplay, startRound, playNote]);

  const handleSubmit = useCallback(() => {
    submitGuess();
  }, [submitGuess]);

  const handleNextRound = useCallback(() => {
    nextRound();
  }, [nextRound]);

  // Show loading screen while samples load
  if (isLoading) {
    return <LoadingScreen progress={loadProgress} />;
  }

  if (!isSupported) {
    return (
      <ParallaxBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="pixel-panel p-6 sm:p-8 text-center">
            <h1 className="text-[10px] sm:text-xs text-destructive mb-4 pixel-shadow">
              AUDIO ERROR
            </h1>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">
              YOUR BROWSER DOESN'T
              <br />SUPPORT WEB AUDIO.
              <br />TRY A MODERN BROWSER.
            </p>
          </div>
        </div>
      </ParallaxBackground>
    );
  }

  return (
    <ParallaxBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pixel music icon */}
            <div className="pixel-panel-inset w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="hsl(var(--primary))" className="sm:w-5 sm:h-5">
                <rect x="10" y="1" width="3" height="10" />
                <rect x="2" y="9" width="8" height="2" />
                <rect x="0" y="11" width="6" height="4" />
              </svg>
            </div>
            <h1 className="text-[10px] sm:text-xs pixel-shadow">
              <span className="text-primary">EAR</span>
              <span className="text-accent">TRAINING</span>
            </h1>
          </div>
          <GameStats
            totalRounds={state.totalRounds}
            correctRounds={state.correctRounds}
          />
        </header>

        {/* Difficulty Selector - Always visible */}
        <div className="flex justify-center px-3 sm:px-4 pb-2">
          <DifficultySelector
            difficulty={state.difficulty}
            onSelectDifficulty={setDifficulty}
            disabled={state.stage !== 'listen'}
          />
        </div>

        {/* Main Game Area */}
        <main className="flex-1 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            {/* Stage Indicator */}
            <StageIndicator currentStage={state.stage} />

            {/* Game Panel */}
            <div className="pixel-panel p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Play/Replay Button */}
              <div className="flex justify-center">
                {state.stage === 'listen' && (
                  <PlayButton onClick={handlePlayNote} isPlaying={isPlaying} />
                )}
                {state.stage === 'guess' && (
                  <PlayButton
                    onClick={handlePlayNote}
                    isReplay
                    isPlaying={isPlaying}
                    disabled={!canReplay}
                  />
                )}
                {state.stage === 'result' && (
                  <button
                    onClick={handleNextRound}
                    className="pixel-button-primary px-6 py-4 sm:px-8 sm:py-5 flex items-center gap-3"
                  >
                    <span className="text-[8px] sm:text-[10px] pixel-shadow">NEXT ROUND</span>
                    <span className="text-[10px] sm:text-xs">▶</span>
                  </button>
                )}
              </div>

              {/* Input Area - Only show during guess stage */}
              {state.stage === 'guess' && (
                <div className="space-y-5 sm:space-y-6">
                  <NoteSelector
                    selectedNote={state.selectedNote}
                    onSelectNote={selectNote}
                    disabled={isPlaying}
                  />
                  <OctaveSelector
                    selectedOctave={state.selectedOctave}
                    onSelectOctave={selectOctave}
                    disabled={isPlaying}
                    minOctave={minOctave}
                    maxOctave={maxOctave}
                  />
                  
                  {/* Submit Button */}
                  <div className="flex justify-center pt-2 sm:pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className={cn(
                        'pixel-button-success px-8 py-4 sm:px-10 sm:py-5',
                        'min-w-[160px] sm:min-w-[200px]',
                        !canSubmit && 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      <span className="text-[8px] sm:text-[10px] pixel-shadow">CHECK</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback Area */}
              {state.stage === 'result' && (
                <FeedbackDisplay
                  isCorrect={state.isCorrect}
                  targetNote={state.targetNote}
                  targetOctave={state.targetOctave}
                  selectedNote={state.selectedNote}
                  selectedOctave={state.selectedOctave}
                />
              )}

              {/* Listen Stage Instructions */}
              {state.stage === 'listen' && (
                <div className="text-center">
                  <p className="text-[6px] sm:text-[8px] text-muted-foreground">
                    PRESS <span className="text-primary">PLAY NOTE</span> TO BEGIN
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-3 sm:p-4 text-center">
          <p className="text-[6px] sm:text-[8px] text-muted-foreground">
            SINGLE NOTE MODE • {state.difficulty.toUpperCase()} • OCTAVES {minOctave}-{maxOctave}
          </p>
        </footer>
      </div>
    </ParallaxBackground>
  );
};

export default Index;
