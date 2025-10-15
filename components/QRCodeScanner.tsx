
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
        className="qr-scanner-close-button"
        onClick={onClose} 
        aria-label="Close scanner"
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
