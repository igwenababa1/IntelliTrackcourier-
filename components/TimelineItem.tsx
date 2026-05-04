import React, { useState } from 'react';
import { TrackingEvent } from '../types';
import Icon, { IconName } from './Icon';
import DeliveryConfirmation from './DeliveryConfirmation';

interface TimelineItemProps {
  event: TrackingEvent;
  isLast: boolean;
  icon: IconName;
  onViewStreet: (location: string) => void;
  onAddEvidence?: (type: 'photo' | 'signature' | 'audio', data: string) => void;
  hasEvidence?: boolean;
}

const styles: { [key: string]: React.CSSProperties } = {
  item: {
    display: 'flex',
    position: 'relative',
    paddingBottom: '2rem',
    paddingLeft: '2.5rem',
  },
  line: {
    position: 'absolute',
    left: '19px',
    top: '40px',
    bottom: 0,
    width: '2px',
    backgroundColor: 'var(--border-color)',
  },
  iconContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--card-bg-color)',
    border: '2px solid var(--border-color)',
  },
  content: {
    flex: 1,
  },
  status: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 0.25rem',
  },
  locationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    width: 'fit-content',
    padding: '2px 6px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  location: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
    margin: '0',
  },
  partner: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    margin: '0.25rem 0 0.5rem 0',
    fontWeight: 500,
  },
  partnerLabel: {
    fontWeight: 'normal',
    color: '#6b7280',
  },
  details: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
    margin: '0.5rem 0 0.25rem',
    paddingLeft: '1rem',
    borderLeft: '2px solid var(--border-color)',
    fontStyle: 'italic',
  },
  date: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
    marginTop: '0.5rem',
  },
};

const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLast, icon, onViewStreet, onAddEvidence, hasEvidence }) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const activeStyles: { [key: string]: React.CSSProperties } = isLast ? {
    iconContainer: {
      ...styles.iconContainer,
      borderColor: 'var(--primary-color)',
      color: 'var(--primary-color)',
    },
    status: {
      ...styles.status,
      color: 'white',
    },
    location: {
      ...styles.location,
      color: 'var(--text-color)',
    },
     partner: {
      ...styles.partner,
      color: 'var(--text-color)',
    },
    details: {
      ...styles.details,
      color: 'var(--text-color)',
      borderColor: 'var(--primary-color)',
    },
    date: {
      ...styles.date,
      color: 'var(--text-color)',
    }
  } : {};
  
  const handleLocationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewStreet(event.location);
  };
  
  const handleLocationHover = (e: React.MouseEvent<HTMLDivElement>, isHovering: boolean) => {
    e.currentTarget.style.backgroundColor = isHovering ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
  };

  const handleConfirmAction = (type: 'photo' | 'audio' | 'signature', data: string) => {
    if (onAddEvidence) {
      onAddEvidence(type, data);
    }
    setShowConfirmationModal(false);
  };

  return (
    <div style={styles.item}>
      {!isLast && <div style={styles.line}></div>}
      <div style={isLast ? activeStyles.iconContainer : styles.iconContainer}>
        <Icon name={icon} />
      </div>
      <div style={styles.content}>
        <h4 style={isLast ? activeStyles.status : styles.status}>{event.status}</h4>
        <div 
          style={styles.locationContainer} 
          onClick={handleLocationClick} 
          onMouseEnter={(e) => handleLocationHover(e, true)}
          onMouseLeave={(e) => handleLocationHover(e, false)}
          title="View location details"
          role="button"
          tabIndex={0}
        >
          <Icon name="map-pin" style={{ width: '16px', height: '16px', color: isLast ? 'var(--primary-color)' : 'var(--text-secondary-color)' }} />
          <p style={isLast ? activeStyles.location : styles.location}>{event.location}</p>
        </div>
        {event.partner && (
          <p style={isLast ? activeStyles.partner : styles.partner}>
            <span style={styles.partnerLabel}>Handled by: </span>{event.partner}
          </p>
        )}
        {event.details && (
          <p style={isLast ? activeStyles.details : styles.details}>{event.details}</p>
        )}
        <p style={isLast ? activeStyles.date : styles.date}>{event.date}</p>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', padding: '2px 6px', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: '#a5b4fc', borderRadius: '4px', border: '1px solid rgba(79, 70, 229, 0.3)', fontFamily: 'monospace', fontWeight: 500 }}>SCN-{Math.abs(event.status.length * 4821 + event.location.length * 133).toString(16).toUpperCase()}</span>
          <span style={{ fontSize: '0.65rem', padding: '2px 6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', fontFamily: 'monospace', fontWeight: 500 }}>TRM-{Math.abs(event.status.length * 5678).toString(16).toUpperCase()}-{(event.location.length * 28) % 99}</span>
          <span style={{ fontSize: '0.65rem', padding: '2px 6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)', fontFamily: 'monospace', fontWeight: 500 }}>GEO-{Math.abs((event.status.length+event.location.length)*42).toString().padStart(4, '0')}</span>
          {event.status.toLowerCase().includes('clear') && (
             <span style={{ fontSize: '0.65rem', padding: '2px 6px', backgroundColor: 'rgba(217, 70, 239, 0.15)', color: '#f0abfc', borderRadius: '4px', border: '1px solid rgba(217, 70, 239, 0.3)', fontFamily: 'monospace', fontWeight: 500 }}>CLR-DDP</span>
          )}
        </div>
        
        {isLast && onAddEvidence && !hasEvidence && event.status.toLowerCase().includes('out for delivery') && (
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => setShowConfirmationModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover-color)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
            >
              <Icon name="check-circle" style={{ width: '16px', height: '16px' }} />
              Confirm Delivery
            </button>
          </div>
        )}

        {showConfirmationModal && (
          <div className="confirmation-modal-overlay">
            <div className="confirmation-modal-content" style={{ maxWidth: '400px' }}>
              <button 
                className="confirmation-modal-close-button" 
                onClick={() => setShowConfirmationModal(false)}
              >
                <Icon name="close" />
              </button>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>Confirm Delivery</h2>
              <p style={{ color: 'var(--text-secondary-color)', marginBottom: '1.5rem' }}>Select a method to confirm your delivery.</p>
              <DeliveryConfirmation onConfirm={handleConfirmAction} />
            </div>
          </div>
        )}

        {isLast && hasEvidence && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--card-bg-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', maxWidth: '300px' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="check-circle" style={{ width: '16px', height: '16px' }} />
              Delivery Confirmed
            </h5>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary-color)' }}>Proof of delivery has been recorded. View details in the Delivery Vault.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineItem;