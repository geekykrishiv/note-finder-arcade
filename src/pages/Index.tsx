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
} from '@/components/game';
import { Button } from '@/components/ui/button';
import { ArrowRight, Volume2 } from 'lucide-react';

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
      setTimeout(() => setIsPlaying(false), 1500);
    } else if (canReplay && state.targetNote && state.targetOctave) {
      // Replay the current note
      setIsPlaying(true);
      playNote(state.targetNote, state.targetOctave);
      setTimeout(() => setIsPlaying(false), 1500);
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
      <div className="min-h-screen arcade-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Audio Not Supported
          </h1>
          <p className="text-muted-foreground">
            Your browser doesn't support the Web Audio API. Please try a modern browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen arcade-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Ear<span className="text-primary">Training</span>
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
          <div className="game-panel p-6 sm:p-8 space-y-8">
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
                <Button
                  variant="action"
                  size="xl"
                  onClick={handleNextRound}
                  className="gap-3"
                >
                  <span>Next Round</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
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
                  <Button
                    variant="submit"
                    size="xl"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="min-w-[200px]"
                  >
                    Check Answer
                  </Button>
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
                <p className="text-muted-foreground">
                  Press <span className="text-primary font-medium">Play Note</span> to begin
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Single Note Mode • Train your ear</p>
      </footer>
    </div>
  );
};

export default Index;
