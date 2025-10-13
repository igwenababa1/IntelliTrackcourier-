import React from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  vehicleContainer: {
    position: 'absolute',
    width: '32px',
    height: '32px',
    willChange: 'transform, left, top',
    transition: 'left 0.8s ease-in-out, top 0.8s ease-in-out, transform 0.8s ease-in-out',
    zIndex: 20, // Ensure it's above the path but below tooltips/controls
  },
  vehicleSvg: {
    width: '100%',
    height: '100%',
    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
  },
  truckBody: {
    fill: '#4f46e5',
    stroke: '#c7d2fe',
    strokeWidth: '1.5px',
  },
  truckWindow: {
    fill: '#9ca3af',
  },
};

interface VehicleAnimationProps {
  position: { x: number; y: number };
  rotation: number;
}

const VehicleAnimation: React.FC<VehicleAnimationProps> = ({ position, rotation }) => {
  return (
    <div
      style={{
        ...styles.vehicleContainer,
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
      aria-label="Delivery vehicle location"
    >
      <svg viewBox="0 0 50 50" style={styles.vehicleSvg}>
        <g transform="rotate(90 25 25)">
          <path
            d="M43.5 31.5H38.5V25C38.5 24.3 38.2 23.6 37.8 23.1L33.3 17.5H29.5V11.5C29.5 10.4 28.6 9.5 27.5 9.5H9.5C8.4 9.5 7.5 10.4 7.5 11.5V31.5H6.5C5.4 31.5 4.5 32.4 4.5 33.5V36.5C4.5 37.6 5.4 38.5 6.5 38.5H11.5C12.6 38.5 13.5 37.6 13.5 36.5V35.5H29.5V36.5C29.5 37.6 30.4 38.5 31.5 38.5H43.5C44.6 38.5 45.5 37.6 45.5 36.5V33.5C45.5 32.4 44.6 31.5 43.5 31.5ZM11.5 35.5V34.5H9.5V35.5H11.5Z M25.5 12.5H26.5V18.5H13.5V12.5H25.5Z M33.5 35.5H31.5V34.5H33.5V35.5Z"
            style={styles.truckBody}
          />
          <path
            d="M25.5 13.5H14.5V17.5H25.5V13.5Z"
            style={styles.truckWindow}
          />
        </g>
      </svg>
    </div>
  );
};

export default VehicleAnimation;
