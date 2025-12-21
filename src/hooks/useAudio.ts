import { useCallback, useRef, useEffect, useState } from 'react';
import JSZip from 'jszip';

// Note names for mapping
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type NoteName = typeof NOTE_NAMES[number];

// Map from our note names to the sample file naming convention
// Samples use lowercase: c1, cs1 (sharp), d1, ds1, e1, f1, fs1, g1, gs1, a0, as0, b0, etc.
function getNoteFileName(note: NoteName, octave: number): string {
  const noteStr = note.toLowerCase().replace('#', 's');
  return `${noteStr}${octave}`;
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
let zipSamples: Map<string, ArrayBuffer> | null = null;

// Octaves available in the sample set (1-7)
const SAMPLE_OCTAVES = [1, 2, 3, 4, 5, 6, 7];

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

  // Load and extract ZIP file
  const loadZipSamples = useCallback(async (): Promise<Map<string, ArrayBuffer>> => {
    if (zipSamples) return zipSamples;

    const response = await fetch('/audio/piano-samples.zip');
    const zipData = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(zipData);
    
    const samples = new Map<string, ArrayBuffer>();
    const files = Object.keys(zip.files).filter(name => name.endsWith('.ogg'));
    
    let loaded = 0;
    const total = files.length;

    for (const fileName of files) {
      const file = zip.files[fileName];
      if (!file.dir) {
        // Extract note name from filename like "448619__tedagame__d5.ogg.ogg"
        const match = fileName.match(/__([a-g]s?\d)\.ogg/i);
        if (match) {
          const noteKey = match[1].toLowerCase();
          const arrayBuffer = await file.async('arraybuffer');
          samples.set(noteKey, arrayBuffer);
        }
      }
      loaded++;
      preloadProgress = Math.round((loaded / total) * 100);
      setLoadProgress(preloadProgress);
    }

    zipSamples = samples;
    return samples;
  }, []);

  // Decode a single sample
  const decodeSample = useCallback(async (note: NoteName, octave: number): Promise<AudioBuffer | null> => {
    const cacheKey = `${note}${octave}`;
    
    // Return cached buffer if available
    if (audioBufferCache.has(cacheKey)) {
      return audioBufferCache.get(cacheKey)!;
    }

    const samples = await loadZipSamples();
    const ctx = getAudioContext();
    const noteKey = getNoteFileName(note, octave);
    
    const arrayBuffer = samples.get(noteKey);
    if (!arrayBuffer) {
      console.warn(`Sample not found for ${noteKey}`);
      return null;
    }

    try {
      // Clone the ArrayBuffer since decodeAudioData detaches it
      const clonedBuffer = arrayBuffer.slice(0);
      const audioBuffer = await ctx.decodeAudioData(clonedBuffer);
      audioBufferCache.set(cacheKey, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to decode sample ${noteKey}:`, error);
      return null;
    }
  }, [getAudioContext, loadZipSamples]);

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
    
    (async () => {
      try {
        // Load and extract ZIP
        await loadZipSamples();
        
        // Pre-decode common octaves (2-6) for faster playback
        const ctx = getAudioContext();
        const samples = zipSamples!;
        
        const toDecode: Array<{ note: NoteName; octave: number }> = [];
        for (let octave = 2; octave <= 6; octave++) {
          for (const note of NOTE_NAMES) {
            toDecode.push({ note, octave });
          }
        }

        for (const { note, octave } of toDecode) {
          await decodeSample(note, octave);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load piano samples:', error);
        setIsLoading(false);
      }
    })();
  }, [loadZipSamples, getAudioContext, decodeSample]);

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

  const playNote = useCallback(async (note: NoteName, octave: number, duration: number = 4.0) => {
    // Stop any currently playing note
    stopNote();

    const ctx = getAudioContext();
    const buffer = await decodeSample(note, octave);

    if (!buffer) {
      console.warn(`No sample available for ${note}${octave}`);
      return;
    }

    // Create source node
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Create gain node for natural envelope
    const gainNode = ctx.createGain();
    const now = ctx.currentTime;

    // Natural piano envelope - let the sample's natural decay play
    gainNode.gain.setValueAtTime(0.9, now);
    gainNode.gain.setValueAtTime(0.9, now + duration * 0.8);
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
  }, [getAudioContext, decodeSample, stopNote]);

  return {
    playNote,
    stopNote,
    isSupported: typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window),
    isLoading,
    loadProgress,
  };
}

export { NOTE_NAMES };
