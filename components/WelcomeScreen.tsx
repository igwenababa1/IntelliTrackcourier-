import React, { useState } from 'react';
import TrackingInput from './TrackingInput';
import QRCodeScanner from './QRCodeScanner';
import ServiceShowcase from './ServiceShowcase';
import Icon from './Icon';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 800,
    marginBottom: '0.5rem',
    background: 'linear-gradient(90deg, #a5b4fc, #e5e7eb, #a5b4fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundSize: '200% auto',
    animation: 'text-shimmer 4s linear infinite',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#9ca3af',
    marginBottom: '2.5rem',
    maxWidth: '500px',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#fca5a5',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    marginTop: '1.5rem',
    width: '100%',
    boxSizing: 'border-box',
    animation: 'shake 0.5s ease-in-out',
  },
  errorText: {
    fontWeight: 500,
    margin: 0,
    textAlign: 'left',
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    color: '#f87171',
    flexShrink: 0,
  }
};

interface WelcomeScreenProps {
  onTrack: (trackingId: string) => void;
  error?: string | null;
  isExiting?: boolean;
  recentShipments: string[];
  onRetrack: (trackingId: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onTrack, error, isExiting, recentShipments, onRetrack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const animationClass = isExiting ? 'fade-out' : 'fade-in';

  const handleScan = (trackingId: string) => {
    setIsScanning(false);
    onTrack(trackingId);
  };

  return (
    <>
      <div style={styles.container} className={animationClass}>
        <h1 style={styles.title}>IntelliTrack Global Courier</h1>
        <p style={styles.subtitle}>
          Real-time tracking, powered by AI. Enter your tracking number to see the
          magic.
        </p>
        <TrackingInput onTrack={onTrack} onScanClick={() => setIsScanning(true)} />
        {error && (
          <div style={styles.error} role="alert">
            <Icon name="alert-triangle" style={styles.errorIcon} />
            <p style={styles.errorText}>{error}</p>
          </div>
        )}
        
        {recentShipments.length > 0 && (
          <div className="recent-shipments-container">
            <h3 className="recent-shipments-title">Recent Shipments</h3>
            <div className="recent-shipments-list">
              {recentShipments.map((id) => (
                <button
                  key={id}
                  className="recent-shipment-item"
                  onClick={() => onRetrack(id)}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <ServiceShowcase />
      </div>
      {isScanning && (
        <QRCodeScanner 
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
        />
      )}
    </>
  );
};

export default WelcomeScreen;