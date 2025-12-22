import { useState, useCallback } from 'react';
import { NOTE_NAMES, NoteName } from './useAudio';

export type GameStage = 'listen' | 'guess' | 'result';
export type Difficulty = 'easy' | 'medium' | 'hard';

// Difficulty settings with octave ranges
const DIFFICULTY_SETTINGS = {
  easy: { minOctave: 3, maxOctave: 5 },
  medium: { minOctave: 2, maxOctave: 6 },
  hard: { minOctave: 0, maxOctave: 7 },
} as const;

interface TrainingState {
  stage: GameStage;
  difficulty: Difficulty;
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
  setDifficulty: (difficulty: Difficulty) => void;
  canSubmit: boolean;
  canReplay: boolean;
  minOctave: number;
  maxOctave: number;
}

// Generate a random note within the octave range for the given difficulty
function generateRandomNote(difficulty: Difficulty): { note: NoteName; octave: number } {
  const { minOctave, maxOctave } = DIFFICULTY_SETTINGS[difficulty];
  const noteIndex = Math.floor(Math.random() * NOTE_NAMES.length);
  // Random octave between MIN and MAX (inclusive)
  const octaveRange = maxOctave - minOctave + 1;
  const octave = Math.floor(Math.random() * octaveRange) + minOctave;
  return {
    note: NOTE_NAMES[noteIndex],
    octave,
  };
}

const initialState: TrainingState = {
  stage: 'listen',
  difficulty: 'medium',
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
    const { note, octave } = generateRandomNote(state.difficulty);
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
  }, [state.difficulty]);

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

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setState(prev => ({
      ...prev,
      difficulty,
      // Reset selection when difficulty changes
      selectedOctave: null,
    }));
  }, []);

  const canSubmit = state.selectedNote !== null && state.selectedOctave !== null && state.stage === 'guess';
  const canReplay = state.stage === 'guess' && state.targetNote !== null;
  
  const { minOctave, maxOctave } = DIFFICULTY_SETTINGS[state.difficulty];

  return {
    state,
    startRound,
    selectNote,
    selectOctave,
    submitGuess,
    nextRound,
    resetSession,
    setDifficulty,
    canSubmit,
    canReplay,
    minOctave,
    maxOctave,
  };
}
