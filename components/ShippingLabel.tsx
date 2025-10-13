import React, { useEffect, useRef, useState } from 'react';
import { PackageDetails } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import Icon from './Icon';

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    animation: 'fadeIn 0.3s ease',
    padding: '1rem',
    boxSizing: 'border-box',
  },
  modal: {
    backgroundColor: 'transparent',
    borderRadius: '0.75rem',
    width: '100%',
    maxWidth: '500px',
    position: 'relative',
    textAlign: 'center',
  },
  labelContainer: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    backgroundColor: 'white',
    color: 'black',
    padding: '0.25in',
    width: '4in',
    height: '6in',
    boxSizing: 'border-box',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid black',
    paddingBottom: '0.1in',
  },
  brand: {
    fontSize: '14pt',
    fontWeight: 'bold',
  },
  serviceType: {
    fontSize: '10pt',
    fontWeight: '500',
    textAlign: 'right',
  },
  addressSection: {
    display: 'flex',
    flexGrow: 1,
  },
  address: {
    width: '50%',
    padding: '0.2in 0.1in',
    fontSize: '11pt',
  },
  addressFrom: {
    borderRight: '1px dashed grey',
  },
  addressLabel: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: '8pt',
    marginBottom: '0.1in',
  },
  addressDetails: {
    margin: 0,
    lineHeight: 1.4,
  },
  footer: {
    borderTop: '2px solid black',
    paddingTop: '0.1in',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.2in',
  },
  qrCode: {
    width: '1.2in',
    height: '1.2in',
  },
  barcodeContainer: {
    flexGrow: 1,
    textAlign: 'center',
  },
  barcode: {
    display: 'flex',
    height: '0.7in',
    alignItems: 'flex-end',
  },
  barcodeBar: {
    backgroundColor: 'black',
    margin: '0 1px',
  },
  trackingIdText: {
    fontSize: '9pt',
    letterSpacing: '2px',
    marginTop: '0.05in',
  },
  actions: {
    marginTop: '1.5rem',
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
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
  closeButton: {
    backgroundColor: '#374151',
  }
};

const Barcode: React.FC = () => {
  const bars = Array.from({ length: 40 }, () => ({
    width: Math.floor(Math.random() * 2) + 1,
    height: Math.floor(Math.random() * 50) + 30,
  }));

  return (
    <div style={styles.barcode}>
      {bars.map((bar, index) => (
        <div
          key={index}
          style={{
            ...styles.barcodeBar,
            width: `${bar.width * 2}px`,
            height: `${bar.height}%`,
          }}
        />
      ))}
    </div>
  );
};

interface ShippingLabelProps {
  details: PackageDetails;
  onClose: () => void;
}

const ShippingLabel: React.FC<ShippingLabelProps> = ({ details, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCode.toDataURL(details.id, { errorCorrectionLevel: 'H', margin: 1, width: 200 })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('Failed to generate QR code', err));
  }, [details.id]);

  const handleDownloadPdf = async () => {
    if (!labelRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(labelRef.current, {
        scale: 3,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [4, 6]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 4, 6, undefined, 'FAST');
      pdf.save(`shipping-label-${details.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div ref={labelRef} style={styles.labelContainer}>
          <header style={styles.header}>
            <div style={styles.brand}>IntelliTrack</div>
            <div style={styles.serviceType}>
              PRIORITY<br/>
              Est. Delivery: {details.estimatedDelivery}
            </div>
          </header>
          <section style={styles.addressSection}>
            <div style={{...styles.address, ...styles.addressFrom}}>
              <p style={styles.addressLabel}>FROM</p>
              <p style={styles.addressDetails}>
                {details.origin.name}<br/>
                {details.origin.street}<br/>
                {details.origin.cityStateZip}<br/>
                {details.origin.country}
              </p>
            </div>
            <div style={styles.address}>
              <p style={styles.addressLabel}>TO</p>
              <p style={styles.addressDetails}>
                {details.destination.name}<br/>
                {details.destination.street}<br/>
                {details.destination.cityStateZip}<br/>
                {details.destination.country}
              </p>
            </div>
          </section>
          <footer style={styles.footer}>
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrCode} />}
            <div style={styles.barcodeContainer}>
               <Barcode />
               <p style={styles.trackingIdText}>{details.id}</p>
            </div>
          </footer>
        </div>
        <div style={styles.actions}>
            <button 
              onClick={handleDownloadPdf} 
              style={styles.button}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <button 
              onClick={onClose} 
              style={{...styles.button, ...styles.closeButton}}
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingLabel;