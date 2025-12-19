import { useCallback, useRef } from 'react';

// Note frequencies based on A4 = 440Hz
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type NoteName = typeof NOTE_NAMES[number];

// Calculate frequency for a given note and octave
// Formula: f = 440 * 2^((n-49)/12) where n is the piano key number
function noteToFrequency(note: NoteName, octave: number): number {
  const noteIndex = NOTE_NAMES.indexOf(note);
  // A4 is the 49th key on piano (index 9 in octave 4)
  // Piano key number = (octave * 12) + noteIndex + 1
  // But we need it relative to A4 (key 49)
  const a4Key = 49;
  const keyNumber = (octave * 12) + noteIndex + 1;
  const semitoneOffset = keyNumber - a4Key;
  return 440 * Math.pow(2, semitoneOffset / 12);
}

interface UseAudioReturn {
  playNote: (note: NoteName, octave: number, duration?: number) => void;
  stopNote: () => void;
  isSupported: boolean;
}

export function useAudio(): UseAudioReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const stopNote = useCallback(() => {
    if (oscillatorRef.current && gainNodeRef.current) {
      const ctx = audioContextRef.current;
      if (ctx) {
        // Fade out to avoid clicks
        gainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.015);
        oscillatorRef.current.stop(ctx.currentTime + 0.1);
      }
      oscillatorRef.current = null;
      gainNodeRef.current = null;
    }
  }, []);

  const playNote = useCallback((note: NoteName, octave: number, duration: number = 1.5) => {
    // Stop any currently playing note
    stopNote();

    const ctx = getAudioContext();
    const frequency = noteToFrequency(note, octave);

    // Create oscillator with a more pleasant sound
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Add a second oscillator slightly detuned for richness
    const oscillator2 = ctx.createOscillator();
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(frequency * 1.002, ctx.currentTime);

    // Create gain node for envelope
    const gainNode = ctx.createGain();
    const gain2 = ctx.createGain();
    
    // ADSR-like envelope for musical sound
    const now = ctx.currentTime;
    const attackTime = 0.02;
    const decayTime = 0.1;
    const sustainLevel = 0.6;
    const releaseTime = 0.3;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel * 0.5, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel * 0.5, now + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.15, now + attackTime);
    gain2.gain.linearRampToValueAtTime(sustainLevel * 0.15, now + attackTime + decayTime);
    gain2.gain.setValueAtTime(sustainLevel * 0.15, now + duration - releaseTime);
    gain2.gain.linearRampToValueAtTime(0, now + duration);

    // Connect nodes
    oscillator.connect(gainNode);
    oscillator2.connect(gain2);
    gainNode.connect(ctx.destination);
    gain2.connect(ctx.destination);

    // Start and schedule stop
    oscillator.start(now);
    oscillator2.start(now);
    oscillator.stop(now + duration + 0.1);
    oscillator2.stop(now + duration + 0.1);

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
  }, [getAudioContext, stopNote]);

  return {
    playNote,
    stopNote,
    isSupported: typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window),
  };
}

export { NOTE_NAMES };
