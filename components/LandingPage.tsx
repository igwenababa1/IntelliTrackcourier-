import React, { useState, useEffect, useCallback } from 'react';
import { generateWelcomeSpeech } from '../services/geminiService';
import Icon from './Icon';

interface LandingPageProps {
  onProceed: () => void;
}

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


const LandingPage: React.FC<LandingPageProps> = ({ onProceed }) => {
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    // Safari requires the context to be created/resumed on user gesture,
    // so we create it here but will resume it on the button click.
    const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    setAudioContext(context);
  }, []);

  // Fetch and decode the welcome speech
  useEffect(() => {
    if (!audioContext) return;

    const prepareSpeech = async () => {
      try {
        const base64Audio = await generateWelcomeSpeech();
        const decodedBytes = decode(base64Audio);
        const buffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
        setAudioBuffer(buffer);
      } catch (error) {
        console.error("Failed to prepare welcome speech:", error);
      } finally {
        setIsAudioLoading(false);
      }
    };
    prepareSpeech();
  }, [audioContext]);

  const handleProceed = useCallback(() => {
    if (audioContext && audioBuffer) {
      // Resume context on user gesture if needed
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
    
    const landingContent = document.querySelector('.landing-content');
    if (landingContent instanceof HTMLElement) {
      landingContent.style.opacity = '0';
    }
    const featureCards = document.querySelector('.feature-cards-3d');
    if (featureCards instanceof HTMLElement) {
        featureCards.style.display = 'none';
    }

    // Call the parent handler to start the next phase (animation)
    setTimeout(onProceed, 500);
  }, [audioContext, audioBuffer, onProceed]);

  return (
    <div className="landing-overlay">
      <div className="feature-cards-3d">
        <div className="feature-card-3d card-1" style={{ '--transform-start': 'translate3d(-350px, -150px, -200px) rotateY(20deg)' } as React.CSSProperties}>
            <Icon name="globe-check" />
            <h4>Global Reach</h4>
            <p>Seamless tracking across continents.</p>
        </div>
        <div className="feature-card-3d card-2" style={{ '--transform-start': 'translate3d(350px, 0px, -250px) rotateY(-25deg)' } as React.CSSProperties}>
            <Icon name="shield-check" />
            <h4>Verified Security</h4>
            <p>Encrypted, secure shipment data.</p>
        </div>
        <div className="feature-card-3d card-3" style={{ '--transform-start': 'translate3d(-200px, 180px, -150px) rotateY(15deg)' } as React.CSSProperties}>
            <Icon name="package" />
            <h4>Real-Time AI</h4>
            <p>Intelligent, predictive ETAs.</p>
        </div>
      </div>

      <div className="landing-container">
        <div className="landing-content">
          <h1 className="landing-title">IntelliTrack</h1>
          <p className="landing-subtitle">
            The future of global logistics is here. Experience the peace of mind that comes with the world's most advanced, secure, and reliable courier service.
          </p>
          <button
            className="proceed-button"
            onClick={handleProceed}
            disabled={isAudioLoading}
          >
            {isAudioLoading ? 'Initializing...' : 'Begin Tracking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;