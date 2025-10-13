import React, { useEffect } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import Icon from './Icon';

export interface VoiceCommand {
  command: 'track' | 'show_details' | 'cancel_shipment';
  payload?: string;
}

interface VoiceCommandButtonProps {
  onCommand: (command: VoiceCommand) => void;
  appState: 'welcome' | 'tracking'; // To know which commands are relevant
}

const styles: { [key: string]: React.CSSProperties } = {
  button: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    transition: 'transform 0.2s ease-in-out, background-color 0.2s',
    zIndex: 1000,
  },
  listening: {
    backgroundColor: '#ef4444', // Red when listening
    transform: 'scale(1.1)',
  },
  listeningPulse: {
    animation: 'pulse 1.5s infinite',
  },
  statusText: {
    position: 'fixed',
    bottom: '6.5rem',
    right: '2rem',
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    opacity: 0,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    transform: 'translateY(10px)',
    pointerEvents: 'none',
    zIndex: 1000,
  },
  statusVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  }
};

const keyframes = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
  }
`;

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({ onCommand, appState }) => {
  const { isListening, transcript, startListening, stopListening, isSupported, error } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      processCommand(transcript.toLowerCase());
    }
  }, [transcript]);

  useEffect(() => {
    if (error && error.includes('permission was denied')) {
      alert(error);
    }
  }, [error]);

  const processCommand = (text: string) => {
    if (appState === 'welcome' && text.startsWith('track package')) {
      const payload = text.replace('track package', '').trim();
      if (payload) {
        onCommand({ command: 'track', payload });
      }
    } else if (appState === 'tracking') {
      if (text.includes('show details')) {
        onCommand({ command: 'show_details' });
      } else if (text.includes('cancel shipment')) {
        onCommand({ command: 'cancel_shipment' });
      }
    }
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null; // Don't render if the browser doesn't support it
  }

  const getStatusText = () => {
    if (isListening) return 'Listening...';
    if (transcript) return `Heard: "${transcript}"`;
    return null;
  }

  return (
    <>
      <style>{keyframes}</style>
      <div 
        style={{ ...styles.statusText, ...( (isListening || transcript) ? styles.statusVisible : {})}}
      >
        {getStatusText()}
      </div>
      <button 
        style={{ ...styles.button, ...(isListening ? styles.listening : {}) }}
        onClick={handleClick}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
      >
        <div style={isListening ? styles.listeningPulse : {}}>
          <Icon name={isListening ? 'close' : 'microphone'} />
        </div>
      </button>
    </>
  );
};

export default VoiceCommandButton;