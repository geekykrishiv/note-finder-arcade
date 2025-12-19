import { useCallback, useRef } from 'react';

// Note frequencies based on A4 = 440Hz
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type NoteName = typeof NOTE_NAMES[number];

// Calculate frequency for a given note and octave
// Formula: f = 440 * 2^((n-49)/12) where n is the piano key number
function noteToFrequency(note: NoteName, octave: number): number {
  const noteIndex = NOTE_NAMES.indexOf(note);
  // A4 is the 49th key on piano (index 9 in octave 4)
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

// Piano-like synthesis using additive synthesis with harmonics
function createPianoTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  destination: AudioNode
): { oscillators: OscillatorNode[]; gainNodes: GainNode[] } {
  const now = ctx.currentTime;
  const oscillators: OscillatorNode[] = [];
  const gainNodes: GainNode[] = [];

  // Harmonic structure for piano-like sound
  // Real piano has strong fundamentals with decreasing harmonics
  const harmonics = [
    { ratio: 1, amplitude: 1.0 },      // Fundamental
    { ratio: 2, amplitude: 0.5 },      // 2nd harmonic (octave)
    { ratio: 3, amplitude: 0.25 },     // 3rd harmonic
    { ratio: 4, amplitude: 0.15 },     // 4th harmonic
    { ratio: 5, amplitude: 0.08 },     // 5th harmonic
    { ratio: 6, amplitude: 0.04 },     // 6th harmonic
  ];

  // Master gain for overall volume control
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.4, now);
  
  // Low-pass filter for warmth (removes harshness)
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.7);
  filter.Q.setValueAtTime(1, now);

  // High-pass filter to remove muddiness
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(80, now);
  highpass.Q.setValueAtTime(0.7, now);

  // Create oscillators for each harmonic
  harmonics.forEach(({ ratio, amplitude }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency * ratio, now);
    
    // ADSR envelope for piano-like attack and decay
    const attackTime = 0.008;  // Very fast attack (hammer strike)
    const decayTime = 0.15;    // Quick initial decay
    const sustainLevel = 0.3;  // Sustained level
    const releaseTime = 0.4;   // Gradual release

    const peakAmplitude = amplitude * 0.8;
    
    gain.gain.setValueAtTime(0, now);
    // Attack - fast rise
    gain.gain.linearRampToValueAtTime(peakAmplitude, now + attackTime);
    // Decay to sustain
    gain.gain.exponentialRampToValueAtTime(
      Math.max(peakAmplitude * sustainLevel, 0.001),
      now + attackTime + decayTime
    );
    // Hold sustain
    gain.gain.setValueAtTime(
      Math.max(peakAmplitude * sustainLevel, 0.001),
      now + duration - releaseTime
    );
    // Release
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(filter);
    
    oscillators.push(osc);
    gainNodes.push(gain);
  });

  // Add a slight "hammer" transient for realism
  const hammerOsc = ctx.createOscillator();
  const hammerGain = ctx.createGain();
  const hammerFilter = ctx.createBiquadFilter();
  
  hammerOsc.type = 'triangle';
  hammerOsc.frequency.setValueAtTime(frequency * 8, now);
  
  hammerFilter.type = 'bandpass';
  hammerFilter.frequency.setValueAtTime(frequency * 4, now);
  hammerFilter.Q.setValueAtTime(2, now);
  
  hammerGain.gain.setValueAtTime(0.15, now);
  hammerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  
  hammerOsc.connect(hammerFilter);
  hammerFilter.connect(hammerGain);
  hammerGain.connect(filter);
  
  oscillators.push(hammerOsc);
  gainNodes.push(hammerGain);

  // Connect filter chain
  filter.connect(highpass);
  highpass.connect(masterGain);
  masterGain.connect(destination);

  // Start all oscillators
  oscillators.forEach(osc => {
    osc.start(now);
    osc.stop(now + duration + 0.1);
  });

  return { oscillators, gainNodes };
}

export function useAudio(): UseAudioReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainsRef = useRef<GainNode[]>([]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const stopNote = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Fade out active gains to avoid clicks
    activeGainsRef.current.forEach(gain => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      } catch (e) {
        // Ignore if already stopped
      }
    });

    // Stop oscillators after fade
    setTimeout(() => {
      activeOscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      });
      activeOscillatorsRef.current = [];
      activeGainsRef.current = [];
    }, 60);
  }, []);

  const playNote = useCallback((note: NoteName, octave: number, duration: number = 2.0) => {
    // Stop any currently playing note
    stopNote();

    const ctx = getAudioContext();
    const frequency = noteToFrequency(note, octave);

    // Create piano-like tone
    const { oscillators, gainNodes } = createPianoTone(
      ctx,
      frequency,
      duration,
      ctx.destination
    );

    activeOscillatorsRef.current = oscillators;
    activeGainsRef.current = gainNodes;
  }, [getAudioContext, stopNote]);

  return {
    playNote,
    stopNote,
    isSupported: typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window),
  };
}

export { NOTE_NAMES };
