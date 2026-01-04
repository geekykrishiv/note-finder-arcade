import { useState, useCallback } from 'react';
import { NOTE_NAMES, NoteName } from './useAudio';
import { Difficulty } from './useTrainingSession';

export type IntervalStage = 'listen' | 'guess' | 'result';

// All intervals from unison to octave
export const INTERVALS = [
  { semitones: 1, name: 'Minor 2nd', short: 'm2' },
  { semitones: 2, name: 'Major 2nd', short: 'M2' },
  { semitones: 3, name: 'Minor 3rd', short: 'm3' },
  { semitones: 4, name: 'Major 3rd', short: 'M3' },
  { semitones: 5, name: 'Perfect 4th', short: 'P4' },
  { semitones: 6, name: 'Tritone', short: 'TT' },
  { semitones: 7, name: 'Perfect 5th', short: 'P5' },
  { semitones: 8, name: 'Minor 6th', short: 'm6' },
  { semitones: 9, name: 'Major 6th', short: 'M6' },
  { semitones: 10, name: 'Minor 7th', short: 'm7' },
  { semitones: 11, name: 'Major 7th', short: 'M7' },
  { semitones: 12, name: 'Octave', short: 'P8' },
] as const;

export type IntervalName = typeof INTERVALS[number]['name'];

// Difficulty settings with octave ranges
const DIFFICULTY_SETTINGS = {
  easy: { minOctave: 3, maxOctave: 5 },
  medium: { minOctave: 2, maxOctave: 6 },
  hard: { minOctave: 0, maxOctave: 7 },
} as const;

interface IntervalState {
  stage: IntervalStage;
  difficulty: Difficulty;
  firstNote: NoteName | null;
  secondNote: NoteName | null;
  octave: number | null;
  targetInterval: typeof INTERVALS[number] | null;
  selectedInterval: IntervalName | null;
  isCorrect: boolean | null;
  totalRounds: number;
  correctRounds: number;
}

interface UseIntervalModeReturn {
  state: IntervalState;
  startRound: () => { firstNote: NoteName; secondNote: NoteName; octave: number };
  selectInterval: (interval: IntervalName) => void;
  submitGuess: () => boolean;
  nextRound: () => void;
  resetSession: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  canSubmit: boolean;
  canReplay: boolean;
  minOctave: number;
  maxOctave: number;
}

// Generate a random interval within the same octave
function generateRandomInterval(difficulty: Difficulty): { 
  firstNote: NoteName; 
  secondNote: NoteName; 
  octave: number; 
  interval: typeof INTERVALS[number];
} {
  const { minOctave, maxOctave } = DIFFICULTY_SETTINGS[difficulty];
  
  // Pick random octave
  const octaveRange = maxOctave - minOctave + 1;
  const octave = Math.floor(Math.random() * octaveRange) + minOctave;
  
  // Pick random interval (1-12 semitones)
  const intervalIndex = Math.floor(Math.random() * INTERVALS.length);
  const interval = INTERVALS[intervalIndex];
  
  // Pick first note, ensuring second note stays in same octave
  // First note index must allow second note to stay within 0-11 (same octave)
  const maxFirstNoteIndex = 12 - interval.semitones;
  const firstNoteIndex = Math.floor(Math.random() * (maxFirstNoteIndex + 1));
  const secondNoteIndex = firstNoteIndex + interval.semitones;
  
  // Handle octave wrapping for intervals reaching into next octave
  const actualSecondNoteIndex = secondNoteIndex % 12;
  
  return {
    firstNote: NOTE_NAMES[firstNoteIndex],
    secondNote: NOTE_NAMES[actualSecondNoteIndex],
    octave,
    interval,
  };
}

const initialState: IntervalState = {
  stage: 'listen',
  difficulty: 'medium',
  firstNote: null,
  secondNote: null,
  octave: null,
  targetInterval: null,
  selectedInterval: null,
  isCorrect: null,
  totalRounds: 0,
  correctRounds: 0,
};

export function useIntervalMode(): UseIntervalModeReturn {
  const [state, setState] = useState<IntervalState>(initialState);

  const startRound = useCallback(() => {
    const { firstNote, secondNote, octave, interval } = generateRandomInterval(state.difficulty);
    setState(prev => ({
      ...prev,
      stage: 'guess',
      firstNote,
      secondNote,
      octave,
      targetInterval: interval,
      selectedInterval: null,
      isCorrect: null,
    }));
    return { firstNote, secondNote, octave };
  }, [state.difficulty]);

  const selectInterval = useCallback((interval: IntervalName) => {
    setState(prev => ({
      ...prev,
      selectedInterval: interval,
    }));
  }, []);

  const submitGuess = useCallback(() => {
    const isCorrect = state.selectedInterval === state.targetInterval?.name;

    setState(prev => ({
      ...prev,
      stage: 'result',
      isCorrect,
      totalRounds: prev.totalRounds + 1,
      correctRounds: isCorrect ? prev.correctRounds + 1 : prev.correctRounds,
    }));

    return isCorrect;
  }, [state.selectedInterval, state.targetInterval]);

  const nextRound = useCallback(() => {
    setState(prev => ({
      ...prev,
      stage: 'listen',
      firstNote: null,
      secondNote: null,
      octave: null,
      targetInterval: null,
      selectedInterval: null,
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
    }));
  }, []);

  const canSubmit = state.selectedInterval !== null && state.stage === 'guess';
  const canReplay = state.stage === 'guess' && state.firstNote !== null;
  
  const { minOctave, maxOctave } = DIFFICULTY_SETTINGS[state.difficulty];

  return {
    state,
    startRound,
    selectInterval,
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
