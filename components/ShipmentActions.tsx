
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

  return (
    <>
      <div className="shipment-actions-container">
        <h3 className="shipment-actions-title">Manage Shipment</h3>
        <div className="shipment-actions-grid">
          <button
            className="shipment-action-button"
            onClick={() => setIsLabelVisible(true)}
          >
            <Icon name="printer" />
            <span>Shipping Label</span>
          </button>
          <button
            className="shipment-action-button"
            onClick={() => onShowChat(`I have a question about my shipment, ${packageDetails.id}.`)}
          >
            <Icon name="edit-3" />
            <span>Ask Assistant</span>
          </button>
          <button
            className="shipment-action-button"
            onClick={() => setIsARVisible(true)}
          >
            <Icon name="camera" />
            <span>View in AR</span>
          </button>
        </div>
      </div>

      {isLabelVisible && <ShippingLabel details={packageDetails} onClose={() => setIsLabelVisible(false)} />}
      {isARVisible && <ARView onClose={() => setIsARVisible(false)} />}
    </>
  );
};

export default ShipmentActions;
