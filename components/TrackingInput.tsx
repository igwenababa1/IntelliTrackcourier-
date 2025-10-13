import React, { useState } from 'react';
import Icon from './Icon';

interface TrackingInputProps {
  onTrack: (trackingId: string) => void;
  onScanClick: () => void;
}

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
  },
  input: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    backgroundColor: '#1f2937',
    color: '#e5e7eb',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    flexGrow: 1,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  iconButton: {
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s, border-color 0.2s',
  }
};

const TrackingInput: React.FC<TrackingInputProps> = ({ onTrack, onScanClick }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onTrack(inputValue.trim());
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#6366f1';
    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.4)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#4b5563';
    e.target.style.boxShadow = 'none';
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter tracking ID"
        style={styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label="Tracking ID"
      />
      <button 
        type="button" 
        style={styles.iconButton} 
        onClick={onScanClick}
        title="Scan QR Code"
        aria-label="Scan QR Code"
      >
        <Icon name="qrcode" />
      </button>
      <button type="submit" style={styles.button}>
        Track
      </button>
    </form>
  );
};

export default TrackingInput;