import { useCallback, useRef } from 'react';

/**
 * A robust custom hook to play sound effects reliably.
 * It creates a new Audio object for each playback request and manages a pool
 * of playing instances to prevent them from being garbage-collected prematurely.
 * @param soundUrl The URL of the audio file to play.
 * @param volume The volume level (0.0 to 1.0).
 * @returns A stable `play` function to trigger the sound.
 */
const useSound = (soundUrl: string, volume: number = 0.5): [() => void] => {
  // Use a ref to hold a set of currently playing audio instances.
  // This is crucial to prevent the browser's garbage collector from
  // cleaning up the audio objects before they have finished playing.
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());

  const play = useCallback(() => {
    // Create a new Audio object for every play request. This is more
    // reliable than cloning and avoids issues with the state of a shared instance.
    const audio = new Audio(soundUrl);
    audio.volume = volume;

    // Add the new audio instance to our set to keep a reference to it.
    activeSoundsRef.current.add(audio);

    // When the sound finishes playing, remove it from the set so it can be GC'd.
    audio.onended = () => {
      audio.onended = null; // Clean up listener to prevent potential memory leaks
      activeSoundsRef.current.delete(audio);
    };
    
    // Also handle errors during playback
    audio.onerror = () => {
      console.error('Audio playback error: Could not load the sound source.');
      audio.onerror = null;
      activeSoundsRef.current.delete(audio);
    };

    // Play the sound and handle potential promise-based errors.
    audio.play().catch(error => {
      // The user likely interrupted the sound (e.g., by navigating away),
      // which is not a critical error. We log other errors.
      if (error.name !== 'AbortError') {
        console.error(`Error playing sound: ${error.message}`);
      }
      // Make sure to clean up the reference if playback fails to start.
      activeSoundsRef.current.delete(audio);
    });
  }, [soundUrl, volume]);

  return [play];
};

export default useSound;
