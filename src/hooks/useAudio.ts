import { useCallback, useRef, useEffect, useState } from 'react';
import JSZip from 'jszip';

// Note names for mapping - using FLATS (matches the sample file naming)
const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export type NoteName = typeof NOTE_NAMES[number];

// Map from our note names to the sample file naming convention
// Samples use format: C4.mp3, Db4.mp3, D4.mp3, Eb4.mp3, etc.
function getNoteFileName(note: NoteName, octave: number): string {
  return `${note}${octave}`;
}

interface UseAudioReturn {
  playNote: (note: NoteName, octave: number, duration?: number) => void;
  stopNote: () => void;
  isSupported: boolean;
  isLoading: boolean;
  loadProgress: number;
  isPlaying: boolean;
  playbackProgress: number; // 0-100, how much of the note duration has elapsed
}

// Cache for loaded audio buffers
const audioBufferCache: Map<string, AudioBuffer> = new Map();
let isPreloading = false;
let preloadProgress = 0;
let zipSamples: Map<string, ArrayBuffer> | null = null;

// Octaves available in the sample set (0-7)
const SAMPLE_OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7];

export function useAudio(): UseAudioReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeGainRef = useRef<GainNode | null>(null);
  const activeNoteKeyRef = useRef<string | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const playbackStartRef = useRef<number>(0);
  const playbackDurationRef = useRef<number>(4000);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

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

    const response = await fetch('/audio/piano-mp3.zip');
    const zipData = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(zipData);
    
    const samples = new Map<string, ArrayBuffer>();
    const files = Object.keys(zip.files).filter(name => name.endsWith('.mp3'));
    
    let loaded = 0;
    const total = files.length;

    for (const fileName of files) {
      const file = zip.files[fileName];
      if (!file.dir) {
        // Extract note name from filename like "C4.mp3", "Db4.mp3", etc.
        // The filename may include a path, so get just the base name
        const baseName = fileName.split('/').pop() || fileName;
        const match = baseName.match(/^([A-G]b?)(\d)\.mp3$/i);
        if (match) {
          const noteName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
          const octave = match[2];
          const noteKey = `${noteName}${octave}`;
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

  const clearPlaybackTimer = useCallback(() => {
    if (playbackTimerRef.current) {
      cancelAnimationFrame(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
  }, []);

  const startPlaybackTimer = useCallback((durationMs: number) => {
    clearPlaybackTimer();
    playbackStartRef.current = performance.now();
    playbackDurationRef.current = durationMs;
    setIsPlaying(true);
    setPlaybackProgress(0);

    const updateProgress = () => {
      const elapsed = performance.now() - playbackStartRef.current;
      const progress = Math.min(100, (elapsed / playbackDurationRef.current) * 100);
      setPlaybackProgress(progress);

      if (progress < 100) {
        playbackTimerRef.current = requestAnimationFrame(updateProgress);
      } else {
        setIsPlaying(false);
        setPlaybackProgress(0);
      }
    };

    playbackTimerRef.current = requestAnimationFrame(updateProgress);
  }, [clearPlaybackTimer]);

  const stopNote = useCallback(() => {
    const ctx = audioContextRef.current;
    const source = activeSourceRef.current;
    const gainNode = activeGainRef.current;

    clearPlaybackTimer();

    if (!ctx || !source || !gainNode) return;

    const now = ctx.currentTime;

    try {
      // Ultra-short fade to avoid clicks/pops (but not truncating normal sustain)
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.015);
      source.stop(now + 0.02);
    } catch (e) {
      // Ignore if already stopped
    } finally {
      activeSourceRef.current = null;
      activeGainRef.current = null;
      activeNoteKeyRef.current = null;
    }
  }, [clearPlaybackTimer]);

  const playNote = useCallback(async (note: NoteName, octave: number, duration: number = 4.0) => {
    const noteKey = `${note}${octave}`;

    // Only interrupt audio when the user is effectively "replaying" the same note.
    // Playing a different note should NOT cut off the prior one.
    if (activeSourceRef.current && activeNoteKeyRef.current === noteKey) {
      stopNote();
    }

    const ctx = getAudioContext();
    const buffer = await decodeSample(note, octave);

    if (!buffer) {
      console.warn(`No sample available for ${note}${octave}`);
      return;
    }

    // Create source node
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Gain node for headroom + click-free stop (we do NOT fade early)
    const gainNode = ctx.createGain();
    const now = ctx.currentTime;

    // Let the recorded sample's natural decay do the work.
    // We only do a tiny fade in the last ~20ms to prevent a stop click.
    const targetDuration = Math.max(0.1, duration);
    const fadeOutStart = now + Math.max(0, targetDuration - 0.02);

    gainNode.gain.setValueAtTime(1.5, now);
    gainNode.gain.setValueAtTime(1.5, fadeOutStart);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + targetDuration);

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Track latest note (used to detect replay)
    activeSourceRef.current = source;
    activeGainRef.current = gainNode;
    activeNoteKeyRef.current = noteKey;

    source.start(now);
    // Schedule stop at exactly currentTime + duration (requested)
    source.stop(now + targetDuration);

    // Start playback progress timer (duration in ms)
    startPlaybackTimer(targetDuration * 1000);
  }, [getAudioContext, decodeSample, stopNote, startPlaybackTimer]);

  return {
    playNote,
    stopNote,
    isSupported: typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window),
    isLoading,
    loadProgress,
    isPlaying,
    playbackProgress,
  };
}

export { NOTE_NAMES };
