
import React, { useState } from 'react';
import { PackageDetails } from '../types';
import Icon from './Icon';
import ShippingLabel from './ShippingLabel';
import ARView from './ARView';

interface ShipmentActionsProps {
  packageDetails: PackageDetails;
  onShowChat: (prompt: string) => void;
}

/**
 * Renders action buttons for a shipment, such as viewing labels, AR, and confirming delivery.
 */
const ShipmentActions: React.FC<ShipmentActionsProps> = ({ packageDetails, onShowChat }) => {
  const [isLabelVisible, setIsLabelVisible] = useState(false);
  const [isARVisible, setIsARVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleHoldAtLocation = () => {
    showToast('Success: Your package will be held at the nearest facility for pickup.');
    onShowChat(`I have requested to hold my package (${packageDetails.id}) at the nearest secure facility.`);
  };

  const handleDeliveryInstructions = () => {
    showToast('Delivery instructions updated: Drop at front door.');
    onShowChat(`I've updated the delivery instructions for my package (${packageDetails.id}) to: Leave at front door.`);
  };

  const handleChangeDate = () => {
    showToast('Delivery rescheduled for the next available business day.');
    onShowChat(`I need to reschedule the delivery for package ${packageDetails.id} to another day.`);
  };

  return (
    <>
      <div className="shipment-actions-container" style={{
        backgroundColor: 'var(--card-bg-color)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginTop: '1.5rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)'
      }}>
        <h3 className="shipment-actions-title" style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: 'var(--text-color)'
        }}>Manage Delivery</h3>
        <div className="shipment-actions-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '1rem'
        }}>
          <button
            className="shipment-action-button"
            onClick={handleChangeDate}
            style={actionButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={iconWrapperStyle('var(--primary-color)')}>
              <Icon name="calendar" />
            </div>
            <span style={actionLabelStyle}>Reschedule Date</span>
          </button>
          
          <button
            className="shipment-action-button"
            onClick={handleHoldAtLocation}
            style={actionButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={iconWrapperStyle('#f39c12')}>
              <Icon name="home" />
            </div>
            <span style={actionLabelStyle}>Hold at Location</span>
          </button>

          <button
            className="shipment-action-button"
            onClick={handleDeliveryInstructions}
            style={actionButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={iconWrapperStyle('#27ae60')}>
              <Icon name="message-square" />
            </div>
            <span style={actionLabelStyle}>Instructions</span>
          </button>

          <button
            className="shipment-action-button"
            onClick={() => setIsLabelVisible(true)}
            style={actionButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={iconWrapperStyle('#8e44ad')}>
              <Icon name="printer" />
            </div>
            <span style={actionLabelStyle}>Print Label</span>
          </button>

          <button
            className="shipment-action-button"
            onClick={() => setIsARVisible(true)}
            style={actionButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={iconWrapperStyle('#e74c3c')}>
              <Icon name="camera" />
            </div>
            <span style={actionLabelStyle}>View in AR</span>
          </button>

          <button
            className="shipment-action-button"
            onClick={() => onShowChat(`I have an issue with shipment ${packageDetails.id} that I'd like to report.`)}
            style={actionButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={iconWrapperStyle('#e67e22')}>
              <Icon name="alert-circle" />
            </div>
            <span style={actionLabelStyle}>Report Issue</span>
          </button>
        </div>
      </div>

      {isLabelVisible && <ShippingLabel details={packageDetails} onClose={() => setIsLabelVisible(false)} />}
      {isARVisible && <ARView onClose={() => setIsARVisible(false)} />}

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '50px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 1000,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <Icon name="check-circle" />
          {toastMessage}
        </div>
      )}
    </>
  );
};

const actionButtonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  padding: '1.25rem 0.5rem',
  backgroundColor: 'var(--bg-color)',
  border: '1px solid var(--border-color)',
  borderRadius: '0.75rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
};

const iconWrapperStyle = (color: string): React.CSSProperties => ({
  backgroundColor: `${color}15`,
  color: color,
  padding: '0.75rem',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const actionLabelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--text-color)',
  textAlign: 'center',
  lineHeight: '1.2'
};

export default ShipmentActions;
