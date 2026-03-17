import React, { useRef, useEffect, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { City } from '../types';

interface MapVisualizationProps {
  path: City[];
  activeLocation: string;
}

/**
 * An advanced 3D globe component that provides a realistic and relaxing
 * "courier map" visualization of the shipment's journey. It features a
 * high-fidelity satellite texture, animated clouds, atmospheric glow, and a
 * real-time animated parcel icon.
 */
const MapVisualization: React.FC<MapVisualizationProps> = ({ path, activeLocation }) => {
  const globeEl = useRef<any>(null);
  const [parcelPosition, setParcelPosition] = useState<{ lat: number; lng: number; altitude: number } | null>(null);

  // Memoize derived data to prevent recalculation on every render
  const { pointsData, arcsData, activeIndex } = useMemo(() => {
    if (!path || path.length === 0) {
      return { pointsData: [], arcsData: [], activeIndex: -1 };
    }

    const activeCityName = activeLocation.split(',')[0].trim();
    const idx = path.findIndex(p => p.name === activeCityName);

    const points = path.map((city, i) => ({
      ...city,
      size: i === idx ? 0.35 : 0.2, // Active point is larger
      color: i < idx ? '#4f46e5' : (i === idx ? '#f59e0b' : 'rgba(255, 255, 255, 0.6)'),
      label: `<b>${city.name}</b> (${city.country})`
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
        color: isTraveled ? ['#6366f1', '#a5b4fc'] : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.4)'],
        dashLen: 0.5,
        dashGap: isTraveled ? 0 : 0.3,
        dashAnimateTime: isTraveled ? 0 : 8000,
      });
    }
    return { pointsData: points, arcsData: arcs, activeIndex: idx };
  }, [path, activeLocation]);
  
  // A glowing octahedron for the parcel icon
  const parcelObject = useMemo(() => {
    const geometry = new THREE.OctahedronGeometry(0.12);
    const material = new THREE.MeshLambertMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 3 });
    return new THREE.Mesh(geometry, material);
  }, []);

  // Effect to animate the parcel along the active leg of its journey.
  useEffect(() => {
    // If we are at the beginning or there's no active path, just show the parcel at the current location
    if (activeIndex < 1 || !path[activeIndex] || !path[activeIndex - 1]) {
      const currentPoint = path[activeIndex] || path[0];
      if (currentPoint) {
        setParcelPosition({ lat: currentPoint.lat, lng: currentPoint.lng, altitude: 0.1 });
      }
      return;
    };

    const startPoint = path[activeIndex - 1];
    const endPoint = path[activeIndex];
    
    let animationFrameId: number;
    let startTime: number | null = null;
    const animationDuration = 5000; // Slower animation (5s) for a more relaxed feel

    const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Linear interpolation for lat/lng
        const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * progress;
        const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * progress;
        // Sinusoidal arc for altitude
        const altitude = Math.sin(progress * Math.PI) * 0.4;
        
        setParcelPosition({ lat, lng, altitude });
        
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeIndex, path]);

  // Effect to control camera position and globe behavior.
  useEffect(() => {
    const globe = globeEl.current;
    if (!globe || !pointsData.length) return;

    // Configure globe controls for a premium, relaxed feel
    const controls = globe.controls();
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.15; // Slower for relaxation
    controls.minDistance = 250;
    controls.maxDistance = 800;

    const focusPoint = pointsData[activeIndex !== -1 ? activeIndex : 0];
    if (focusPoint) {
      globe.pointOfView({ 
          lat: focusPoint.lat, 
          lng: focusPoint.lng, 
          altitude: 2.0 // Zoom in a little closer
      }, 2500); // Smoother, longer transition
    }

  }, [pointsData, activeIndex]);


  return (
    <div className="map-container" aria-label="3D shipment journey globe">
      <Globe
        ref={globeEl}
        // --- Photorealistic Textures & Atmosphere for Relaxation Viewing ---
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        // Removed night-sky background for a cleaner look that highlights the atmosphere
        cloudsImageUrl="//unpkg.com/three-globe/example/img/earth-clouds.png"
        cloudsAltitude={0.01}
        animateClouds={true}
        showAtmosphere={true}
        atmosphereColor="rgba(120, 160, 255, 0.3)" // Softer atmospheric glow
        atmosphereAltitude={0.25}
        
        // --- Points (Cities) Configuration ---
        pointsData={pointsData}
        pointLabel={d => `<div style="background-color: rgba(17, 24, 39, 0.8); backdrop-filter: blur(5px); color: white; padding: 5px 10px; border-radius: 5px; border: 1px solid #374151;">${d.label}</div>`}
        pointLat="lat"
        pointLng="lng"
        pointRadius="size"
        pointAltitude={0.02}
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
        
        // --- Pulsing Ring for Active Location ---
        ringsData={activeIndex !== -1 ? [pointsData[activeIndex]] : []}
        ringColor={() => '#f59e0b'}
        ringMaxRadius={1.2}
        ringPropagationSpeed={1}
        ringRepeatPeriod={800}

        // --- Real-time Animated Parcel ---
        objectsData={parcelPosition ? [parcelPosition] : []}
        objectLat="lat"
        objectLng="lng"
        objectAltitude="altitude"
        objectThreeObject={() => parcelObject}
      />
    </div>
  );
};

export default MapVisualization;
