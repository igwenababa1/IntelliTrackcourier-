import { useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook to play sound effects reliably.
 * @param soundUrl The URL of the audio file to play.
 * @param volume The volume level (0.0 to 1.0).
 * @returns A stable `play` function to trigger the sound.
 */
const useSound = (soundUrl: string, volume: number = 0.5): [() => void] => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the Audio object only once on mount.
  useEffect(() => {
    // Create the audio object and store it in the ref.
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';

    // The cleanup function runs when the component unmounts.
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once.

  // Effect to update volume and src if they change.
  // This separates concerns from the creation/cleanup effect.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      // It's important to only set the src if it has changed to avoid reloading.
      if (audioRef.current.src !== soundUrl) {
          audioRef.current.src = soundUrl;
      }
    }
  }, [soundUrl, volume]);

  const play = useCallback(() => {
    // The play function is stable and always reads the latest value from the ref.
    if (audioRef.current) {
      // Rewind to the start to allow playing the sound again in quick succession.
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        // Catch and log any errors that might occur during playback.
        console.error("Error playing sound:", error);
      });
    }
  }, []); // No dependencies, this function is stable.

  return [play];
};

export default useSound;