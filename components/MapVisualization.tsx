// Fix: Populate the contents of components/MapVisualization.tsx
import React from 'react';
import { TrackingEvent } from '../types';
import { getJourneyPath } from '../services/shipmentService';
import Icon from './Icon';

// This is a placeholder for a map component. In a real app, this would
// use a library like Google Maps, Mapbox, or Leaflet to draw a dynamic map.
// For this prototype, we'll use a static image and overlay journey info.

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    width: '100%',
    paddingTop: '60%', // Aspect ratio 5:3
    backgroundColor: '#334155',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  mapImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.7,
  },
  journeyInfo: {
    position: 'absolute',
    bottom: '1rem',
    left: '1rem',
    right: '1rem',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
  },
  path: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  city: {
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  arrow: {
    color: 'var(--primary-color)',
    fontSize: '1rem',
    lineHeight: 1,
  },
  disclaimer: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary-color)',
    marginTop: '1rem',
    textAlign: 'center',
  }
};

const MAP_IMAGE_URL = 'https://storage.googleapis.com/aistudio-hosting/generative-ai-app-builder/prototypes/intellitrack/world-map.svg';

interface MapVisualizationProps {
  history: TrackingEvent[];
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ history }) => {
  const journey = getJourneyPath(history);

  return (
    <div style={styles.container}>
      <img src={MAP_IMAGE_URL} alt="World map" style={styles.mapImage} />
      {journey.length > 0 && (
        <div style={styles.journeyInfo}>
          <div style={styles.path}>
            <span style={styles.city}>{journey[0].name}</span>
            {journey.slice(1).map(city => (
              <React.Fragment key={city.name}>
                <span style={styles.arrow}>&rarr;</span>
                <span style={styles.city}>{city.name}</span>
              </React.Fragment>
            ))}
          </div>
          <p style={styles.disclaimer}>*Route is for illustrative purposes only.</p>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;
