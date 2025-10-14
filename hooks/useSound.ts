import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook to play sound effects.
 * @param soundUrl The URL of the audio file to play.
 * @param volume The volume level (0.0 to 1.0).
 * @returns A `play` function to trigger the sound.
 */
const useSound = (soundUrl: string, volume: number = 0.5): [() => void] => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Guard against an empty soundUrl, which causes the "no supported sources" error.
    if (soundUrl) {
      const audioInstance = new Audio(soundUrl);
      audioInstance.volume = volume;
      audioInstance.preload = 'auto';
      setAudio(audioInstance);

      // Cleanup function to pause the audio when the component unmounts
      // or the soundUrl changes, preventing memory leaks.
      return () => {
        audioInstance.pause();
      };
    }
  }, [soundUrl, volume]);

  const play = useCallback(() => {
    // The play function is memoized with useCallback.
    // It checks if the audio object is ready before attempting to play.
    if (audio) {
      audio.currentTime = 0; // Rewind to the start
      audio.play().catch(error => {
        // Catch and log any errors that might occur during playback.
        console.error("Error playing sound:", error);
      });
    }
  }, [audio]);

  return [play];
};

export default useSound;