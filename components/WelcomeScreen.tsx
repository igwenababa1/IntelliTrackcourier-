// Fix: Populate the contents of components/WelcomeScreen.tsx
import React from 'react';
import TrackingInput from './TrackingInput';
import VehicleAnimation from './VehicleAnimation';
import ServiceShowcase from './ServiceShowcase';

interface WelcomeScreenProps {
  onTrack: (id: string) => void;
  onScan: () => void;
  isLoading: boolean;
  initialTrackingId?: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: 'center',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)', // Adjust for header height
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 700,
    color: 'white',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    color: 'var(--text-color)',
    marginBottom: '2.5rem',
    maxWidth: '600px',
  },
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onTrack, onScan, isLoading, initialTrackingId }) => {
  return (
    <div style={styles.container}>
      <VehicleAnimation />
      <h1 style={styles.title}>Intelligent Shipment Tracking</h1>
      <p style={styles.subtitle}>
        Real-time, secure, and verified tracking for your global shipments. Enter
        your tracking ID below to get started.
      </p>
      <TrackingInput 
        onTrack={onTrack} 
        onScan={onScan}
        isLoading={isLoading} 
        initialValue={initialTrackingId}
      />
      <ServiceShowcase />
    </div>
  );
};

export default WelcomeScreen;
