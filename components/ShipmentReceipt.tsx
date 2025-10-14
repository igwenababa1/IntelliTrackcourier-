import React from 'react';
import { PackageDetails } from '../types';
import Icon from './Icon';

const styles: { [key: string]: React.CSSProperties } = {
  // --- Wrapper in the main UI ---
  receiptWrapper: {
    backgroundColor: '#1f2937',
    padding: '1rem',
    borderRadius: '0.5rem',
  },
  // --- The actual receipt component ---
  container: {
    fontFamily: '"Courier New", Courier, monospace',
    backgroundColor: '#f9fafb', // Off-white for a softer, paper-like look
    color: '#111827',
    padding: '1.5rem',
    border: '2px solid #374151', // A single, solid, professional border
    position: 'relative',
    overflow: 'hidden',
  },
  // --- Header Section ---
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '1rem',
    borderBottom: '3px double #374151', // Classic double-line border
    marginBottom: '1.5rem',
  },
  headerLeft: {
    textAlign: 'left',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: 0,
  },
  brand: {
    fontSize: '0.875rem',
    color: '#4b5563',
    margin: 0,
  },
  headerRight: {
    textAlign: 'right',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  // --- Main Body Sections ---
  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    borderBottom: '1px solid #d1d5db',
    paddingBottom: '1.5rem',
    marginBottom: '1.5rem',
  },
  section: {},
  sectionTitle: {
    fontWeight: 'bold',
    paddingBottom: '0.25rem',
    marginBottom: '0.75rem',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    color: '#4b5563',
    margin: 0,
    borderBottom: '1px solid #e5e7eb',
  },
  address: {
    lineHeight: 1.6,
    fontSize: '0.875rem',
  },
  // --- Package Summary ---
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem 1.5rem',
  },
  item: {
    fontSize: '0.875rem',
    wordBreak: 'break-word',
  },
  itemLabel: {
    color: '#6b7280',
    display: 'block',
    fontSize: '0.75rem',
  },
  itemValue: {
    fontWeight: '600',
  },
  // Declared items table
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  tableHeader: {
    textAlign: 'left',
    borderBottom: '2px solid #374151',
    padding: '0.5rem',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    padding: '0.5rem',
  },
  tableCellRight: {
    padding: '0.5rem',
    textAlign: 'right',
  },
  // --- Barcode Section ---
  barcodeSection: {
    textAlign: 'center',
    padding: '1.5rem 0',
  },
  barcode: {
    display: 'flex',
    height: '50px',
    alignItems: 'flex-end',
    justifyContent: 'center',
    maxWidth: '350px',
    margin: '0.5rem auto 0',
  },
  barcodeBar: {
    backgroundColor: 'black',
    margin: '0 1px',
  },
  trackingIdText: {
    fontSize: '1rem',
    letterSpacing: '4px',
    fontWeight: 'bold',
  },
  // --- Footer Section ---
  footer: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#6b7280',
    paddingTop: '1rem',
    borderTop: '2px dashed #9ca3af', // Classic tear-off line
  },
  // --- Action Button ---
  printButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    marginTop: '1.5rem',
    transition: 'background-color 0.2s',
  },
  // Custom seal for receipt
  customsSeal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-15deg)',
    width: '150px',
    height: '150px',
    border: '5px double #3b82f6',
    borderRadius: '50%',
    color: '#3b82f6',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontFamily: '"Times New Roman", Times, serif',
    fontWeight: 'bold',
    opacity: 0.15,
    pointerEvents: 'none',
  },
  sealIcon: {
      width: '48px',
      height: '48px',
      marginBottom: '5px'
  },
  sealTextTop: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
  },
  sealTextBottom: {
      fontSize: '10px',
      marginTop: '2px',
  },
};

const DecorativeBarcode: React.FC = () => {
  // Use useMemo to prevent re-generation on every render.
  // Heights are constrained for a cleaner, more uniform appearance.
  const bars = React.useMemo(() => Array.from({ length: 50 }, () => ({
    width: Math.floor(Math.random() * 2) + 1,
    height: Math.floor(Math.random() * 20) + 80, // Height varies between 80% and 100%
  })), []);

  return (
    <div style={styles.barcode}>
      {bars.map((bar, index) => (
        <div
          key={index}
          style={{
            ...styles.barcodeBar,
            width: `${bar.width * 1.5}px`, // Make bars slightly thicker
            height: `${bar.height}%`,
          }}
        />
      ))}
    </div>
  );
};

const ShipmentReceipt: React.FC<{ details: PackageDetails }> = ({ details }) => {
  const handlePrint = () => {
    window.print();
  };
  
  const totalCustomsValue = details.declaredItems.reduce((acc, item) => acc + (item.value * item.quantity), 0);

  return (
    <div>
      <div id="shipment-receipt" style={styles.receiptWrapper}>
        <div style={styles.container}>
           <div style={styles.customsSeal}>
              <Icon name="shield-check" style={styles.sealIcon} />
              <span style={styles.sealTextTop}>CUSTOMS CLEARED</span>
              <span style={styles.sealTextBottom}>W.C.O. VERIFIED</span>
          </div>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <h3 style={styles.title}>Shipment Receipt</h3>
              <p style={styles.brand}>IntelliTrack Global Courier</p>
            </div>
            <div style={styles.headerRight}>
              <strong>Date:</strong> {new Date().toLocaleDateString()}<br/>
              <strong>Status:</strong> {details.status}
            </div>
          </div>

          <div style={styles.body}>
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Sender</h4>
              <div style={styles.address}>
                <strong style={{ fontWeight: 'bold' }}>{details.origin.name}</strong><br/>
                {details.origin.street}<br/>
                {details.origin.cityStateZip}
              </div>
            </div>
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>Recipient</h4>
              <div style={styles.address}>
                <strong style={{ fontWeight: 'bold' }}>{details.destination.name}</strong><br/>
                {details.destination.street}<br/>
                {details.destination.cityStateZip}
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h4 style={{ ...styles.sectionTitle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="shield-check" style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
              <span>Official Customs Declaration</span>
            </h4>
            <table style={styles.itemsTable}>
                <thead>
                    <tr>
                        <th style={styles.tableHeader}>Description</th>
                        <th style={{...styles.tableHeader, textAlign: 'center'}}>Qty</th>
                        <th style={styles.tableCellRight}>Value</th>
                        <th style={styles.tableCellRight}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {details.declaredItems.map((item, index) => (
                        <tr key={index} style={styles.tableRow}>
                            <td style={styles.tableCell}>{item.description}</td>
                            <td style={{...styles.tableCell, textAlign: 'center'}}>{item.quantity}</td>
                            <td style={styles.tableCellRight}>${item.value.toFixed(2)}</td>
                            <td style={styles.tableCellRight}>${(item.value * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3} style={{...styles.tableCellRight, fontWeight: 'bold'}}>Total Customs Value</td>
                        <td style={{...styles.tableCellRight, fontWeight: 'bold'}}>${totalCustomsValue.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
          </div>

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Package &amp; Service Details</h4>
            <div style={styles.summaryGrid}>
              <p style={styles.item}><span style={styles.itemLabel}>Service</span><span style={styles.itemValue}>{details.service}</span></p>
              <p style={styles.item}><span style={styles.itemLabel}>Weight</span><span style={styles.itemValue}>{details.weight}</span></p>
              <p style={styles.item}><span style={styles.itemLabel}>Dimensions</span><span style={styles.itemValue}>{details.dimensions}</span></p>
              <p style={styles.item}><span style={styles.itemLabel}>Insurance</span><span style={styles.itemValue}>${details.insuranceValue.toFixed(2)}</span></p>
              {details.specialHandling.length > 0 &&
                <p style={styles.item}><span style={styles.itemLabel}>Handling</span><span style={styles.itemValue}>{details.specialHandling.join(', ')}</span></p>
              }
            </div>
          </div>

          <div style={styles.barcodeSection}>
            <span style={styles.trackingIdText}>{details.id}</span>
            <DecorativeBarcode />
          </div>

          <div style={styles.footer}>
            Thank you for choosing IntelliTrack for your shipping needs!
          </div>
        </div>
      </div>
      <button 
        style={styles.printButton}
        className="print-hide"
        onClick={handlePrint}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
      >
        <Icon name="printer" />
        Print Receipt
      </button>
    </div>
  );
};

export default ShipmentReceipt;