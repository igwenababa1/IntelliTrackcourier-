import React, { useEffect, useRef, useState } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import Icon from './Icon';

export interface VoiceCommand {
  command: 'track' | 'show_details' | 'cancel_shipment' | 'go_home' | 'log_out' | 'show_journey';
  payload?: string;
}

interface VoiceCommandButtonProps {
  onCommand: (command: VoiceCommand) => void;
  appState: 'welcome' | 'tracking';
}

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({ onCommand, appState }) => {
  const { isListening, transcript, startListening, stopListening, isSupported, error } = useSpeechRecognition();
  const [showStatus, setShowStatus] = useState(false);
  const statusTimerRef = useRef<number>();

  useEffect(() => {
    if (transcript) {
      processCommand(transcript.toLowerCase());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  useEffect(() => {
    if (error && error.includes('permission was denied')) {
      alert(error);
    }
  }, [error]);

  useEffect(() => {
    if (isListening || transcript) {
      setShowStatus(true);
      clearTimeout(statusTimerRef.current);
      if (!isListening && transcript) {
        statusTimerRef.current = window.setTimeout(() => setShowStatus(false), 3000);
      }
    } else {
      setShowStatus(false);
    }
    return () => clearTimeout(statusTimerRef.current);
  }, [isListening, transcript]);

  const processCommand = (text: string) => {
    // Global commands
    if (text.includes('go home') || text.includes('go back')) {
      onCommand({ command: 'go_home' });
      return;
    }
    if (text.includes('log out') || text.includes('sign out')) {
      onCommand({ command: 'log_out' });
      return;
    }

    // Context-specific commands
    if (appState === 'welcome' && (text.startsWith('track package') || text.startsWith('track packet'))) {
      const payload = text.replace(/track package?|track packet/, '').trim();
      if (payload) {
        onCommand({ command: 'track', payload });
      }
    } else if (appState === 'tracking') {
      if (text.includes('show details')) {
        onCommand({ command: 'show_details' });
      } else if (text.includes('show journey') || text.includes('show map')) {
        onCommand({ command: 'show_journey' });
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
    return null;
  }

  const getStatusText = () => {
    if (isListening) return 'Listening...';
    if (transcript) return `Heard: "${transcript}"`;
    return null;
  };

  return (
    <>
      <div className={`voice-command-status ${showStatus ? 'visible' : ''}`}>
        {getStatusText()}
      </div>
      <button
        className={`voice-command-button ${isListening ? 'listening' : ''}`}
        onClick={handleClick}
        aria-label={isListening ? 'Stop listening' : 'Start voice command'}
      >
        <div className={isListening ? 'listening-pulse' : ''}>
          <Icon name={isListening ? 'close' : 'microphone'} />
        </div>
      </button>
    </>
  );
};

export default VoiceCommandButton;
