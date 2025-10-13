import React from 'react';
import { TrackingEvent } from '../types';
// Fix: Import the IconName type from Icon.tsx
import Icon, { IconName } from './Icon';

const styles: { [key: string]: React.CSSProperties } = {
  item: {
    padding: '1rem',
    borderLeft: '3px solid #4b5563',
    position: 'relative',
    transition: 'background-color 0.3s ease',
    cursor: 'pointer',
    paddingLeft: '2.5rem',
  },
  activeItem: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderLeft: '3px solid #6366f1',
  },
  dot: {
    position: 'absolute',
    left: '-16px',
    top: '1.25rem',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#4b5563',
    border: '3px solid #1f2937',
    transition: 'background-color 0.3s, transform 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    backgroundColor: '#6366f1',
    transform: 'scale(1.1)',
  },
  date: {
    fontSize: '0.875rem',
    color: '#9ca3af',
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
    color: '#9ca3af',
  },
};

interface TimelineItemProps {
  event: TrackingEvent;
  isActive: boolean;
  onClick: () => void;
  itemRef: (el: HTMLDivElement | null) => void;
  // Fix: Use the correct IconName type for the iconName prop.
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
