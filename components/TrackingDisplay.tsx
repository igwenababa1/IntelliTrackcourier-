import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { PackageDetails } from '../types';
import { generatePackageImage } from '../services/geminiService';
import MapVisualization from './MapVisualization';
import TimelineItem from './TimelineItem';
import useSound from '../hooks/useSound';
import Icon, { IconName } from './Icon';
import { CONFIRM_SOUND } from './sounds';
import ShippingLabel from './ShippingLabel';
import ARView from './ARView';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    animation: 'fadeIn 0.5s ease-in-out',
    color: '#e5e7eb',
    textAlign: 'left',
  },
  header: {
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #374151',
  },
  trackingId: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'white',
    margin: 0,
  },
  infoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginTop: '0.75rem',
  },
  statusContainer: {
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: '9999px',
    border: '1px solid rgba(52, 211, 153, 0.3)',
  },
  status: {
    fontSize: '1.25rem',
    color: '#86efac',
    fontWeight: 600,
    margin: 0,
  },
  etaContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#1f2937',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
  },
  etaIcon: {
    width: '20px',
    height: '20px',
    color: '#9ca3af',
  },
  etaText: {
    fontSize: '1rem',
    color: '#d1d5db',
    fontWeight: 500,
    margin: 0,
  },
  actionsContainer: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    fontWeight: 500,
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s, transform 0.1s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  fullWidthCard: {
    gridColumn: '1 / -1',
    backgroundColor: '#1f2937',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  journeyContainer: {
    display: 'grid',
    gridTemplateColumns: '35% 1fr',
    gap: '1.5rem',
    minHeight: '400px',
  },
  timeline: {
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '1rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '1rem',
    borderBottom: '1px solid #374151',
    paddingBottom: '0.75rem',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingBottom: '100%', // For 1:1 aspect ratio
    borderRadius: '0.5rem',
    overflow: 'hidden',
    backgroundColor: '#374151',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.2)',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#9ca3af',
    fontWeight: 500,
  },
  errorText: {
    color: '#f87171',
    fontWeight: 500,
    textAlign: 'center',
  },
   radioOption: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  radioButton: {
    marginRight: '0.75rem',
    accentColor: '#4f46e5',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  radioLabel: {
    fontSize: '1rem',
    cursor: 'pointer',
  },
  confirmButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%',
  },
  confirmationText: {
    marginTop: '1rem',
    color: '#86efac',
    textAlign: 'center',
    fontWeight: 500,
  },
  detailText: {
    margin: '0.5rem 0',
    color: '#d1d5db'
  }
};

interface TrackingDisplayProps {
  details: PackageDetails;
}

export interface TrackingDisplayHandle {
  scrollToDetails: () => void;
}

const getIconForStatus = (status: string): IconName => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('delivered')) return 'home';
    if (lowerStatus.includes('out for delivery') || lowerStatus.includes('departed')) return 'truck';
    if (lowerStatus.includes('picked up')) return 'package';
    if (lowerStatus.includes('arrived') || lowerStatus.includes('processing')) return 'warehouse';
    return 'package'; // Default icon
};

const TrackingDisplay = forwardRef<TrackingDisplayHandle, TrackingDisplayProps>(({ details }, ref) => {
  const [packageImage, setPackageImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(details.history.length - 1);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>(details.deliveryPreference);
  const [confirmationMessage, setConfirmationMessage] = useState<string>('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isLabelVisible, setIsLabelVisible] = useState(false);
  const [isARViewVisible, setIsARViewVisible] = useState(false);

  
  const [playConfirmSound] = useSound(CONFIRM_SOUND, 0.5);
  
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailsCardRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToDetails: () => {
      detailsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      detailsCardRef.current?.classList.add('highlight');
      setTimeout(() => {
        detailsCardRef.current?.classList.remove('highlight');
      }, 1500);
    },
  }));

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      setIsImageLoading(true);
      setImageError(null);
      try {
        const imageUrl = await generatePackageImage(details.contents);
        if (isMounted) {
          setPackageImage(imageUrl);
        }
      } catch (error) {
        if (isMounted) {
          setImageError('Image Unavailable');
        }
      } finally {
        if (isMounted) {
          setIsImageLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [details.contents]);

  useEffect(() => {
    if (activeEventIndex !== null && itemRefs.current[activeEventIndex]) {
      itemRefs.current[activeEventIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeEventIndex]);

  useEffect(() => {
    setActiveEventIndex(details.history.length - 1);
  }, [details.history]);

  const handleConfirmDelivery = () => {
    playConfirmSound();
    setConfirmationMessage(`Preference updated to "${selectedDeliveryOption}"!`);
    setTimeout(() => setConfirmationMessage(''), 3000);
  };
  
  const handleButtonInteraction = (e: React.MouseEvent<HTMLButtonElement>, action: 'over' | 'out' | 'down' | 'up') => {
    const target = e.currentTarget;
    if (action === 'over') {
        target.style.backgroundColor = '#4b5563';
        target.style.borderColor = '#6366f1';
    } else if (action === 'out') {
        target.style.backgroundColor = '#374151';
        target.style.borderColor = '#4b5563';
        target.style.transform = 'scale(1)';
    } else if (action === 'down') {
        target.style.transform = 'scale(0.95)';
    } else if (action === 'up') {
        target.style.transform = 'scale(1)';
    }
  };


  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .timeline-scrollbar::-webkit-scrollbar { width: 6px; }
        .timeline-scrollbar::-webkit-scrollbar-track { background: #374151; border-radius: 3px; }
        .timeline-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
        .timeline-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
        .timeline-dot-icon svg { width: 14px; height: 14px; color: #1f2937; }
      `}</style>
      <header style={styles.header}>
        <h1 style={styles.trackingId}>Tracking ID: {details.id}</h1>
        <div style={styles.infoHeader}>
            <div style={{...styles.statusContainer, flexShrink: 0}} className={details.status !== 'Delivered' ? 'status-pulse' : ''}>
                <p style={styles.status}>{details.status}</p>
            </div>
            <div style={{...styles.etaContainer, flexShrink: 0}}>
                <Icon name="calendar" style={styles.etaIcon} />
                <p style={styles.etaText}>Est: {details.estimatedDelivery}</p>
            </div>
            <div style={{...styles.actionsContainer, marginLeft: 'auto'}}>
                 <button
                  onClick={() => setIsARViewVisible(true)}
                  style={styles.actionButton}
                  onMouseOver={(e) => handleButtonInteraction(e, 'over')}
                  onMouseOut={(e) => handleButtonInteraction(e, 'out')}
                  onMouseDown={(e) => handleButtonInteraction(e, 'down')}
                  onMouseUp={(e) => handleButtonInteraction(e, 'up')}
                  title="View in AR"
                >
                  <Icon name="camera" style={{width: '20px', height: '20px'}}/>
                  <span>View in AR</span>
                </button>
                <button
                  onClick={() => setIsLabelVisible(true)}
                  style={styles.actionButton}
                  onMouseOver={(e) => handleButtonInteraction(e, 'over')}
                  onMouseOut={(e) => handleButtonInteraction(e, 'out')}
                  onMouseDown={(e) => handleButtonInteraction(e, 'down')}
                  onMouseUp={(e) => handleButtonInteraction(e, 'up')}
                  title="Generate Shipping Label"
                >
                  <Icon name="printer" style={{width: '20px', height: '20px'}}/>
                  <span>Generate Label</span>
                </button>
            </div>
        </div>
      </header>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Package Contents</h2>
          <div style={styles.imageContainer}>
            <div className={`flip-card ${isCardFlipped ? 'flipped' : ''}`} onClick={() => setIsCardFlipped(!isCardFlipped)}>
              <div className="flip-card-inner">
                <div className="flip-card-front">
                   {isImageLoading ? (
                    <div style={styles.loadingContainer}>
                      <div style={styles.spinner}></div>
                      <p style={styles.loadingText}>Generating Image...</p>
                    </div>
                  ) : imageError ? (
                     <div style={styles.loadingContainer}>
                       <p style={styles.errorText}>{imageError}</p>
                     </div>
                  ) : (
                    <img src={packageImage!} alt="Generated image of package contents" style={styles.image} />
                  )}
                </div>
                <div className="flip-card-back">
                  <p style={{...styles.detailText, textAlign: 'center'}}>{details.contents}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={styles.card} ref={detailsCardRef}>
            <h2 style={styles.cardTitle}>Shipment Details</h2>
            <p style={styles.detailText}>
              <strong>From:</strong> 
              <span className="clickable-detail" onClick={() => setActiveEventIndex(0)}> {details.origin.cityStateZip}</span>
            </p>
            <p style={styles.detailText}>
              <strong>To:</strong> 
              <span className="clickable-detail" onClick={() => setActiveEventIndex(details.history.length - 1)}> {details.destination.cityStateZip}</span>
            </p>
            <p style={{...styles.detailText, marginTop: '1rem'}}>
              <strong>Contents:</strong> {details.contents}
            </p>
        </div>
         <div style={styles.card}>
            <h2 style={styles.cardTitle}>Delivery Options</h2>
            <div>
              {details.availableDeliveryOptions.map((option) => (
                <div key={option} style={styles.radioOption}>
                  <input
                    type="radio"
                    id={`option-${option}`}
                    name="deliveryOption"
                    value={option}
                    checked={selectedDeliveryOption === option}
                    onChange={() => setSelectedDeliveryOption(option)}
                    style={styles.radioButton}
                  />
                  <label htmlFor={`option-${option}`} style={styles.radioLabel}>{option}</label>
                </div>
              ))}
            </div>
            <button 
              onClick={handleConfirmDelivery} 
              style={styles.confirmButton}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#6366f1')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              Confirm Choice
            </button>
            {confirmationMessage && <p style={styles.confirmationText}>{confirmationMessage}</p>}
        </div>
        <div style={styles.fullWidthCard}>
            <h2 style={styles.cardTitle}>Package Journey</h2>
            <div style={styles.journeyContainer}>
              <div style={styles.timeline} className="timeline-scrollbar">
                {details.history.map((event, index) => {
                  const iconName = getIconForStatus(event.status);
                  return (
                    <TimelineItem
                      key={index}
                      event={event}
                      iconName={iconName}
                      isActive={index === activeEventIndex}
                      onClick={() => setActiveEventIndex(index)}
                      itemRef={(el) => (itemRefs.current[index] = el)}
                    />
                  );
                })}
              </div>
              <MapVisualization 
                history={details.history} 
                activeEventIndex={activeEventIndex}
                onPointClick={setActiveEventIndex}
              />
            </div>
        </div>
      </div>
      {isLabelVisible && <ShippingLabel details={details} onClose={() => setIsLabelVisible(false)} />}
      {isARViewVisible && <ARView onClose={() => setIsARViewVisible(false)} />}
    </div>
  );
});

export default TrackingDisplay;