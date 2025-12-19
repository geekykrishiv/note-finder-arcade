import { useCallback, useRef, useEffect, useState } from 'react';

// Note frequencies based on A4 = 440Hz
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type NoteName = typeof NOTE_NAMES[number];

// MIDI.js soundfont URLs - using acoustic_grand_piano
const SOUNDFONT_URL = 'https://gleitz.github.io/midi-js-soundfonts/FatBoy/acoustic_grand_piano-mp3';

// Map note names to MIDI.js file format
function getNoteFileName(note: NoteName, octave: number): string {
  // MIDI.js uses format like "A4", "Cs4" (s for sharp)
  const noteStr = note.replace('#', 's');
  return `${noteStr}${octave}`;
}

// Convert note to MIDI number for pitch shifting if needed
function noteToMidi(note: NoteName, octave: number): number {
  const noteIndex = NOTE_NAMES.indexOf(note);
  return (octave + 1) * 12 + noteIndex;
}

interface UseAudioReturn {
  playNote: (note: NoteName, octave: number, duration?: number) => void;
  stopNote: () => void;
  isSupported: boolean;
  isLoading: boolean;
  loadProgress: number;
}

// Cache for loaded audio buffers
const audioBufferCache: Map<string, AudioBuffer> = new Map();
let isPreloading = false;
let preloadProgress = 0;

// Notes to preload (octaves 2-6, all notes)
const PRELOAD_OCTAVES = [2, 3, 4, 5, 6];

export function useAudio(): UseAudioReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeGainRef = useRef<GainNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

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

  // Load a single sample
  const loadSample = useCallback(async (note: NoteName, octave: number): Promise<AudioBuffer | null> => {
    const cacheKey = `${note}${octave}`;
    
    // Return cached buffer if available
    if (audioBufferCache.has(cacheKey)) {
      return audioBufferCache.get(cacheKey)!;
    }

    const ctx = getAudioContext();
    const fileName = getNoteFileName(note, octave);
    const url = `${SOUNDFONT_URL}/${fileName}.mp3`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Sample not found: ${url}`);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferCache.set(cacheKey, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load sample ${fileName}:`, error);
      return null;
    }
  }, [getAudioContext]);

  // Preload samples on mount
  useEffect(() => {
    if (isPreloading) {
      // Already preloading from another instance
      const checkProgress = setInterval(() => {
        setLoadProgress(preloadProgress);
        if (preloadProgress >= 100) {
          setIsLoading(false);
          clearInterval(checkProgress);
        }
      }, 100);
      return () => clearInterval(checkProgress);
    }

    isPreloading = true;
    const samplesToLoad: Array<{ note: NoteName; octave: number }> = [];
    
    PRELOAD_OCTAVES.forEach(octave => {
      NOTE_NAMES.forEach(note => {
        samplesToLoad.push({ note, octave });
      });
    });

    let loaded = 0;
    const total = samplesToLoad.length;

    // Load samples in batches for better performance
    const loadBatch = async (batch: typeof samplesToLoad) => {
      await Promise.all(batch.map(async ({ note, octave }) => {
        await loadSample(note, octave);
        loaded++;
        preloadProgress = Math.round((loaded / total) * 100);
        setLoadProgress(preloadProgress);
      }));
    };

    const batchSize = 8;
    const batches: typeof samplesToLoad[] = [];
    for (let i = 0; i < samplesToLoad.length; i += batchSize) {
      batches.push(samplesToLoad.slice(i, i + batchSize));
    }

    (async () => {
      for (const batch of batches) {
        await loadBatch(batch);
      }
      setIsLoading(false);
    })();
  }, [loadSample]);

  const stopNote = useCallback(() => {
    if (activeGainRef.current && activeSourceRef.current) {
      const ctx = audioContextRef.current;
      if (ctx) {
        const now = ctx.currentTime;
        try {
          activeGainRef.current.gain.cancelScheduledValues(now);
          activeGainRef.current.gain.setValueAtTime(activeGainRef.current.gain.value, now);
          activeGainRef.current.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        } catch (e) {
          // Ignore if already stopped
        }
      }
    }
    
    setTimeout(() => {
      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
        activeSourceRef.current = null;
      }
      activeGainRef.current = null;
    }, 60);
  }, []);

  const playNote = useCallback(async (note: NoteName, octave: number, duration: number = 2.0) => {
    // Stop any currently playing note
    stopNote();

    const ctx = getAudioContext();
    const buffer = await loadSample(note, octave);

    if (!buffer) {
      console.warn(`No sample available for ${note}${octave}`);
      return;
    }

    // Create source node
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Create gain node for envelope
    const gainNode = ctx.createGain();
    const now = ctx.currentTime;

    // Natural piano envelope
    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.setValueAtTime(0.8, now + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Store references
    activeSourceRef.current = source;
    activeGainRef.current = gainNode;

    // Start playing
    source.start(now);
    source.stop(now + duration + 0.1);
  }, [getAudioContext, loadSample, stopNote]);

  return {
    playNote,
    stopNote,
    isSupported: typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window),
    isLoading,
    loadProgress,
  };
}

export { NOTE_NAMES };
