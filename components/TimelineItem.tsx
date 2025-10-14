import React from 'react';
import { TrackingEvent } from '../types';
import Icon, { IconName } from './Icon';

const styles: { [key: string]: React.CSSProperties } = {
  item: {
    padding: '1rem',
    borderLeft: '3px solid var(--border-color)',
    position: 'relative',
    transition: 'background-color 0.3s ease',
    cursor: 'pointer',
    paddingLeft: '2.5rem',
  },
  activeItem: {
    backgroundColor: 'rgba(88, 86, 214, 0.1)',
    borderLeft: '3px solid var(--primary-color)',
  },
  dot: {
    position: 'absolute',
    left: '-16px',
    top: '1.25rem',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--border-color)',
    border: '3px solid var(--background-color)',
    transition: 'background-color 0.3s, transform 0.3s, box-shadow 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary-color)',
  },
  activeDot: {
    backgroundColor: 'var(--primary-color)',
    transform: 'scale(1.1)',
    color: 'white',
    boxShadow: '0 0 12px var(--glow-color)',
  },
  date: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
    fontWeight: 500,
    marginBottom: '0.25rem',
  },
  status: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '0.25rem',
  },
  location: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
  },
};

interface TimelineItemProps {
  event: TrackingEvent;
  isActive: boolean;
  onClick: () => void;
  itemRef: (el: HTMLDivElement | null) => void;
  iconName: IconName;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, isActive, onClick, itemRef, iconName }) => {
  return (
    <div
      ref={itemRef}
      style={{ ...styles.item, ...(isActive ? styles.activeItem : {}) }}
      onClick={onClick}
    >
      <div style={{ ...styles.dot, ...(isActive ? styles.activeDot : {}) }}>
          <Icon name={iconName} className="timeline-dot-icon" />
      </div>
      <p style={styles.date}>{event.date}</p>
      <h3 style={styles.status}>{event.status}</h3>
      <p style={styles.location}>{event.location}</p>
    </div>
  );
};

export default TimelineItem;