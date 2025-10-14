import React from 'react';
import useSound from '../hooks/useSound';
import { TRUCK_HONK_SOUND } from './sounds';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    overflow: 'hidden',
    backgroundImage: `url('https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    zIndex: 1,
  },
  truck: {
    position: 'absolute',
    bottom: '2%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '70%',
    maxWidth: '450px',
    height: 'auto',
    zIndex: 2,
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out, filter 0.2s ease-in-out',
  },
};

// This is a URL to a high-quality truck image with a transparent background.
const TRUCK_IMAGE_URL = 'https://storage.googleapis.com/aistudio-hosting/generative-ai-app-builder/prototypes/intellitrack/truck.png';

const TrackingBackground: React.FC = () => {
  const [playHonk] = useSound(TRUCK_HONK_SOUND, 0.6);
  const truckRef = React.useRef<HTMLImageElement>(null);

  const handleClick = () => {
    playHonk();
    // Provide a small visual "jiggle" on click for feedback
    if (truckRef.current) {
      truckRef.current.style.transform = 'translateX(-50%) scale(0.98)';
      setTimeout(() => {
        if (truckRef.current) {
          // Return to the hover state scale if still hovered, otherwise normal scale
           const isHovered = truckRef.current.matches(':hover');
           truckRef.current.style.transform = isHovered ? 'translateX(-50%) scale(1.02)' : 'translateX(-50%) scale(1)';
        }
      }, 150);
    }
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLImageElement>) => {
    e.currentTarget.style.transform = 'translateX(-50%) scale(1.02)';
    e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(165, 180, 252, 0.5))';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLImageElement>) => {
    e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
    e.currentTarget.style.filter = 'none';
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <img
        ref={truckRef}
        src={TRUCK_IMAGE_URL}
        alt="Delivery truck on a highway"
        style={styles.truck}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        title="Click me!"
        aria-label="Interactive delivery truck"
      />
    </div>
  );
};

export default TrackingBackground;
