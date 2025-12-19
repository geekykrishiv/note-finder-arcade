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
} from '@/components/game';
import { ArrowRight, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const { playNote, isSupported } = useAudio();
  const {
    state,
    startRound,
    selectNote,
    selectOctave,
    submitGuess,
    nextRound,
    canSubmit,
    canReplay,
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

  if (!isSupported) {
    return (
      <ParallaxBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="retro-panel p-8 text-center">
            <h1 className="font-pixel text-xl text-destructive mb-4">
              AUDIO ERROR
            </h1>
            <p className="font-retro text-xl text-muted-foreground">
              Your browser doesn't support Web Audio API.
              <br />Please try a modern browser.
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
        <header className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="retro-panel-inset w-10 h-10 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-pixel text-sm sm:text-base tracking-wide">
              <span className="text-foreground">EAR</span>
              <span className="text-primary">TRAINING</span>
            </h1>
          </div>
          <GameStats
            totalRounds={state.totalRounds}
            correctRounds={state.correctRounds}
          />
        </header>

        {/* Main Game Area */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg space-y-8">
            {/* Stage Indicator */}
            <StageIndicator currentStage={state.stage} />

            {/* Game Panel */}
            <div className="retro-panel p-6 sm:p-8 space-y-8">
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
                    className="retro-button-primary px-8 py-4 sm:px-10 sm:py-5 flex items-center gap-3"
                  >
                    <span className="font-retro text-2xl sm:text-3xl uppercase">Next Round</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>

              {/* Input Area - Only show during guess stage */}
              {state.stage === 'guess' && (
                <div className="space-y-6 animate-fade-in">
                  <NoteSelector
                    selectedNote={state.selectedNote}
                    onSelectNote={selectNote}
                    disabled={isPlaying}
                  />
                  <OctaveSelector
                    selectedOctave={state.selectedOctave}
                    onSelectOctave={selectOctave}
                    disabled={isPlaying}
                  />
                  
                  {/* Submit Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className={cn(
                        'retro-button-success px-10 py-4 sm:px-12 sm:py-5',
                        'min-w-[200px]',
                        !canSubmit && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      <span className="font-retro text-2xl sm:text-3xl uppercase">Check</span>
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
                <div className="text-center animate-fade-in">
                  <p className="font-retro text-xl text-muted-foreground">
                    Press <span className="text-primary">PLAY NOTE</span> to begin
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center">
          <p className="font-retro text-lg text-muted-foreground">
            SINGLE NOTE MODE • TRAIN YOUR EAR
          </p>
        </footer>
      </div>
    </ParallaxBackground>
  );
};

export default Index;
