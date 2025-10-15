import React, { useRef, useEffect, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { City } from '../types';

interface MapVisualizationProps {
  path: City[];
  activeLocation: string;
}

/**
 * An advanced 3D globe component that visualizes the shipment's journey.
 * It uses react-globe.gl to render an interactive, photorealistic globe with
 * an animated parcel icon, points for locations, and an auto-rotating camera.
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
      size: i === idx ? 0.35 : 0.2,
      color: i < idx ? '#4f46e5' : (i === idx ? '#f59e0b' : 'rgba(255, 255, 255, 0.6)'),
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
  
  // Memoize the 3D object for the parcel to avoid re-creating it on each render.
  const parcelObject = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.08);
    const material = new THREE.MeshLambertMaterial({ color: 'white', emissive: '#f59e0b', emissiveIntensity: 2 });
    return new THREE.Mesh(geometry, material);
  }, []);

  // Effect to animate the parcel along the active leg of its journey.
  useEffect(() => {
    if (activeIndex <= 0) {
      const currentPoint = path[activeIndex] || path[0];
      if (currentPoint) {
        setParcelPosition({ lat: currentPoint.lat, lng: currentPoint.lng, altitude: 0.1 });
      }
      return;
    };

    const startPoint = path[activeIndex - 1];
    const endPoint = path[activeIndex];
    if (!startPoint || !endPoint) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    const animationDuration = 4000; // 4 seconds per leg

    const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * progress;
        const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * progress;
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

    // Configure globe controls for a premium feel
    const controls = globe.controls();
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2; // Slower for relaxation
    controls.minDistance = 250;
    controls.maxDistance = 1000;

    const focusPoint = pointsData[activeIndex !== -1 ? activeIndex : 0];
    globe.pointOfView({ 
        lat: focusPoint.lat, 
        lng: focusPoint.lng, 
        altitude: 2.5 
    }, 2000); // 2-second transition

  }, [pointsData, activeIndex]); // Re-run only when the active location changes


  return (
    <div className="map-container" aria-label="3D shipment journey globe">
      <Globe
        ref={globeEl}
        // --- Globe Textures and Background ---
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        cloudsImageUrl="//unpkg.com/three-globe/example/img/earth-clouds.png"
        cloudsAltitude={0.01}
        animateClouds={true}
        
        // --- Atmosphere ---
        showAtmosphere={true}
        atmosphereColor="rgba(120, 160, 255, 0.5)"
        atmosphereAltitude={0.2}
        
        // --- Points (Cities) Configuration ---
        pointsData={pointsData}
        pointLabel={d => `<div style="background-color: rgba(17, 24, 39, 0.8); backdrop-filter: blur(5px); color: white; padding: 5px 10px; border-radius: 5px; border: 1px solid #374151;"><b>${d.name}</b> (${d.country})</div>`}
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
        
        // --- Parcel Object ---
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