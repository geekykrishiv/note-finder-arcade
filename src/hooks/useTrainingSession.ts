import { useState, useCallback } from 'react';
import { NOTE_NAMES, NoteName } from './useAudio';

export type GameStage = 'listen' | 'guess' | 'result';

interface TrainingState {
  stage: GameStage;
  targetNote: NoteName | null;
  targetOctave: number | null;
  selectedNote: NoteName | null;
  selectedOctave: number | null;
  isCorrect: boolean | null;
  attempts: number;
  totalRounds: number;
  correctRounds: number;
}

interface UseTrainingSessionReturn {
  state: TrainingState;
  startRound: () => { note: NoteName; octave: number };
  selectNote: (note: NoteName) => void;
  selectOctave: (octave: number) => void;
  submitGuess: () => boolean;
  nextRound: () => void;
  resetSession: () => void;
  canSubmit: boolean;
  canReplay: boolean;
  minOctave: number;
  maxOctave: number;
}

// Default octave range: 2-6 (expandable later)
const MIN_OCTAVE = 2;
const MAX_OCTAVE = 6;

// Generate a random note within the octave range
function generateRandomNote(): { note: NoteName; octave: number } {
  const noteIndex = Math.floor(Math.random() * NOTE_NAMES.length);
  // Random octave between MIN and MAX (inclusive)
  const octaveRange = MAX_OCTAVE - MIN_OCTAVE + 1;
  const octave = Math.floor(Math.random() * octaveRange) + MIN_OCTAVE;
  return {
    note: NOTE_NAMES[noteIndex],
    octave,
  };
}

const initialState: TrainingState = {
  stage: 'listen',
  targetNote: null,
  targetOctave: null,
  selectedNote: null,
  selectedOctave: null,
  isCorrect: null,
  attempts: 0,
  totalRounds: 0,
  correctRounds: 0,
};

export function useTrainingSession(): UseTrainingSessionReturn {
  const [state, setState] = useState<TrainingState>(initialState);

  const startRound = useCallback(() => {
    const { note, octave } = generateRandomNote();
    setState(prev => ({
      ...prev,
      stage: 'guess',
      targetNote: note,
      targetOctave: octave,
      selectedNote: null,
      selectedOctave: null,
      isCorrect: null,
      attempts: prev.attempts,
    }));
    return { note, octave };
  }, []);

  const selectNote = useCallback((note: NoteName) => {
    setState(prev => ({
      ...prev,
      selectedNote: note,
    }));
  }, []);

  const selectOctave = useCallback((octave: number) => {
    setState(prev => ({
      ...prev,
      selectedOctave: octave,
    }));
  }, []);

  const submitGuess = useCallback(() => {
    const isCorrect = 
      state.selectedNote === state.targetNote && 
      state.selectedOctave === state.targetOctave;

    setState(prev => ({
      ...prev,
      stage: 'result',
      isCorrect,
      attempts: prev.attempts + 1,
      totalRounds: prev.totalRounds + 1,
      correctRounds: isCorrect ? prev.correctRounds + 1 : prev.correctRounds,
    }));

    return isCorrect;
  }, [state.selectedNote, state.selectedOctave, state.targetNote, state.targetOctave]);

  const nextRound = useCallback(() => {
    setState(prev => ({
      ...prev,
      stage: 'listen',
      targetNote: null,
      targetOctave: null,
      selectedNote: null,
      selectedOctave: null,
      isCorrect: null,
    }));
  }, []);

  const resetSession = useCallback(() => {
    setState(initialState);
  }, []);

  const canSubmit = state.selectedNote !== null && state.selectedOctave !== null && state.stage === 'guess';
  const canReplay = state.stage === 'guess' && state.targetNote !== null;

  return {
    state,
    startRound,
    selectNote,
    selectOctave,
    submitGuess,
    nextRound,
    resetSession,
    canSubmit,
    canReplay,
    minOctave: MIN_OCTAVE,
    maxOctave: MAX_OCTAVE,
  };
}
