import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from './Icon';
import useSound from '../hooks/useSound';
import { COMMAND_SOUND, CONFIRM_SOUND } from './sounds';

const modalStyles: { [key: string]: React.CSSProperties } = {
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '1rem',
  },
  statusText: {
    color: 'var(--text-secondary-color)',
    minHeight: '24px',
    marginBottom: '1.5rem',
  },
  video: {
    width: '100%',
    height: 'auto',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    transform: 'scaleX(-1)',
    border: '1px solid var(--border-color)',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    border: '1px solid var(--border-color)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  actionButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  primaryButton: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#21262d',
    color: 'white',
    border: '1px solid var(--border-color)',
  },
};

const CameraConfirmationModal: React.FC<{
  onConfirm: (data: string) => void;
  onClose: () => void;
}> = ({ onConfirm, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<'capture' | 'preview'>('capture');
  const [imageData, setImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playShutter] = useSound(COMMAND_SOUND, 0.6);
  const [playSuccess] = useSound(CONFIRM_SOUND, 0.5);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Could not access camera. Please check permissions.');
        console.error(err);
      }
    };
    startCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    playShutter();
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/jpeg');
      setImageData(data);
      setStep('preview');
    }
  };

  const handleConfirm = () => {
      if(imageData) {
          playSuccess();
          onConfirm(imageData);
      }
  }

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        <button className="confirmation-modal-close-button" onClick={onClose}><Icon name="close" /></button>
        <h2 style={modalStyles.title}>Confirm with Photo</h2>
        <p style={modalStyles.statusText}>{error || (step === 'capture' ? 'Position the package in the frame.' : 'Review your photo.')}</p>
        
        {step === 'capture' ? (
          <>
            <video ref={videoRef} style={modalStyles.video} autoPlay playsInline muted />
            <button style={{...modalStyles.actionButton, ...modalStyles.primaryButton}} onClick={handleCapture}>
              <Icon name="camera" /> Capture
            </button>
          </>
        ) : (
          <>
            {imageData && <img src={imageData} alt="Delivery preview" style={modalStyles.previewImage} />}
            <div style={modalStyles.actions}>
              <button style={{...modalStyles.actionButton, ...modalStyles.secondaryButton}} onClick={() => setStep('capture')}>Retake</button>
              <button style={{...modalStyles.actionButton, ...modalStyles.primaryButton}} onClick={handleConfirm}>Confirm</button>
            </div>
          </>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

const AudioConfirmationModal: React.FC<{
  onConfirm: (data: string) => void;
  onClose: () => void;
}> = ({ onConfirm, onClose }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playStart] = useSound(COMMAND_SOUND, 0.6);
  const [playStop] = useSound(CONFIRM_SOUND, 0.5);

  const startRecording = async () => {
    setError(null);
    setAudioURL(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      playStart();
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      playStop();
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleConfirm = () => {
    if (!audioURL) return;
    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      onConfirm(reader.result as string);
    };
  }

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        <button className="confirmation-modal-close-button" onClick={onClose}><Icon name="close" /></button>
        <h2 style={modalStyles.title}>Confirm with Voice Note</h2>
        <p style={modalStyles.statusText}>
          {error || (isRecording ? "Recording..." : audioURL ? "Review your voice note." : "Press the button to start recording.")}
        </p>

        {!audioURL && (
          <button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
           {isRecording && <div className="recording-indicator"></div>}
          </button>
        )}
        
        {audioURL && (
            <>
                <audio src={audioURL} controls style={{width: '100%', marginBottom: '1.5rem'}} />
                <div style={modalStyles.actions}>
                    <button style={{...modalStyles.actionButton, ...modalStyles.secondaryButton}} onClick={startRecording}>Re-record</button>
                    <button style={{...modalStyles.actionButton, ...modalStyles.primaryButton}} onClick={handleConfirm}>Confirm</button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

const SignatureConfirmationModal: React.FC<{
  onConfirm: (data: string) => void;
  onClose: () => void;
}> = ({ onConfirm, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [playSuccess] = useSound(CONFIRM_SOUND, 0.5);

  const getCoords = (event: MouseEvent | TouchEvent): { x: number, y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (event instanceof TouchEvent) {
      return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    isDrawingRef.current = true;
    const { x, y } = getCoords(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    event.preventDefault();
  }, []);

  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    event.preventDefault();
  }, []);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      playSuccess();
      // Create a new canvas to draw the signature on a white background
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const finalCtx = finalCanvas.getContext('2d');
      if (finalCtx) {
        finalCtx.fillStyle = 'white';
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        finalCtx.drawImage(canvas, 0, 0);
        onConfirm(finalCanvas.toDataURL('image/png'));
      }
    }
  };

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        <button className="confirmation-modal-close-button" onClick={onClose}><Icon name="close" /></button>
        <h2 style={modalStyles.title}>Confirm with Signature</h2>
        <p style={modalStyles.statusText}>Please sign in the box below.</p>
        <canvas ref={canvasRef} width="400" height="200" className="signature-canvas" />
        <div style={modalStyles.actions}>
          <button style={{...modalStyles.actionButton, ...modalStyles.secondaryButton}} onClick={handleClear}>Clear</button>
          <button style={{...modalStyles.actionButton, ...modalStyles.primaryButton}} onClick={handleConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: '#21262d',
    color: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
};

interface DeliveryConfirmationProps {
  onConfirm: (type: 'photo' | 'audio' | 'signature', data: string) => void;
}

const DeliveryConfirmation: React.FC<DeliveryConfirmationProps> = ({ onConfirm }) => {
  const [mode, setMode] = useState<'camera' | 'audio' | 'signature' | null>(null);

  const handleConfirm = (type: 'photo' | 'audio' | 'signature', data: string) => {
    onConfirm(type, data);
    setMode(null);
  };

  return (
    <div style={styles.container}>
      <button 
        style={styles.button} 
        onClick={() => setMode('camera')}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#30363d'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#21262d'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
      >
        <Icon name="camera" />
        Confirm with Photo
      </button>
      <button 
        style={styles.button} 
        onClick={() => setMode('audio')}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#30363d'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#21262d'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
      >
        <Icon name="microphone" />
        Confirm with Voice Note
      </button>
       <button 
        style={styles.button} 
        onClick={() => setMode('signature')}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#30363d'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#21262d'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
      >
        <Icon name="edit-3" />
        Confirm with Signature
      </button>

      {mode === 'camera' && <CameraConfirmationModal onConfirm={(data) => handleConfirm('photo', data)} onClose={() => setMode(null)} />}
      {mode === 'audio' && <AudioConfirmationModal onConfirm={(data) => handleConfirm('audio', data)} onClose={() => setMode(null)} />}
      {mode === 'signature' && <SignatureConfirmationModal onConfirm={(data) => handleConfirm('signature', data)} onClose={() => setMode(null)} />}
    </div>
  );
};

export default DeliveryConfirmation;