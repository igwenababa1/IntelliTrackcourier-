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
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    padding: '0.5rem',
  },
};

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  useEffect(() => {
    // Simulate a successful scan after 2.5 seconds
    const timer = setTimeout(() => {
      onScan(`QR-MOCK-${Math.floor(10000 + Math.random() * 90000)}-XYZ`);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onScan]);

  return (
    <div className="qr-scanner-overlay">
      <button style={styles.closeButton} onClick={onClose} aria-label="Close scanner">
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