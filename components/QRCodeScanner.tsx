import React, { useEffect } from 'react';
import Icon from './Icon';

interface QRCodeScannerProps {
  onScan: (id: string) => void;
  onClose: () => void;
}

const styles: { [key: string]: React.CSSProperties } = {
  overlayText: {
    color: 'white',
    marginTop: '1.5rem',
    fontSize: '1.125rem',
    fontWeight: 500,
  },
  closeButton: {
    position: 'absolute',
    top: '2rem',
    right: '2rem',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    cursor: 'pointer',
    padding: '0.75rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    transition: 'background-color 0.2s, transform 0.2s',
  },
};

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onScan(`QR-MOCK-${Math.floor(10000 + Math.random() * 90000)}-XYZ`);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onScan]);

  return (
    <div className="qr-scanner-overlay">
      <button 
        style={styles.closeButton} 
        onClick={onClose} 
        aria-label="Close scanner"
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <Icon name="close" />
      </button>
      <div className="qr-scanner-box">
        <div className="qr-scanner-line"></div>
      </div>
      <p style={styles.overlayText}>Scanning for QR Code...</p>
    </div>
  );
};

export default QRCodeScanner;