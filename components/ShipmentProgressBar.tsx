import React from 'react';
import Icon, { IconName } from './Icon';
import { TrackingEvent } from '../types';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    padding: '1rem 0',
  },
  stage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
    position: 'relative',
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px solid',
    transition: 'background-color 0.5s, border-color 0.5s',
    zIndex: 2,
    position: 'relative',
    backgroundColor: 'var(--background-color)',
  },
  stageLabel: {
    marginTop: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'color 0.5s',
  },
  lineContainer: {
    position: 'absolute',
    top: '20px',
    right: '50%',
    width: '100%',
    height: '2px',
    backgroundColor: 'var(--border-color)',
    zIndex: 1,
  },
  lineFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'var(--primary-color)',
    width: '0%',
    transition: 'width 0.5s ease-in-out',
  }
};

const STAGES: { name: string; icon: IconName; keywords: string[] }[] = [
  { name: 'Processing', icon: 'check-circle', keywords: ['picked up', 'processing'] },
  { name: 'Shipped', icon: 'package', keywords: ['departed'] },
  { name: 'In Transit', icon: 'warehouse', keywords: ['arrived at hub', 'arrived at local facility'] },
  { name: 'Out for Delivery', icon: 'truck', keywords: ['out for delivery'] },
  { name: 'Delivered', icon: 'home', keywords: ['delivered'] },
];

interface ShipmentProgressBarProps {
  status: string;
  history: TrackingEvent[];
}

const ShipmentProgressBar: React.FC<ShipmentProgressBarProps> = ({ status, history }) => {
  const getActiveStageIndex = () => {
    const lowerCaseStatus = status.toLowerCase();
    let activeIndex = -1;
    for (let i = STAGES.length - 1; i >= 0; i--) {
      if (STAGES[i].keywords.some(keyword => lowerCaseStatus.includes(keyword))) {
        activeIndex = i;
        break;
      }
    }
    // If no match found, check against historical events
    if (activeIndex === -1 && history.length > 0) {
        for (let i = STAGES.length - 1; i >= 0; i--) {
            if (history.some(h => STAGES[i].keywords.some(k => h.status.toLowerCase().includes(k)))) {
                return i;
            }
        }
    }
    return activeIndex;
  };

  const activeStageIndex = getActiveStageIndex();

  return (
    <div style={styles.container}>
      {STAGES.map((stage, index) => {
        const isCompleted = index < activeStageIndex;
        const isActive = index === activeStageIndex;

        const iconColor = (isCompleted || isActive) ? 'var(--primary-color)' : 'var(--border-color)';
        const labelColor = (isCompleted || isActive) ? 'var(--text-color)' : 'var(--text-secondary-color)';
        const iconFill = isCompleted ? 'var(--primary-color)' : 'transparent';
        const iconInnerColor = isCompleted ? 'white' : (isActive ? 'var(--primary-color)' : 'var(--text-secondary-color)');
        
        return (
          <div key={stage.name} style={styles.stage}>
            {index > 0 && (
                <div style={styles.lineContainer}>
                    <div style={{...styles.lineFill, width: isCompleted || isActive ? '100%' : '0%'}} />
                </div>
            )}
            <div style={{ ...styles.iconContainer, borderColor: iconColor, backgroundColor: iconFill }}>
              <Icon name={stage.icon} style={{ color: iconInnerColor }} />
            </div>
            <p style={{ ...styles.stageLabel, color: labelColor }}>{stage.name}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ShipmentProgressBar;