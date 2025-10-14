// Fix: Populate the contents of components/TrackingDisplay.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PackageDetails } from '../types';
import TimelineItem from './TimelineItem';
import Icon, { IconName } from './Icon';
import MapVisualization from './MapVisualization';
import ShipmentProgressBar from './ShipmentProgressBar';
import ShipmentReceipt from './ShipmentReceipt';
import DeliveryConfirmation from './DeliveryConfirmation';
import { generatePackageImage, generateCreativeDescription } from '../services/geminiService';
import Loader from './Loader';

interface TrackingDisplayProps {
  details: PackageDetails;
  onNewSearch: () => void;
}

const styles: { [key:string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '2rem',
  },
  mainContent: {
    gridColumn: '1 / span 12',
    lg: { gridColumn: '1 / span 8' },
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  sidebar: {
    gridColumn: '1 / span 12',
    lg: { gridColumn: '9 / span 4' },
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  card: {
    backgroundColor: 'var(--card-bg-color)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  trackingId: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'white',
  },
  newSearchButton: {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
  },
  statusSection: {
    textAlign: 'center',
    padding: '1.5rem',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  currentStatus: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--primary-color)',
    margin: '0 0 0.5rem 0',
  },
  deliveryDate: {
    fontSize: '1rem',
    color: 'var(--text-color)',
    margin: 0,
  },
  timelineContainer: {
    maxHeight: '500px',
    overflowY: 'auto',
    paddingRight: '1rem',
    marginRight: '-1rem'
  },
};

const getIconForStatus = (status: string): IconName => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 'home';
    if (s.includes('out for delivery')) return 'truck';
    if (s.includes('arrived at') || s.includes('processed')) return 'warehouse';
    if (s.includes('departed')) return 'package';
    return 'check-circle';
};

const TrackingDisplay: React.FC<TrackingDisplayProps> = ({ details, onNewSearch }) => {
  const [activeEventId, setActiveEventId] = useState<string>(details.history[0]?.date);
  const [packageImage, setPackageImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [creativeDesc, setCreativeDesc] = useState('');
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, details.history.length);
  }, [details.history]);

  useEffect(() => {
    const activeIndex = details.history.findIndex(event => event.date === activeEventId);
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeEventId, details.history]);

  useEffect(() => {
    const fetchGenerativeAssets = async () => {
      setImageLoading(true);
      try {
        const [img, desc] = await Promise.all([
          generatePackageImage(details.contents),
          generateCreativeDescription(details.contents)
        ]);
        setPackageImage(img);
        setCreativeDesc(desc);
      } catch (error) {
        console.error("Failed to generate assets:", error);
        // Fallback or error state can be handled here
      } finally {
        setImageLoading(false);
      }
    };
    fetchGenerativeAssets();
  }, [details.contents]);
  
  const handleConfirmation = (type: 'photo' | 'audio' | 'signature', data: string) => {
    console.log(`Delivery confirmed with ${type}. Data length: ${data.length}`);
    alert(`Delivery confirmation received via ${type}!`);
  };

  const isDelivered = details.status.toLowerCase() === 'delivered';

  return (
    <div style={styles.container} className="tracking-display-grid">
      <main style={styles.mainContent} className="tracking-main-content">
        <div style={styles.card}>
            <div style={styles.header}>
                <h2 style={styles.trackingId}>Tracking ID: {details.id}</h2>
                <button 
                  style={styles.newSearchButton} 
                  onClick={onNewSearch}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--border-color)'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
                >
                  New Search
                </button>
            </div>
            <div style={styles.statusSection}>
                <h3 style={styles.currentStatus}>{details.status}</h3>
                <p style={styles.deliveryDate}>
                  {isDelivered ? `Delivered on ${details.history[0].date}` : `Estimated Delivery: ${details.estimatedDelivery}`}
                </p>
            </div>
            <ShipmentProgressBar status={details.status} history={details.history} />
        </div>

        <div style={{...styles.card, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{color: 'white', marginTop: 0}}>Shipment Journey</h3>
            <div style={styles.timelineContainer}>
                {details.history.map((event, index) => (
                    <TimelineItem
                        key={event.date}
                        event={event}
                        isActive={event.date === activeEventId}
                        onClick={() => setActiveEventId(event.date)}
                        itemRef={el => itemRefs.current[index] = el}
                        iconName={getIconForStatus(event.status)}
                    />
                ))}
            </div>
        </div>
        
        {isDelivered && (
          <div style={styles.card}>
            <h3 style={{color: 'white', marginTop: 0}}>Confirm Delivery</h3>
            <p style={{color: 'var(--text-secondary-color)', marginTop: 0, marginBottom: '1.5rem'}}>Please provide a confirmation for your records.</p>
            <DeliveryConfirmation onConfirm={handleConfirmation} />
          </div>
        )}

      </main>
      <aside style={styles.sidebar} className="tracking-sidebar">
        <div style={styles.card}>
            <h3 style={{ color: 'white', marginTop: 0 }}>Package Contents</h3>
            {imageLoading ? <Loader /> : (
              packageImage && <img src={packageImage} alt="Generated view of package contents" style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }} />
            )}
            <p style={{ color: 'var(--text-color)', fontWeight: 600, fontSize: '1.1rem' }}>{details.contents}</p>
            <p style={{ color: 'var(--text-secondary-color)', fontStyle: 'italic', marginTop: 0 }}>"{creativeDesc}"</p>
        </div>
        <div style={styles.card}>
            <h3 style={{color: 'white', marginTop: 0}}>Shipment Details</h3>
            <ShipmentReceipt details={details} />
        </div>
        <div style={styles.card}>
            <h3 style={{color: 'white', marginTop: 0}}>Live Journey Map</h3>
            <MapVisualization history={details.history} />
        </div>
      </aside>
    </div>
  );
};

export default TrackingDisplay;
