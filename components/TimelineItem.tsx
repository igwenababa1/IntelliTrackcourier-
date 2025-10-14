import React from 'react';
import { TrackingEvent } from '../types';
import Icon, { IconName } from './Icon';

interface TimelineItemProps {
  event: TrackingEvent;
  isLast: boolean;
  icon: IconName;
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

const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLast, icon }) => {
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

  return (
    <div style={styles.item}>
      {!isLast && <div style={styles.line}></div>}
      <div style={isLast ? activeStyles.iconContainer : styles.iconContainer}>
        <Icon name={icon} />
      </div>
      <div style={styles.content}>
        <h4 style={isLast ? activeStyles.status : styles.status}>{event.status}</h4>
        <p style={isLast ? activeStyles.location : styles.location}>{event.location}</p>
        {event.partner && (
          <p style={isLast ? activeStyles.partner : styles.partner}>
            <span style={styles.partnerLabel}>Handled by: </span>{event.partner}
          </p>
        )}
        {event.details && (
          <p style={isLast ? activeStyles.details : styles.details}>{event.details}</p>
        )}
        <p style={isLast ? activeStyles.date : styles.date}>{event.date}</p>
      </div>
    </div>
  );
};

export default TimelineItem;