

import React, { useState, useEffect } from 'react';
import { PackageDetails, TrackingEvent } from '../types';
import { getJourneyPath } from '../services/shipmentService';
import { generatePackageImage } from '../services/geminiService';
import ShipmentProgressBar from './ShipmentProgressBar';
import TimelineItem from './TimelineItem';
import Icon, { IconName } from './Icon';
import ShipmentActions from './ShipmentActions';
import MapVisualization from './MapVisualization';
import Loader from './Loader';
import ShipmentReceipt from './ShipmentReceipt';
import DeliveryVault from './DeliveryVault';
import ZenGarden from './ZenGarden';
import AIInsights from './AIInsights';


interface TrackingDisplayProps {
  packageDetails: PackageDetails;
  onNewSearch: () => void;
  onShowChat: (prompt: string) => void;
  setPackageDetails: React.Dispatch<React.SetStateAction<PackageDetails | null>>;
  onAddEvidence: (type: 'photo' | 'signature' | 'audio', data: string) => void;
}

type ActiveView = 'journey' | 'map' | 'receipt' | 'vault';

const getIconForStatus = (status: string): IconName => {
  const s = status.toLowerCase();
  if (s.includes('delivered')) return 'home';
  if (s.includes('out for delivery')) return 'truck';
  if (s.includes('arrived')) return 'warehouse';
  if (s.includes('departed')) return 'package';
  if (s.includes('picked up')) return 'flag';
  return 'check-circle';
};

const TrackingDisplay: React.FC<TrackingDisplayProps> = ({ packageDetails, onNewSearch, onShowChat, setPackageDetails, onAddEvidence }) => {
  const [activeView, setActiveView] = useState<ActiveView>('journey');
  const [isZenMode, setIsZenMode] = useState(false);
  const [packageImage, setPackageImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);


  const getContentsSummary = (details: PackageDetails): string => {
    if (!details.declaredItems || details.declaredItems.length === 0) return 'No items declared';
    const descriptions = details.declaredItems.map(item => item.description);
    return descriptions.join(', ');
  }
  
  useEffect(() => {
    const fetchImage = async () => {
        if (!packageDetails) return;
        setIsImageLoading(true);
        try {
            const summary = getContentsSummary(packageDetails);
            const imageUrl = await generatePackageImage(summary);
            setPackageImage(imageUrl);
        } catch (error) {
            console.error("Failed to generate package image:", error);
            setPackageImage(null); // Set to null to show an error state if needed
        } finally {
            setIsImageLoading(false);
        }
    };
    fetchImage();
  }, [packageDetails]);


  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateDaysRemaining = (deliveryDate: string): string | null => {
    if (packageDetails.status.toLowerCase() === 'delivered') {
        return 'Package has been delivered';
    }
    const today = new Date();
    const delivery = new Date(deliveryDate);
    today.setHours(0, 0, 0, 0);
    delivery.setHours(0, 0, 0, 0);

    if (delivery < today) {
        return 'Delivery is overdue';
    }

    const differenceInTime = delivery.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    if (differenceInDays === 0) {
        return "Arriving today";
    }
    if (differenceInDays === 1) {
        return "Arriving tomorrow";
    }
    return `${differenceInDays} days remaining`;
  };
  
  const getStatusBadgeClass = (status: string): string => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 'status-badge--delivered';
    if (s.includes('out for delivery')) return 'status-badge--delivery';
    return 'status-badge--transit';
  };

  const daysRemainingText = calculateDaysRemaining(packageDetails.estimatedDelivery);
  const journeyPath = getJourneyPath(packageDetails.history);

  const renderActiveView = () => {
    switch (activeView) {
      case 'map':
        return <MapVisualization path={journeyPath} activeLocation={packageDetails.history[0].location} />;
      case 'receipt':
        return <ShipmentReceipt details={packageDetails} />;
      case 'vault':
        return <DeliveryVault details={packageDetails} setPackageDetails={setPackageDetails} />;
      case 'journey':
      default:
        return (
          <div className="timeline-container">
            {packageDetails.history.map((event: TrackingEvent, index: number) => (
              <TimelineItem
                key={index}
                event={event}
                isLast={index === 0}
                icon={getIconForStatus(event.status)}
              />
            ))}
          </div>
        );
    }
  };

  const isDelivered = packageDetails.status.toLowerCase() === 'delivered';

  return (
    <div className="tracking-display-container">
      <header className="advanced-header-container">
          <video 
              id="header-video-bg"
              src="https://videos.pexels.com/video-files/853874/853874-hd_1920_1080_25fps.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
          ></video>
          <div className="header-video-overlay"></div>
          <div className="advanced-header-content">
              <div className="parcel-logo">
                  <span className="parcel-emoji" role="img" aria-label="package">📦</span>
                  <span>IntelliTrack</span>
              </div>
              <div className="tracking-id-main">
                  {packageDetails.id}
              </div>
              <div className="header-details-right">
                  <div className="verified-badge">
                      <Icon name="shield-check" />
                      <span>Verified Shipment</span>
                  </div>
                  <div className={`status-badge ${getStatusBadgeClass(packageDetails.status)}`}>
                      {packageDetails.status}
                  </div>
              </div>
          </div>
          <div className="tracking-display-header-actions">
            <div className="zen-mode-toggle" onClick={() => setIsZenMode(!isZenMode)}>
                <Icon name={isZenMode ? "zap-off" : "zap"} /> 
                <span>{isZenMode ? "Standard Mode" : "Zen Mode"}</span>
            </div>
            <button onClick={onNewSearch} className="new-search-button">
                <Icon name="edit-3" /> New Search
            </button>
          </div>
      </header>
      
      {!isZenMode && <ShipmentProgressBar status={packageDetails.status} history={packageDetails.history} />}

      <div className="tracking-body">
        <div className="main-content-panel">
          {isZenMode ? (
              <ZenGarden packageDetails={packageDetails} />
          ) : (
            <>
              <div className="view-selector" role="tablist" aria-label="Tracking Information Views">
                <button id="tab-journey" onClick={() => setActiveView('journey')} className={activeView === 'journey' ? 'active' : ''} role="tab" aria-selected={activeView === 'journey'} aria-controls="view-content-panel">Journey</button>
                <button id="tab-map" onClick={() => setActiveView('map')} className={activeView === 'map' ? 'active' : ''} role="tab" aria-selected={activeView === 'map'} aria-controls="view-content-panel">Map</button>
                <button id="tab-receipt" onClick={() => setActiveView('receipt')} className={activeView === 'receipt' ? 'active' : ''} role="tab" aria-selected={activeView === 'receipt'} aria-controls="view-content-panel">Receipt</button>
                {isDelivered && <button id="tab-vault" onClick={() => setActiveView('vault')} className={activeView === 'vault' ? 'active' : ''} role="tab" aria-selected={activeView === 'vault'} aria-controls="view-content-panel">Delivery Vault</button>}
              </div>
              <div id="view-content-panel" role="tabpanel" className="view-content" aria-labelledby={`tab-${activeView}`}>
                {renderActiveView()}
              </div>
            </>
          )}
        </div>
        
        <aside className="sidebar-panel">
          <div className={`package-image-container ${isImageLoading ? 'loading' : ''}`}>
             {isImageLoading ? (
                <div className="image-placeholder">
                    <Icon name="package" />
                    <span>Generating image...</span>
                </div>
            ) : packageImage ? (
                <img src={packageImage} alt="AI generated representation of package contents" className="package-image" />
            ) : (
                <div className="image-placeholder">
                    <Icon name="alert-triangle" />
                    <span>Image failed</span>
                </div>
            )}
            <h3>{getContentsSummary(packageDetails)}</h3>
          </div>

          <div className="delivery-date-container">
            <div className="delivery-date-icon">
              <Icon name="calendar" />
            </div>
            <div className="delivery-date-info">
              <h4>Estimated Delivery</h4>
              <p>{formatDate(packageDetails.estimatedDelivery)}</p>
              {daysRemainingText && <span>{daysRemainingText}</span>}
            </div>
          </div>
          
           {/* AI Insights Section */}
          <AIInsights history={packageDetails.history} />


          <div className="address-container">
            <div className="address-icon">
              <Icon name="flag" />
            </div>
            <div className="address-info">
              <h4>Shipped From</h4>
              <p>{packageDetails.origin.name}</p>
              <span>
                {packageDetails.origin.street}<br />
                {packageDetails.origin.cityStateZip}<br />
                {packageDetails.origin.country}
              </span>
            </div>
          </div>
          
           {/* Package Contents Details */}
          <section className="sidebar-section">
            <h4 className="sidebar-section-title">
              <Icon name="file-text" className="title-icon" />
              <span>Customs Declaration</span>
            </h4>
            <div className="sidebar-section-content">
              {packageDetails.declaredItems.map((item, index) => (
                <div key={index} className="declared-item-row">
                  <span className="item-desc">{item.quantity}x {item.description}</span>
                  <span className="item-value">${(item.quantity * item.value).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Services Details */}
          <section className="sidebar-section">
            <h4 className="sidebar-section-title">Additional Services</h4>
            <div className="sidebar-section-content">
              <div className="declared-item-row">
                <span className="item-desc">Insurance Coverage</span>
                <span className="item-value">${packageDetails.insuranceValue.toFixed(2)}</span>
              </div>
              {packageDetails.specialHandling.length > 0 && (
                <div className="declared-item-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span className="item-desc">Special Handling</span>
                  <div className="special-handling-tags">
                    {packageDetails.specialHandling.map(tag => <span key={tag} className="handling-tag">{tag}</span>)}
                  </div>
                </div>
              )}
            </div>
          </section>
          
          {/* Warranty & Security */}
          {packageDetails.advancedOptions && packageDetails.advancedOptions.length > 0 && (
            <section className="sidebar-section">
              <h4 className="sidebar-section-title">
                <Icon name="shield-check" className="title-icon" />
                <span>Warranty &amp; Security</span>
              </h4>
              <div className="sidebar-section-content">
                <div className="special-handling-tags">
                  {packageDetails.advancedOptions.map(tag => <span key={tag} className="handling-tag">{tag}</span>)}
                </div>
              </div>
            </section>
          )}


          <ShipmentActions packageDetails={packageDetails} onShowChat={onShowChat} onAddEvidence={onAddEvidence} />
        </aside>
      </div>
    </div>
  );
};

export default TrackingDisplay;