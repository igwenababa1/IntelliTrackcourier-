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
    <form className="tracking-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="tracking-input"
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
        placeholder="Enter Tracking ID (e.g., IT123456789)"
        disabled={isLoading}
        aria-label="Tracking ID Input"
      />
      <button
        type="button"
        className="tracking-scan-button"
        onClick={onScan}
        disabled={isLoading}
        title="Scan QR Code"
        aria-label="Scan QR Code"
      >
        <Icon name="qrcode" />
      </button>
      <button
        type="submit"
        className="tracking-submit-button"
        disabled={isLoading || !trackingId.trim()}
        aria-label="Track Shipment"
      >
        {isLoading ? '...' : 'Track'}
      </button>
    </form>
  );
};

export default TrackingInput;
