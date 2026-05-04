import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, useXRHitTest, useXR } from '@react-three/xr';
import * as THREE from 'three';

interface ARViewProps {
  onClose: () => void;
}

const store = createXRStore({
  emulate: false,
  hitTest: true,
});

const HitTestManager = () => {
  const reticleRef = useRef<THREE.Mesh>(null);
  const [boxPosition, setBoxPosition] = useState<THREE.Vector3 | null>(null);
  const matrixHelper = new THREE.Matrix4();
  const session = useXR(state => state.session);

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (reticleRef.current) {
        if (results.length > 0) {
          getWorldMatrix(matrixHelper, results[0]);
          reticleRef.current.position.setFromMatrixPosition(matrixHelper);
          reticleRef.current.quaternion.setFromRotationMatrix(matrixHelper);
          // Ring geometry is flat on XY plane, so we rotate it to lie on XZ plane
          reticleRef.current.rotation.x = -Math.PI / 2;
          reticleRef.current.visible = true;
        } else {
          reticleRef.current.visible = false;
        }
      }
    },
    'viewer'
  );

  useEffect(() => {
    if (!session) return;
    const handleSelect = () => {
      if (reticleRef.current && reticleRef.current.visible) {
        setBoxPosition(reticleRef.current.position.clone());
      }
    };
    session.addEventListener('select', handleSelect);
    return () => session.removeEventListener('select', handleSelect);
  }, [session]);

  return (
    <>
      <mesh ref={reticleRef} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color={"white"} />
      </mesh>
      {boxPosition && (
        <group position={boxPosition}>
          {/* Main Box */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#cda47b" />
          </mesh>
          {/* Tape on top */}
          <mesh position={[0, 0.301, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, 0.3]} />
            <meshStandardMaterial color="#e0d0b0" />
          </mesh>
          {/* Tape on front */}
          <mesh position={[0, 0.15, 0.151]}>
            <planeGeometry args={[0.08, 0.3]} />
            <meshStandardMaterial color="#e0d0b0" />
          </mesh>
          {/* Tape on back */}
          <mesh position={[0, 0.15, -0.151]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.08, 0.3]} />
            <meshStandardMaterial color="#e0d0b0" />
          </mesh>
        </group>
      )}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
    </>
  );
};

const SimulatedARView: React.FC<ARViewProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [boxPosition, setBoxPosition] = useState<{ x: number, y: number } | null>(null);
  const [reticlePosition, setReticlePosition] = useState<{ x: number, y: number } | null>(null);

  const [pkgTransform, setPkgTransform] = useState({ rotX: -20, rotY: -20, scale: 1 });
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const initialPinchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef(1);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    // Set initial reticle position to center when mounted
    const updateCenter = () => {
      setReticlePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    };
    updateCenter();
    window.addEventListener('resize', updateCenter);

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
            setError('Camera access is not supported by your browser.');
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera permission denied. Please enable camera access in your browser settings to use this feature.");
      }
    };

    startCamera();

    return () => {
      window.removeEventListener('resize', updateCenter);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (boxPosition) {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistRef.current = Math.hypot(dx, dy);
        initialScaleRef.current = pkgTransform.scale;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (boxPosition) {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - lastPosRef.current.x;
        const dy = e.touches[0].clientY - lastPosRef.current.y;
        lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setPkgTransform(p => ({ ...p, rotX: p.rotX - dy * 0.5, rotY: p.rotY + dx * 0.5 }));
      } else if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scaleFactor = dist / (initialPinchDistRef.current || 1);
        setPkgTransform(p => ({ ...p, scale: Math.max(0.2, Math.min(3, initialScaleRef.current * scaleFactor)) }));
      }
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    initialPinchDistRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (boxPosition) {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMoveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boxPosition && !error) {
      const rect = e.currentTarget.getBoundingClientRect();
      setReticlePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else if (boxPosition && isDraggingRef.current) {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      setPkgTransform(p => ({ ...p, rotX: p.rotX - dy * 0.5, rotY: p.rotY + dx * 0.5 }));
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (boxPosition) {
      setPkgTransform(p => ({ ...p, scale: Math.max(0.2, Math.min(3, p.scale - e.deltaY * 0.005)) }));
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!boxPosition && !error) {
       // if it's touch we can use touches[0], or if mouse clientX
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const newPos = { x: clientX - rect.left, y: clientY - rect.top };
      setBoxPosition(newPos);
      setReticlePosition(newPos);
    }
  };

  return (
    <div 
      className="ar-view-overlay" 
      onClick={handleTap} 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMoveClick}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: boxPosition ? 'grab' : 'crosshair', touchAction: 'none' }}
    >
      <style>
        {`
          @keyframes ar-pulse {
            0% { transform: translate(-50%, -50%) rotateX(60deg) scale(0.9); opacity: 0.6; }
            50% { transform: translate(-50%, -50%) rotateX(60deg) scale(1.1); opacity: 1; border-color: rgba(79, 70, 229, 0.8); }
            100% { transform: translate(-50%, -50%) rotateX(60deg) scale(0.9); opacity: 0.6; }
          }
          @keyframes ar-scaleIn {
            0% { transform: translateX(-50%) rotateX(70deg) scale(0); opacity: 0; }
            80% { transform: translateX(-50%) rotateX(70deg) scale(1.1); opacity: 0.6; }
            100% { transform: translateX(-50%) rotateX(70deg) scale(1); opacity: 0.6; }
          }
          @keyframes ar-dropIn {
            0% { transform: translateY(-500px) rotate3d(1, 1, 1, 45deg) scale(0.8); opacity: 0; }
            60% { transform: translateY(20px) rotate3d(0, 0, 0, 0deg) scale(1.05); opacity: 1; }
            80% { transform: translateY(-10px) rotate3d(0, 0, 0, 0deg) scale(0.98); }
            100% { transform: translateY(0) rotate3d(0, 0, 0, 0deg) scale(1); }
          }
        `}
      </style>
      <video ref={videoRef} className="ar-video-bg" autoPlay playsInline muted />
      <button className="ar-close-button" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close AR View">
        <Icon name="close" />
      </button>
      <div className="ar-content" style={{ pointerEvents: 'none' }}>
        {error ? (
            <p style={{ 
              maxWidth: '80%', 
              backgroundColor: 'var(--card-bg-color)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem', 
              borderRadius: '0.75rem',
              pointerEvents: 'auto'
            }}>{error}</p>
        ) : (
          <>
            {!boxPosition && reticlePosition && (
              <div
                style={{
                  position: 'absolute',
                  left: reticlePosition.x,
                  top: reticlePosition.y,
                  transform: 'translate(-50%, -50%) rotateX(60deg)',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '3px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.5)',
                  animation: 'ar-pulse 1.5s infinite ease-in-out',
                  pointerEvents: 'none',
                  transition: 'all 0.1s ease',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px white'
                }} />
              </div>
            )}

            {boxPosition && (
              <div 
                className="package-3d-container" 
                style={{ 
                  position: 'absolute', 
                  left: boxPosition.x, 
                  top: boxPosition.y,
                  transform: 'translate(-50%, -50%)',
                  margin: 0
                }}
              >
                  {/* Subtle Shadow underneath the placed package */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-30px', /* adjust to be below the package */
                    left: '50%',
                    transform: 'translateX(-50%) rotateX(70deg)',
                    width: '120px',
                    height: '120px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '10px',
                    filter: 'blur(12px)',
                    animation: 'ar-scaleIn 0.3s ease-out forwards'
                  }} />

                  <div style={{ transform: `rotateX(${pkgTransform.rotX}deg) rotateY(${pkgTransform.rotY}deg) scale(${pkgTransform.scale})`, transformStyle: 'preserve-3d' }}>
                    <div className="package-3d" style={{ animation: 'ar-dropIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                        <div className="package-face front" style={{ border: '1px solid rgba(255,255,255,0.3)' }}></div>
                        <div className="package-face back" style={{ border: '1px solid rgba(255,255,255,0.3)' }}></div>
                        <div className="package-face left" style={{ border: '1px solid rgba(255,255,255,0.3)' }}></div>
                        <div className="package-face right" style={{ border: '1px solid rgba(255,255,255,0.3)' }}></div>
                        <div className="package-face top" style={{ border: '1px solid rgba(255,255,255,0.3)' }}></div>
                        <div className="package-face bottom" style={{ border: '1px solid rgba(255,255,255,0.3)' }}></div>
                    </div>
                  </div>
              </div>
            )}
            
            {!boxPosition && (
              <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                <h2>Surface Detected</h2>
                <p>Tap the glowing reticle to place your package.</p>
              </div>
            )}
            
            {boxPosition && (
              <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'auto' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setBoxPosition(null); }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(5px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)' }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)' }}
                >
                  Reposition Package
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ARView: React.FC<ARViewProps> = ({ onClose }) => {
  return <SimulatedARView onClose={onClose} />;
};

export default ARView;