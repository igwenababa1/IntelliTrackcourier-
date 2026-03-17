import React from 'react';
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
        
        {isLast && onAddEvidence && !hasEvidence && (event.status.toLowerCase().includes('out for delivery') || event.status.toLowerCase().includes('delivered')) && (
          <div style={{ marginTop: '1rem', maxWidth: '300px' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>Confirm Delivery</h5>
            <DeliveryConfirmation onConfirm={onAddEvidence} />
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