// Fix: Removed erroneous file content markers from the start and end of the file.
import React, { useState } from 'react';
import { TrackingEvent } from '../types';
import VehicleAnimation from './VehicleAnimation';

const styles: { [key: string]: React.CSSProperties } = {
  mapContainer: {
    width: '100%',
    height: '100%',
    minHeight: '350px',
    backgroundColor: '#374151',
    borderRadius: '0.5rem',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid #4b5563',
  },
  path: {
    stroke: '#6366f1',
    strokeDasharray: '2, 2',
    fill: 'none',
    pointerEvents: 'none', // Visual path doesn't capture events
    transition: 'stroke-width 0.2s ease-in-out',
  },
  point: {
    cursor: 'pointer',
    transition: 'r 0.2s ease-in-out, fill 0.2s ease-in-out, stroke-width 0.2s',
  },
  midPoint: {
    fill: '#a5b4fc',
  },
  startPoint: {
    fill: '#86efac',
  },
  endPoint: {
    fill: '#f87171',
  },
  activePoint: {
    stroke: 'white',
    strokeWidth: 1,
    animation: 'pulse 1.5s infinite',
  },
  tooltipContainer: {
    transition: 'opacity 0.2s ease-in-out',
    pointerEvents: 'none',
  },
  tooltip: {
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    border: '1px solid #4b5563',
    whiteSpace: 'nowrap',
  },
  noData: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#9ca3af',
  },
  zoomControls: {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    zIndex: 10,
  },
  zoomButton: {
    width: '32px',
    height: '32px',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid #4b5563',
    color: 'white',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    padding: 0,
    transition: 'background-color 0.2s, opacity 0.2s',
  },
};

const keyframes = `
  @keyframes pulse {
    0% { r: 1.5; }
    50% { r: 2.2; }
    100% { r: 1.5; }
  }
`;

interface MapVisualizationProps {
  history: TrackingEvent[];
  activeEventIndex: number | null;
  onPointClick: (index: number) => void;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ history, activeEventIndex, onPointClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const points = history.map(event => event.locationCoords);

  if (points.length < 1) {
    return <div style={styles.mapContainer}><p style={styles.noData}>No location data available.</p></div>;
  }

  const latitudes = points.map(p => p.lat);
  const longitudes = points.map(p => p.lng);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;

  const paddingPercent = 0.20; // 20% padding
  const mapHeight = latRange > 0 ? latRange * (1 + paddingPercent * 2) : 1;
  const mapWidth = lngRange > 0 ? lngRange * (1 + paddingPercent * 2) : 1;
  const mapMinLat = minLat - (latRange * paddingPercent);
  const mapMinLng = minLng - (lngRange * paddingPercent);
  
  const convertCoordsToPercent = (lat: number, lng: number) => {
    const x = ((lng - mapMinLng) / mapWidth) * 100;
    const y = 100 - (((lat - mapMinLat) / mapHeight) * 100);
    return { x, y };
  };

  const pixelPoints = points.map(p => convertCoordsToPercent(p.lat, p.lng));
  
  const hoveredEvent = hoveredIndex !== null ? history[hoveredIndex] : null;
  const hoveredPoint = hoveredIndex !== null ? pixelPoints[hoveredIndex] : null;

  const handleZoomIn = () => setZoom(prevZoom => prevZoom + 0.25);
  const handleZoomOut = () => setZoom(prevZoom => Math.max(1, prevZoom - 0.25));

  const getTooltipTransform = () => {
    if (!hoveredPoint) return undefined;
    const newX = (hoveredPoint.x - 50) * zoom + 50;
    const newY = (hoveredPoint.y - 50) * zoom + 50;
    return `translate(${newX + 2}, ${newY - 18})`;
  };

  // --- Vehicle Animation Logic ---
  let vehiclePosition = null;
  let vehicleRotation = -90; // Default rotation (pointing up)

  if (activeEventIndex !== null && pixelPoints[activeEventIndex]) {
    const currentPoint = pixelPoints[activeEventIndex];
    vehiclePosition = currentPoint;

    // Calculate rotation based on the previous point
    if (activeEventIndex > 0) {
      const prevPoint = pixelPoints[activeEventIndex - 1];
      const dx = currentPoint.x - prevPoint.x;
      const dy = currentPoint.y - prevPoint.y;
      if (dx !== 0 || dy !== 0) { // Avoid calculating angle for the same point
        vehicleRotation = Math.atan2(dy, dx) * (180 / Math.PI);
      }
    }
  }
  // --- End Vehicle Animation Logic ---

  return (
    <div style={styles.mapContainer}>
      <style>{keyframes}</style>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%', transition: 'transform 0.3s ease' }}>
          {/* Render interactive path segments */}
          {pixelPoints.slice(0, -1).map((startPoint, index) => {
            const endPoint = pixelPoints[index + 1];
            const isHovered = index === hoveredSegmentIndex;
            const segmentPathData = `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;

            return (
              <g key={`segment-group-${index}`}>
                {/* Hitbox path: thicker and transparent for easier interaction */}
                <path
                  d={segmentPathData}
                  style={{
                    stroke: 'transparent',
                    strokeWidth: 4,
                    fill: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredSegmentIndex(index)}
                  onMouseLeave={() => setHoveredSegmentIndex(null)}
                  onClick={() => onPointClick(index + 1)} // Activate the destination event
                />
                {/* Visible path */}
                <path
                  d={segmentPathData}
                  style={{
                    ...styles.path,
                    strokeWidth: isHovered ? 1.5 : 0.8,
                  }}
                />
              </g>
            );
          })}
          
          {/* Render points on top of paths */}
          {pixelPoints.map((p, index) => {
            let pointStyle = styles.midPoint;
            if (index === 0) pointStyle = styles.startPoint;
            if (index === pixelPoints.length - 1) pointStyle = styles.endPoint;
            
            const isActive = index === activeEventIndex;
            
            return (
               <circle 
                  key={index} 
                  cx={p.x} 
                  cy={p.y} 
                  r={isActive ? 1.5 : 1.2} 
                  style={{...styles.point, ...pointStyle}} 
                  className={isActive ? 'active-point' : ''}
                  onClick={() => onPointClick(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
               />
            );
          })}
          {activeEventIndex !== null && (
            <circle
              cx={pixelPoints[activeEventIndex].x}
              cy={pixelPoints[activeEventIndex].y}
              r={1.5}
              fill="none"
              style={styles.activePoint}
            />
          )}
        </g>
        <g
          style={{ ...styles.tooltipContainer, opacity: hoveredEvent ? 1 : 0 }}
          transform={getTooltipTransform()}
        >
          {hoveredEvent && (
            <foreignObject width="160" height="70">
              <div style={styles.tooltip}>
                <strong>{hoveredEvent.location}</strong>
                <br />
                {hoveredEvent.date}
              </div>
            </foreignObject>
          )}
        </g>
      </svg>
      
      {vehiclePosition && (
        <VehicleAnimation position={vehiclePosition} rotation={vehicleRotation} />
      )}

      <div style={styles.zoomControls}>
        <button 
          style={styles.zoomButton} 
          onClick={handleZoomIn} 
          aria-label="Zoom in"
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.8)')}
        >+</button>
        <button 
          onClick={handleZoomOut} 
          aria-label="Zoom out"
          disabled={zoom <= 1}
          style={{...styles.zoomButton, ...(zoom <= 1 ? { cursor: 'not-allowed', opacity: 0.5 } : {})}}
          onMouseOver={(e) => { if (zoom > 1) e.currentTarget.style.backgroundColor = '#374151'; }}
          onMouseOut={(e) => { if (zoom > 1) e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.8)'; }}
        >-</button>
      </div>
    </div>
  );
};

export default MapVisualization;
