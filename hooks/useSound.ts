import { useCallback, useRef, useEffect, useState } from 'react';

// Create a single, shared AudioContext for all sound effects.
// This is more efficient than creating one for each sound.
let audioContext: AudioContext | null = null;
if (typeof window !== 'undefined') {
  try {
    // Safari may require a user gesture to start, but we can initialize it.
    // The `resume()` call in `play()` will handle suspended contexts.
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch (e) {
    console.error("Web Audio API is not supported in this browser.", e);
  }
}

// A cache to store decoded AudioBuffers, keyed by the sound URL.
// This prevents re-fetching and re-decoding the same sound repeatedly.
const audioBufferCache = new Map<string, AudioBuffer>();

/**
 * A robust custom hook to play sound effects using the Web Audio API.
 * This approach is more reliable across browsers than using new Audio() with data URLs.
 * It pre-decodes and caches audio for performant playback.
 * @param soundUrl The base64 data URL of the audio file.
 * @param volume The volume level (0.0 to 1.0).
 * @returns A tuple containing a stable `play` function and a boolean `isReady`.
 */
const useSound = (soundUrl: string, volume: number = 0.5): [() => void, boolean] => {
  const [isReady, setIsReady] = useState(false);
  // Use a ref for volume to avoid re-creating the play callback when volume changes.
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  useEffect(() => {
    // Pre-decode the audio data when the hook mounts.
    const loadSound = async () => {
      // Don't proceed if context is not available, or URL is missing.
      if (!audioContext || !soundUrl) {
        return;
      }
      // Use the cached buffer if available.
      if (audioBufferCache.has(soundUrl)) {
        setIsReady(true);
        return;
      }

      try {
        // Fetch is a modern way to handle data URLs and get an ArrayBuffer.
        const response = await fetch(soundUrl);
        const arrayBuffer = await response.arrayBuffer();

        // Decode the audio data into an AudioBuffer. This is async.
        // The callback style is used for broader browser compatibility.
        audioContext.decodeAudioData(
          arrayBuffer,
          (buffer) => {
            audioBufferCache.set(soundUrl, buffer);
            setIsReady(true);
          },
          (error) => {
            // This callback is for decoding errors.
            console.error(`Error decoding audio data for sound URL:`, error);
          }
        );
      } catch (error) {
        // This catch block is for fetch/network errors.
        console.error(`Error fetching or processing sound URL:`, error);
      }
    };

    loadSound();
  }, [soundUrl]); // Rerun effect only if the soundUrl changes.

  const play = useCallback(() => {
    const audioBuffer = audioBufferCache.get(soundUrl);
    
    if (!audioContext || !audioBuffer) {
      console.warn(`Sound not ready or audio context unavailable. Cannot play.`);
      return;
    }

    // Resume AudioContext if it's suspended (e.g., due to browser autoplay policies).
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Create a source node. This can only be played once.
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Create a gain node to control the volume.
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volumeRef.current, audioContext.currentTime);

    // Connect the graph: source -> gain -> destination (speakers).
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0);
  }, [soundUrl]);

  return [play, isReady];
};

export default useSound;
