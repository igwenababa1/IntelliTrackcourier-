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

  useEffect(() => {
    let stream: MediaStream | null = null;
    
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
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!error) {
      const rect = e.currentTarget.getBoundingClientRect();
      setBoxPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <div className="ar-view-overlay" onClick={handleTap}>
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
            {boxPosition ? (
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
                  <div className="package-3d">
                      <div className="package-face front"></div>
                      <div className="package-face back"></div>
                      <div className="package-face left"></div>
                      <div className="package-face right"></div>
                      <div className="package-face top"></div>
                      <div className="package-face bottom"></div>
                  </div>
              </div>
            ) : (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <h2>Simulated AR</h2>
                <p>Tap anywhere to place your virtual package.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ARView: React.FC<ARViewProps> = ({ onClose }) => {
  const [isWebXRSupported, setIsWebXRSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsWebXRSupported(supported);
      });
    } else {
      setIsWebXRSupported(false);
    }
  }, []);

  if (isWebXRSupported === null) {
    return <div className="ar-view-overlay"><div style={{ color: 'white', margin: 'auto' }}>Checking AR support...</div></div>;
  }

  if (isWebXRSupported) {
    return (
      <div className="ar-view-overlay" style={{ backgroundColor: 'black' }}>
        <button 
          onClick={() => store.enterAR()}
          className="ar-button"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            zIndex: 1000,
            cursor: 'pointer'
          }}
        >
          Enter AR
        </button>
        <button 
          className="ar-close-button" 
          onClick={onClose} 
          aria-label="Close AR View"
          style={{ zIndex: 1001 }}
        >
          <Icon name="close" />
        </button>
        <Canvas>
          <XR store={store}>
            <HitTestManager />
          </XR>
        </Canvas>
      </div>
    );
  }

  return <SimulatedARView onClose={onClose} />;
};

export default ARView;