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
    // This effect creates the audio object and sets its properties.
    // It runs only once when the component mounts.
    const audioInstance = new Audio(soundUrl);
    audioInstance.volume = volume;
    audioInstance.preload = 'auto';
    setAudio(audioInstance);

    // No cleanup needed for the audio object itself, as it's managed by the browser.
  }, [soundUrl, volume]);

  const play = useCallback(() => {
    // The play function is memoized with useCallback.
    // It checks if the audio is ready and plays it from the beginning.
    if (audio) {
      audio.currentTime = 0; // Rewind to the start
      audio.play().catch(error => {
        // Catch and log any errors that occur during playback.
        console.error("Error playing sound:", error);
      });
    }
  }, [audio]);

  return [play];
};

export default useSound;
