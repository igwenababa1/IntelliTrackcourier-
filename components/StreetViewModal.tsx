import React from 'react';
import Icon from './Icon';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationData: {
    name: string;
    imageUrl: string;
  };
}

const StreetViewModal: React.FC<StreetViewModalProps> = ({ isOpen, onClose, locationData }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="street-view-overlay" onClick={onClose}>
      <img src={locationData.imageUrl} alt={`Simulated view of ${locationData.name}`} className="street-view-image" />
      <div className="street-view-vignette"></div>
      
      <button className="street-view-close" onClick={onClose} aria-label="Close Street View">
        <Icon name="close" />
      </button>

      <div className="street-view-content">
        <h2 className="street-view-title">{locationData.name}</h2>
        <p className="street-view-subtitle">Live Waypoint Visualization</p>
      </div>

      <div className="street-view-disclaimer">
        Simulated View
      </div>
    </div>
  );
};

export default StreetViewModal;