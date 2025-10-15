import React, { useState, useEffect } from 'react';
import { PackageDetails } from '../types';
import { generateCalmingUpdateSpeech } from '../services/geminiService';
import ZenProgressBar from './ZenProgressBar';
import useSound from '../hooks/useSound';
import { COMMAND_SOUND } from './sounds';

// --- Audio Decoding Utilities (as per Gemini API guidelines) ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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

interface ZenGardenProps {
    packageDetails: PackageDetails;
}

const ZenGarden: React.FC<ZenGardenProps> = ({ packageDetails }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioContext] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));
    const [playClick] = useSound(COMMAND_SOUND, 0.4);

    const handlePlayUpdate = async () => {
        if (isSpeaking) return;
        playClick();
        setIsSpeaking(true);
        try {
            const base64Audio = await generateCalmingUpdateSpeech(packageDetails.status);
            const decodedBytes = decode(base64Audio);
            const buffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
            
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
            }

            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
            source.onended = () => setIsSpeaking(false);
        } catch (error) {
            console.error("Failed to play calming update:", error);
            setIsSpeaking(false);
        }
    };
    
    // Create decorative ripples for the background
    useEffect(() => {
        const container = document.querySelector('.zen-garden-container');
        if (!container) return;
        
        const interval = setInterval(() => {
            const ripple = document.createElement('div');
            ripple.className = 'zen-ripple';
            ripple.style.left = `${Math.random() * 100}%`;
            ripple.style.top = `${Math.random() * 100}%`;
            container.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 4000); // Match animation duration
        }, 800);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="zen-garden-container">
            <h2 className="zen-garden-title">Your package is on its way.</h2>
            <ZenProgressBar status={packageDetails.status} />
             <button
                className="zen-garden-button"
                onClick={handlePlayUpdate}
                disabled={isSpeaking}
             >
                {isSpeaking ? 'Speaking...' : 'Play Calming Update'}
            </button>
        </div>
    );
};

export default ZenGarden;
