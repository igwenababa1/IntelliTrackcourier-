import React, { useEffect, useState } from 'react';
import { generateGoodbyeSpeech } from '../services/geminiService';

// --- Audio Decoding Utilities (as per Gemini API guidelines) ---

// Decodes a base64 string to a Uint8Array.
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM audio data into an AudioBuffer.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface LogoutScreenProps {
  onComplete: () => void;
}

const LOGOUT_DURATION = 5000; // 5 seconds

const LOGOUT_BACKGROUND_IMAGES = [
  'https://images.pexels.com/photos/1250355/pexels-photo-1250355.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // FedEx plane taking off with motion blur
  'https://images.pexels.com/photos/4703/sky-aircraft-plane-jet.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Cargo plane climbing into the sky
  'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Plane on runway at sunset, ready for takeoff
  'https://images.pexels.com/photos/804475/pexels-photo-804475.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',   // Cargo plane from below, taking off
];


const LogoutScreen: React.FC<LogoutScreenProps> = ({ onComplete }) => {
  const [audioContext] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));

  useEffect(() => {
    
    const playGoodbyeMessage = async () => {
      try {
        const base64Audio = await generateGoodbyeSpeech();
        const decodedBytes = decode(base64Audio);
        const buffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      } catch (error) {
        console.error("Failed to play goodbye message:", error);
      }
    };
    
    playGoodbyeMessage();

    const timer = setTimeout(() => {
      onComplete();
    }, LOGOUT_DURATION);

    return () => {
        clearTimeout(timer);
        // Clean up audio context to prevent resource leaks
        if(audioContext.state !== 'closed') {
            audioContext.close();
        }
    };
  }, [onComplete, audioContext]);

  return (
    <div className="logout-screen-container">
      <div className="logout-bg">
        {LOGOUT_BACKGROUND_IMAGES.map((url, index) => (
          <div
            key={index}
            className="logout-bg-slide"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
      <div className="logout-content">
        <div className="logout-icon-container">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" stroke="#22c55e" strokeWidth="4" className="checkmark-circle" />
            <path d="M24 41.5L36.5 54L58 32.5" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="checkmark-check" />
          </svg>
        </div>
        <h1 className="logout-title">Thank You!</h1>
        <p className="logout-message">
          Your session has been securely logged out. We appreciate your business and look forward to serving you again.
        </p>
        <div className="logout-progress-bar-container">
          <div className="logout-progress-bar" />
        </div>
        <button className="logout-home-button" onClick={onComplete}>
          Return Home Now
        </button>
      </div>
    </div>
  );
};

export default LogoutScreen;