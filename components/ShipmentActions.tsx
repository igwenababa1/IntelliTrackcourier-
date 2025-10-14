import React, { useState } from 'react';
import { PackageDetails } from '../types';
import Icon from './Icon';
import ShippingLabel from './ShippingLabel';
import ARView from './ARView';
import DeliveryConfirmation from './DeliveryConfirmation';

interface ShipmentActionsProps {
  packageDetails: PackageDetails;
  onShowChat: (prompt: string) => void;
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
    borderRadius: '0.75rem',
    border: '1px solid var(--border-color)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  buttonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    backgroundColor: '#21262d',
    color: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
};

/**
 * Renders action buttons for a shipment, such as viewing labels, AR, and confirming delivery.
 */
const ShipmentActions: React.FC<ShipmentActionsProps> = ({ packageDetails, onShowChat }) => {
  const [isLabelVisible, setIsLabelVisible] = useState(false);
  const [isARVisible, setIsARVisible] = useState(false);

  const handleDeliveryConfirm = (type: 'photo' | 'audio' | 'signature', data: string) => {
    console.log(`Delivery confirmed with ${type}. Data length: ${data.length}`);
    onShowChat(`I've just provided a ${type} confirmation for the delivery of package ${packageDetails.id}. Please add this to the record.`);
  };

  const isDelivered = packageDetails.status.toLowerCase() === 'delivered';

  return (
    <>
      <div style={styles.container}>
        <h3 style={styles.title}>Manage Shipment</h3>
        <div style={styles.buttonsGrid}>
          <button
            style={styles.button}
            onClick={() => setIsLabelVisible(true)}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#30363d'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#21262d'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <Icon name="printer" />
            <span>Shipping Label</span>
          </button>
          <button
            style={styles.button}
            onClick={() => onShowChat(`I have a question about my shipment, ${packageDetails.id}.`)}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#30363d'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#21262d'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <Icon name="edit-3" />
            <span>Ask Assistant</span>
          </button>
          <button
            style={styles.button}
            onClick={() => setIsARVisible(true)}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#30363d'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#21262d'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <Icon name="camera" />
            <span>View in AR</span>
          </button>
        </div>
        
        {isDelivered && (
          <div style={{ marginTop: '1.5rem' }}>
             <h3 style={styles.title}>Confirm Delivery</h3>
             <DeliveryConfirmation onConfirm={handleDeliveryConfirm} />
          </div>
        )}
      </div>

      {isLabelVisible && <ShippingLabel details={packageDetails} onClose={() => setIsLabelVisible(false)} />}
      {isARVisible && <ARView onClose={() => setIsARVisible(false)} />}
    </>
  );
};

export default ShipmentActions;