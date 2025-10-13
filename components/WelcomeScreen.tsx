import React, { useState } from 'react';
import TrackingInput from './TrackingInput';
import QRCodeScanner from './QRCodeScanner';
import ServiceShowcase from './ServiceShowcase';

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
    color: '#f87171',
    marginTop: '1.5rem',
    fontWeight: 500,
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
        {error && <p style={styles.error}>{error}</p>}
        
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