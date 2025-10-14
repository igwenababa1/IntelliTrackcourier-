import React, { useRef, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { City } from '../types';

interface MapVisualizationProps {
  path: City[];
  activeLocation: string;
}

/**
 * An advanced 3D globe component that visualizes the shipment's journey.
 * It uses react-globe.gl to render an interactive globe with arcs for the path,
 * points for locations, and an auto-rotating, auto-focusing camera.
 */
const MapVisualization: React.FC<MapVisualizationProps> = ({ path, activeLocation }) => {
  const globeEl = useRef<any>(null);

  // Memoize derived data to prevent recalculation on every render
  const { pointsData, arcsData, activeIndex } = useMemo(() => {
    if (!path || path.length === 0) {
      return { pointsData: [], arcsData: [], activeIndex: -1 };
    }

    const activeCityName = activeLocation.split(',')[0].trim();
    const idx = path.findIndex(p => p.name === activeCityName);

    const points = path.map((city, i) => ({
      ...city,
      // Make the active point larger and more prominent
      size: i === idx ? 0.3 : 0.15,
      // Style points based on their status: Visited, Active, or Upcoming
      color: i < idx ? '#4f46e5' : (i === idx ? '#f59e0b' : '#6b7280'),
    }));

    const arcs: any[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      const isTraveled = i < idx;
      arcs.push({
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
        // Traveled arcs have a bright gradient; upcoming arcs are subtle
        color: isTraveled ? ['#a5b4fc', '#4f46e5'] : ['#6b7280', '#6b7280'],
        // Traveled arcs are solid; upcoming arcs are dashed and animated
        dashLen: isTraveled ? 0 : 0.5,
        dashGap: isTraveled ? 0 : 0.3,
        dashAnimateTime: isTraveled ? 0 : 5000,
      });
    }
    return { pointsData: points, arcsData: arcs, activeIndex: idx };
  }, [path, activeLocation]);


  // Effect to control camera position and globe behavior
  useEffect(() => {
    if (globeEl.current && pointsData.length > 0) {
      const globe = globeEl.current;

      // Give the globe a moment to initialize before positioning the camera
      setTimeout(() => {
        let targetAltitude = 1.5;
        // If it's the first or last stop, zoom out a bit more
        if (activeIndex === 0 || activeIndex === pointsData.length - 1) {
          targetAltitude = 2.0;
        }

        const focusPoint = pointsData[activeIndex !== -1 ? activeIndex : 0];
        
        // Smoothly transition the camera to the current active location
        globe.pointOfView({ 
            lat: focusPoint.lat, 
            lng: focusPoint.lng, 
            altitude: targetAltitude 
        }, 1500); // 1.5-second transition
      }, 500);

      // Configure globe controls for a premium feel
      const controls = globe.controls();
      controls.enableZoom = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      controls.minDistance = 200; // Prevent zooming in too close
      controls.maxDistance = 800; // Prevent zooming out too far
    }
  }, [pointsData, activeIndex]);


  return (
    <div className="map-container" aria-label="3D shipment journey globe">
      <Globe
        ref={globeEl}
        // --- Globe Textures and Background ---
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // --- Points (Cities) Configuration ---
        pointsData={pointsData}
        pointLabel={d => `<div style="background-color: rgba(17, 24, 39, 0.8); color: white; padding: 5px 10px; border-radius: 5px;"><b>${d.name}</b> (${d.country})</div>`}
        pointLat="lat"
        pointLng="lng"
        pointRadius="size"
        pointAltitude={0.01} // Slightly elevate points for visibility
        pointColor="color"
        pointsTransitionDuration={1000}

        // --- Arcs (Journey Path) Configuration ---
        arcsData={arcsData}
        arcColor="color"
        arcDashLength="dashLen"
        arcDashGap="dashGap"
        arcDashAnimateTime="dashAnimateTime"
        arcAltitude={0.1}
        arcAltitudeAutoScale={0.5}
        arcsTransitionDuration={1000}
      />
    </div>
  );
};

export default MapVisualization;