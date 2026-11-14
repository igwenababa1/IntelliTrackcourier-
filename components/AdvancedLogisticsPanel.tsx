import React, { useState, useEffect } from 'react';
import { PackageDetails } from '../types';
import Icon from './Icon';

interface AdvancedLogisticsPanelProps {
  details: PackageDetails;
}

const AdvancedLogisticsPanel: React.FC<AdvancedLogisticsPanelProps> = ({ details }) => {
  const calculateEta = () => {
    const now = new Date();
    const deliveryTime = new Date(now);
    // Set a specific daily reset time (e.g., 20:00 / 8:00 PM)
    deliveryTime.setHours(20, 0, 0, 0);

    if (now.getTime() > deliveryTime.getTime()) {
      // Reset for the next day's delivery window
      deliveryTime.setDate(deliveryTime.getDate() + 1);
    }

    const diffMs = deliveryTime.getTime() - now.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  };

  const [pinCode, setPinCode] = useState<string>('');
  const [etaMinutes, setEtaMinutes] = useState<number>(calculateEta());
  const [carbonOffset, setCarbonOffset] = useState<boolean>(false);

  useEffect(() => {
    // Generate a random 4-digit PIN based on the package ID
    const hash = details.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    setPinCode((hash % 9000 + 1000).toString());

    // Update ETA based on the real-world daily specific time, not an indefinite countdown
    if (details.status.toLowerCase().includes('out for delivery')) {
      // Update immediately
      setEtaMinutes(calculateEta());
      const interval = setInterval(() => {
        setEtaMinutes(calculateEta());
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [details.id, details.status]);

  const isOutForDelivery = details.status.toLowerCase().includes('out for delivery');
  const isDelivered = details.status.toLowerCase().includes('delivered');

  return (
    <div className="advanced-logistics-panel">
      {/* Live Driver Tracking Simulation */}
      {isOutForDelivery && (
        <div className="logistics-card driver-tracking">
          <div className="card-header">
            <Icon name="truck" />
            <h3>Live Delivery Status</h3>
          </div>
          <div className="driver-info">
            <div className="driver-avatar">
              <img src="https://i.pravatar.cc/150?u=driver1" alt="Driver" />
            </div>
            <div className="driver-details">
              <h4>Alex Johnson</h4>
              <p>Courier • 4.9 ★</p>
              <p className="vehicle-info">White Ford Transit • XYZ-123</p>
            </div>
            <div className="eta-badge">
              <span className="eta-time">
                {etaMinutes >= 60 ? `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m` : etaMinutes}
              </span>
              <span className="eta-label">
                {etaMinutes >= 60 ? 'away' : 'mins away'}
              </span>
            </div>
          </div>
          <div className="live-map-placeholder">
            <div className="pulsing-dot"></div>
            <div className="route-line"></div>
            <Icon name="home" className="destination-icon" />
          </div>
        </div>
      )}

      {/* Secure Delivery PIN */}
      {!isDelivered && (
        <div className="logistics-card secure-pin">
          <div className="card-header">
            <Icon name="lock" />
            <h3>Secure Delivery PIN</h3>
          </div>
          <p className="pin-description">Provide this PIN to the driver to receive your package.</p>
          <div className="pin-display">
            {pinCode.split('').map((digit, index) => (
              <span key={index} className="pin-digit">{digit}</span>
            ))}
          </div>
        </div>
      )}

      {/* Package Specifications */}
      <div className="logistics-card package-specs">
        <div className="card-header">
          <Icon name="box" />
          <h3>Package Specifications</h3>
        </div>
        <div className="specs-grid">
          <div className="spec-item">
            <span className="spec-label">Weight</span>
            <span className="spec-value">{details.weight}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Dimensions</span>
            <span className="spec-value">{details.dimensions}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Service</span>
            <span className="spec-value">{details.service}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Value</span>
            <span className="spec-value">${details.insuranceValue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Global Customs Clearance */}
      <div className="logistics-card customs-clearance">
        <div className="card-header">
          <Icon name="globe-check" />
          <h3>Global Customs Clearance</h3>
        </div>
        <div className="customs-status">
          <div className="status-indicator cleared"></div>
          <div className="status-text">
            <h4>Pre-Cleared for Destination</h4>
            <p>All commercial invoices and electronic trade documents have been verified. No delays expected at border crossing.</p>
          </div>
        </div>
        <div className="customs-details">
          <div className="detail-row">
            <span>HS Code:</span>
            <strong>8517.62.00</strong>
          </div>
          <div className="detail-row">
            <span>Duties & Taxes:</span>
            <strong>Paid (DDP)</strong>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="logistics-card eco-impact">
        <div className="card-header">
          <Icon name="leaf" />
          <h3>Environmental Impact</h3>
        </div>
        <div className="eco-content">
          <div className="carbon-stats">
            <div className="stat">
              <span className="stat-value">2.4</span>
              <span className="stat-label">kg CO₂e</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">450</span>
              <span className="stat-label">Miles</span>
            </div>
          </div>
          <div className="offset-toggle">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={carbonOffset} 
                onChange={(e) => setCarbonOffset(e.target.checked)} 
              />
              <span className="toggle-slider"></span>
              Offset carbon footprint ($0.50)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedLogisticsPanel;
