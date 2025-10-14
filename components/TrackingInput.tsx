// Fix: Populate the contents of components/TrackingInput.tsx
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import Icon from './Icon';
import useSound from '../hooks/useSound';
import { COMMAND_SOUND } from './sounds';

interface TrackingInputProps {
  onTrack: (id: string) => void;
  onScan: () => void;
  isLoading: boolean;
  initialValue?: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    display: 'flex',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
  },
  input: {
    flexGrow: 1,
    padding: '1rem 1.25rem',
    fontSize: '1.125rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'white',
    outline: 'none',
  },
  button: {
    padding: '1rem 1.25rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary-color)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  trackButton: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    fontWeight: 600,
    letterSpacing: '0.5px',
    transition: 'background-color 0.2s',
  }
};

const TrackingInput: React.FC<TrackingInputProps> = ({ onTrack, onScan, isLoading, initialValue = '' }) => {
  const [trackingId, setTrackingId] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const [playTrackSound] = useSound(COMMAND_SOUND, 0.4);

  useEffect(() => {
    setTrackingId(initialValue);
  }, [initialValue]);

  useEffect(() => {
    // Auto-focus the input on mount if it's empty
    if (!initialValue) {
      inputRef.current?.focus();
    }
  }, [initialValue]);


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (trackingId.trim() && !isLoading) {
      playTrackSound();
      onTrack(trackingId.trim());
    }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        style={styles.input}
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
        placeholder="Enter Tracking ID (e.g., IT123456789)"
        disabled={isLoading}
        aria-label="Tracking ID Input"
      />
      <button
        type="button"
        style={styles.button}
        onClick={onScan}
        disabled={isLoading}
        title="Scan QR Code"
        aria-label="Scan QR Code"
        onMouseOver={(e) => { e.currentTarget.style.color = 'white'; }}
        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary-color)'; }}
      >
        <Icon name="qrcode" />
      </button>
      <button
        type="submit"
        style={{ ...styles.button, ...styles.trackButton }}
        disabled={isLoading || !trackingId.trim()}
        aria-label="Track Shipment"
        onMouseOver={(e) => { if (!isLoading && trackingId.trim()) e.currentTarget.style.backgroundColor = '#6966ff'; }}
        onMouseOut={(e) => { if (!isLoading && trackingId.trim()) e.currentTarget.style.backgroundColor = 'var(--primary-color)'; }}
      >
        {isLoading ? '...' : 'Track'}
      </button>
    </form>
  );
};

export default TrackingInput;
