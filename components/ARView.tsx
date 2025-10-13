import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

interface ARViewProps {
  onClose: () => void;
}

const ARView: React.FC<ARViewProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

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
      // Cleanup: stop all tracks on the stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="ar-view-overlay">
      <video ref={videoRef} className="ar-video-bg" autoPlay playsInline muted />
      <button className="ar-close-button" onClick={onClose} aria-label="Close AR View">
        <Icon name="close" />
      </button>
      <div className="ar-content">
        {error ? (
            <p style={{ maxWidth: '80%', backgroundColor: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '0.5rem' }}>{error}</p>
        ) : (
          <>
            <div className="package-3d-container">
                <div className="package-3d">
                    <div className="package-face front"></div>
                    <div className="package-face back"></div>
                    <div className="package-face left"></div>
                    <div className="package-face right"></div>
                    <div className="package-face top"></div>
                    <div className="package-face bottom"></div>
                </div>
            </div>
            <h2>Your Package in AR</h2>
            <p>Look around to place your virtual package.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ARView;