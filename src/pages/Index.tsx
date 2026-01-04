import { useCallback, useState } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { useTrainingSession } from '@/hooks/useTrainingSession';
import { useIntervalMode } from '@/hooks/useIntervalMode';
import {
  StageIndicator,
  NoteSelector,
  OctaveSelector,
  FeedbackDisplay,
  PlayButton,
  GameStats,
  ParallaxBackground,
  LoadingScreen,
  LevelSelector,
  ModeSelector,
  IntervalSelector,
  IntervalFeedback,
} from '@/components/game';
import { GameMode } from '@/components/game/ModeSelector';
import { cn } from '@/lib/utils';

const Index = () => {
  const { playNote, isSupported, isLoading, loadProgress, isPlaying, playbackProgress } = useAudio();
  const [gameMode, setGameMode] = useState<GameMode>('single-note');
  
  // Single Note Mode
  const singleNote = useTrainingSession();
  
  // Interval Mode
  const interval = useIntervalMode();

  // Get current mode's state for theming
  const currentDifficulty = gameMode === 'single-note' ? singleNote.state.difficulty : interval.state.difficulty;
  const currentStage = gameMode === 'single-note' ? singleNote.state.stage : interval.state.stage;
  const totalRounds = gameMode === 'single-note' ? singleNote.state.totalRounds : interval.state.totalRounds;
  const correctRounds = gameMode === 'single-note' ? singleNote.state.correctRounds : interval.state.correctRounds;
  const minOctave = gameMode === 'single-note' ? singleNote.minOctave : interval.minOctave;
  const maxOctave = gameMode === 'single-note' ? singleNote.maxOctave : interval.maxOctave;

  // Handle mode change - reset both modes
  const handleModeChange = useCallback((mode: GameMode) => {
    if (mode !== gameMode) {
      singleNote.resetSession();
      interval.resetSession();
      setGameMode(mode);
    }
  }, [gameMode, singleNote, interval]);

  // Single Note handlers
  const handlePlayNoteSingle = useCallback(() => {
    if (singleNote.state.stage === 'listen') {
      const { note, octave } = singleNote.startRound();
      playNote(note, octave);
    } else if (singleNote.canReplay && singleNote.state.targetNote && singleNote.state.targetOctave) {
      playNote(singleNote.state.targetNote, singleNote.state.targetOctave);
    }
  }, [singleNote, playNote]);

  // Interval Mode handlers - play two notes with gap
  const handlePlayInterval = useCallback(() => {
    if (interval.state.stage === 'listen') {
      const { firstNote, secondNote, octave } = interval.startRound();
      // Play first note
      playNote(firstNote, octave);
      // Play second note after 400ms gap
      setTimeout(() => {
        playNote(secondNote, octave);
      }, 400);
    } else if (interval.canReplay && interval.state.firstNote && interval.state.secondNote && interval.state.octave) {
      playNote(interval.state.firstNote, interval.state.octave);
      setTimeout(() => {
        playNote(interval.state.secondNote!, interval.state.octave!);
      }, 400);
    }
  }, [interval, playNote]);

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
      <div className={cn(
        "min-h-screen flex flex-col",
        currentDifficulty === 'easy' && 'difficulty-theme-easy',
        currentDifficulty === 'medium' && 'difficulty-theme-medium',
        currentDifficulty === 'hard' && 'difficulty-theme-hard',
      )}>
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
            totalRounds={totalRounds}
            correctRounds={correctRounds}
          />
        </header>

        {/* Mode Selector */}
        <div className="flex justify-center px-3 sm:px-4 pb-3">
          <ModeSelector
            mode={gameMode}
            onSelectMode={handleModeChange}
            disabled={currentStage !== 'listen'}
          />
        </div>

        {/* Level Selector - Always visible */}
        <div className="flex justify-center px-3 sm:px-4 pb-3">
          <LevelSelector
            level={currentDifficulty}
            onSelectLevel={gameMode === 'single-note' ? singleNote.setDifficulty : interval.setDifficulty}
            disabled={currentStage !== 'listen'}
          />
        </div>

        {/* Main Game Area */}
        <main className="flex-1 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            {/* Stage Indicator */}
            <StageIndicator currentStage={currentStage} />

            {/* Game Panel */}
            <div className="pixel-panel difficulty-panel-glow p-4 sm:p-6 space-y-6 sm:space-y-8">
              
              {/* ========== SINGLE NOTE MODE ========== */}
              {gameMode === 'single-note' && (
                <>
                  {/* Play/Replay Button */}
                  <div className="flex justify-center">
                    {singleNote.state.stage === 'listen' && (
                      <PlayButton onClick={handlePlayNoteSingle} isPlaying={isPlaying} playbackProgress={playbackProgress} />
                    )}
                    {singleNote.state.stage === 'guess' && (
                      <PlayButton
                        onClick={handlePlayNoteSingle}
                        isReplay
                        isPlaying={isPlaying}
                        playbackProgress={playbackProgress}
                        disabled={!singleNote.canReplay}
                      />
                    )}
                    {singleNote.state.stage === 'result' && (
                      <button
                        onClick={singleNote.nextRound}
                        className="pixel-button difficulty-accent-bg difficulty-accent-border px-6 py-4 sm:px-8 sm:py-5 flex items-center gap-3 text-foreground"
                      >
                        <span className="text-[8px] sm:text-[10px] pixel-shadow">NEXT ROUND</span>
                        <span className="text-[10px] sm:text-xs">▶</span>
                      </button>
                    )}
                  </div>

                  {/* Input Area */}
                  {singleNote.state.stage === 'guess' && (
                    <div className="space-y-5 sm:space-y-6">
                      <NoteSelector
                        selectedNote={singleNote.state.selectedNote}
                        onSelectNote={singleNote.selectNote}
                        disabled={isPlaying}
                      />
                      <OctaveSelector
                        selectedOctave={singleNote.state.selectedOctave}
                        onSelectOctave={singleNote.selectOctave}
                        disabled={isPlaying}
                        minOctave={singleNote.minOctave}
                        maxOctave={singleNote.maxOctave}
                      />
                      
                      {/* Submit Button */}
                      <div className="flex justify-center pt-2 sm:pt-4">
                        <button
                          onClick={singleNote.submitGuess}
                          disabled={!singleNote.canSubmit}
                          className={cn(
                            'pixel-button difficulty-accent-bg difficulty-accent-border px-8 py-4 sm:px-10 sm:py-5',
                            'min-w-[160px] sm:min-w-[200px] text-foreground',
                            !singleNote.canSubmit && 'opacity-40 cursor-not-allowed',
                          )}
                        >
                          <span className="text-[8px] sm:text-[10px] pixel-shadow">CHECK</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {singleNote.state.stage === 'result' && (
                    <FeedbackDisplay
                      isCorrect={singleNote.state.isCorrect}
                      targetNote={singleNote.state.targetNote}
                      targetOctave={singleNote.state.targetOctave}
                      selectedNote={singleNote.state.selectedNote}
                      selectedOctave={singleNote.state.selectedOctave}
                    />
                  )}

                  {/* Listen Stage Instructions */}
                  {singleNote.state.stage === 'listen' && (
                    <div className="text-center">
                      <p className="text-[6px] sm:text-[8px] text-muted-foreground">
                        PRESS <span className="difficulty-accent-text">PLAY NOTE</span> TO BEGIN
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ========== INTERVAL MODE ========== */}
              {gameMode === 'interval' && (
                <>
                  {/* Play/Replay Button */}
                  <div className="flex justify-center">
                    {interval.state.stage === 'listen' && (
                      <PlayButton 
                        onClick={handlePlayInterval} 
                        isPlaying={isPlaying} 
                        playbackProgress={playbackProgress}
                        label="PLAY INTERVAL"
                      />
                    )}
                    {interval.state.stage === 'guess' && (
                      <PlayButton
                        onClick={handlePlayInterval}
                        isReplay
                        isPlaying={isPlaying}
                        playbackProgress={playbackProgress}
                        disabled={!interval.canReplay}
                      />
                    )}
                    {interval.state.stage === 'result' && (
                      <button
                        onClick={interval.nextRound}
                        className="pixel-button difficulty-accent-bg difficulty-accent-border px-6 py-4 sm:px-8 sm:py-5 flex items-center gap-3 text-foreground"
                      >
                        <span className="text-[8px] sm:text-[10px] pixel-shadow">NEXT ROUND</span>
                        <span className="text-[10px] sm:text-xs">▶</span>
                      </button>
                    )}
                  </div>

                  {/* Input Area */}
                  {interval.state.stage === 'guess' && (
                    <div className="space-y-5 sm:space-y-6">
                      <IntervalSelector
                        selectedInterval={interval.state.selectedInterval}
                        onSelectInterval={interval.selectInterval}
                        disabled={isPlaying}
                      />
                      
                      {/* Submit Button */}
                      <div className="flex justify-center pt-2 sm:pt-4">
                        <button
                          onClick={interval.submitGuess}
                          disabled={!interval.canSubmit}
                          className={cn(
                            'pixel-button difficulty-accent-bg difficulty-accent-border px-8 py-4 sm:px-10 sm:py-5',
                            'min-w-[160px] sm:min-w-[200px] text-foreground',
                            !interval.canSubmit && 'opacity-40 cursor-not-allowed',
                          )}
                        >
                          <span className="text-[8px] sm:text-[10px] pixel-shadow">CHECK</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {interval.state.stage === 'result' && (
                    <IntervalFeedback
                      isCorrect={interval.state.isCorrect}
                      targetInterval={interval.state.targetInterval}
                      selectedInterval={interval.state.selectedInterval}
                      firstNote={interval.state.firstNote}
                      secondNote={interval.state.secondNote}
                      octave={interval.state.octave}
                    />
                  )}

                  {/* Listen Stage Instructions */}
                  {interval.state.stage === 'listen' && (
                    <div className="text-center">
                      <p className="text-[6px] sm:text-[8px] text-muted-foreground">
                        PRESS <span className="difficulty-accent-text">PLAY INTERVAL</span> TO HEAR TWO NOTES
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-3 sm:p-4 text-center">
          <p className="text-[6px] sm:text-[8px] text-muted-foreground">
            {gameMode === 'single-note' ? 'SINGLE NOTE' : 'INTERVAL'} MODE • <span className="difficulty-accent-text">LEVEL {currentDifficulty === 'easy' ? '1' : currentDifficulty === 'medium' ? '2' : '3'}</span> • OCTAVES {minOctave}-{maxOctave}
          </p>
        </footer>
      </div>
    </ParallaxBackground>
  );
};

export default Index;
