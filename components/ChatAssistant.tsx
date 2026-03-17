import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { sendMessage } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { PackageDetails } from '../types';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
}

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  packageDetails?: PackageDetails | null;
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    animation: 'fadeIn 0.3s ease',
  },
  modal: {
    backgroundColor: 'var(--card-bg-color)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-color)',
    position: 'relative',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
    maxHeight: '80vh',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'white',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  modeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '999px',
    backgroundColor: '#1f2937',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginLeft: 'auto',
    marginRight: '1rem',
  },
  liveContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
  },
  visualizerRing: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid var(--primary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    position: 'relative',
  },
  visualizerIcon: {
    width: '50px',
    height: '50px',
    color: 'white',
  },
  statusText: {
    fontSize: '1.25rem',
    fontWeight: 500,
    color: 'white',
    marginBottom: '0.5rem',
  },
  subStatusText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
  },
  liveControls: {
    marginTop: '3rem',
    display: 'flex',
    gap: '1rem',
  },
  pulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    backgroundColor: 'rgba(79, 70, 229, 0.3)',
    animation: 'pulse-ring 2s infinite',
  }
};

// --- Audio Helper Functions ---

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    };
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onClose, initialPrompt, packageDetails }) => {
  const [mode, setMode] = useState<'text' | 'live'>('text');
  
  // Text Chat States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  // Live Chat States
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs for Live API
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      if (initialPrompt) {
        setMessages([{ text: initialPrompt, sender: 'assistant' }]);
      }
      setMode('text'); // Reset to text mode on open
    } else {
        stopLiveSession(); // Ensure cleanup on close
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          stopLiveSession();
      };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const responseText = await sendMessage(inputValue);
    
    const assistantMessage: Message = { text: responseText, sender: 'assistant' };
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const startLiveSession = async () => {
      setLiveStatus('connecting');
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
          mediaStreamRef.current = stream;

          const sessionPromise = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              callbacks: {
                  onopen: () => {
                      setLiveStatus('connected');
                      console.log("Live session connected");
                      
                      // Setup Input Stream
                      if (!audioContextRef.current) return;
                      
                      // Use a separate context for input to ensure 16kHz capture if possible, 
                      // or just rely on the ScriptProcessor to downsample.
                      // For simplicity in this demo, we use a ScriptProcessor on a standard context.
                      // Note: ScriptProcessor is deprecated but widely supported for this use case in demos.
                      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                      const source = inputContext.createMediaStreamSource(stream);
                      const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
                      
                      scriptProcessor.onaudioprocess = (e) => {
                          const inputData = e.inputBuffer.getChannelData(0);
                          const pcmBlob = createBlob(inputData);
                          sessionPromise.then(session => {
                              session.sendRealtimeInput({ media: pcmBlob });
                          });
                      };
                      
                      source.connect(scriptProcessor);
                      scriptProcessor.connect(inputContext.destination);
                      
                      inputSourceRef.current = source;
                      processorRef.current = scriptProcessor;
                  },
                  onmessage: async (message: LiveServerMessage) => {
                       const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                       if (base64Audio && audioContextRef.current) {
                           setIsSpeaking(true);
                           const ctx = audioContextRef.current;
                           nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                           
                           const audioBuffer = await decodeAudioData(
                               decode(base64Audio),
                               ctx,
                               24000,
                               1
                           );
                           
                           const source = ctx.createBufferSource();
                           source.buffer = audioBuffer;
                           source.connect(ctx.destination);
                           source.start(nextStartTimeRef.current);
                           source.onended = () => setIsSpeaking(false);
                           
                           nextStartTimeRef.current += audioBuffer.duration;
                       }
                  },
                  onclose: () => {
                      setLiveStatus('idle');
                      console.log("Live session closed");
                  },
                  onerror: (err) => {
                      console.error("Live session error:", err);
                      setLiveStatus('error');
                  }
              },
              config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: {
                      voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
                  },
                  systemInstruction: `You are a helpful, professional, and friendly customer support agent for IntelliTrack, a global courier service. Your goal is to assist users with tracking shipments, explaining services, and resolving issues efficiently. Be concise in your spoken responses.${packageDetails ? `\n\nContext: The user is currently viewing a package with ID ${packageDetails.id}. Its current status is "${packageDetails.status}". Estimated delivery: ${packageDetails.estimatedDelivery}. Origin: ${packageDetails.origin.cityStateZip}, ${packageDetails.origin.country}. Destination: ${packageDetails.destination.cityStateZip}, ${packageDetails.destination.country}.` : ''}`
              }
          });
          
          sessionRef.current = sessionPromise;

      } catch (error) {
          console.error("Failed to start live session:", error);
          setLiveStatus('error');
      }
  };

  const stopLiveSession = () => {
      if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
      }
      if (processorRef.current) {
          processorRef.current.disconnect();
          processorRef.current = null;
      }
      if (inputSourceRef.current) {
          inputSourceRef.current.disconnect();
          inputSourceRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
      
      // Close session if possible (wrapper doesn't expose clean close directly on promise, 
      // but usually we just stop sending and cut stream in this pattern).
      // Ideally, the SDK would have a disconnect method on the session object.
      // We will rely on stream cleanup to end effective communication.
      
      setLiveStatus('idle');
      setIsSpeaking(false);
  };

  const toggleMode = () => {
      if (mode === 'text') {
          setMode('live');
          startLiveSession();
      } else {
          stopLiveSession();
          setMode('text');
      }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
          @keyframes pulse-ring {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
              100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
          }
      `}</style>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
            <h2 style={styles.title}>
                {mode === 'text' ? <Icon name="message-square" /> : <Icon name="headset" />}
                {mode === 'text' ? 'AI Assistant' : 'Live Support'}
            </h2>
            <button style={styles.modeToggle} onClick={toggleMode}>
                {mode === 'text' ? (
                    <>
                        <Icon name="headset" style={{width: 16, height: 16}} />
                        <span>Go Live</span>
                    </>
                ) : (
                    <>
                         <Icon name="message-square" style={{width: 16, height: 16}} />
                         <span>Text Chat</span>
                    </>
                )}
            </button>
            <button 
                className="chat-modal-close-button"
                onClick={onClose} 
                aria-label="Close assistant"
                style={{ position: 'static', transform: 'none' }}
            >
                <Icon name="close" />
            </button>
        </div>
        
        {mode === 'text' ? (
            <>
                <div ref={messageListRef} className="chat-message-list">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.sender}`}>
                        <div className="markdown-body">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-bubble assistant">
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                    </div>
                )}
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="chat-input"
                    placeholder="Ask a question..."
                    disabled={isLoading}
                />
                <button type="submit" className="chat-send-button" disabled={isLoading || !inputValue.trim()}>
                    <Icon name="package" />
                </button>
                </form>
            </>
        ) : (
            <div style={styles.liveContainer}>
                {liveStatus === 'connecting' && (
                    <>
                        <div style={styles.visualizerRing}>
                             <div style={{ position: 'relative', zIndex: 1, animation: 'pulse-ring 1.5s infinite' }}>
                                <Icon name="activity" style={{ width: 60, height: 60, color: '#9ca3af' }} />
                             </div>
                        </div>
                        <p style={styles.statusText}>Connecting to Agent...</p>
                    </>
                )}
                
                {liveStatus === 'connected' && (
                    <>
                        <div style={styles.visualizerRing}>
                             {isSpeaking && <div style={styles.pulse}></div>}
                             <div style={{ position: 'relative', zIndex: 1 }}>
                                <Icon name="headset" style={{ width: 60, height: 60, color: isSpeaking ? 'white' : '#9ca3af' }} />
                             </div>
                        </div>
                        <p style={styles.statusText}>{isSpeaking ? "Agent Speaking..." : "Listening..."}</p>
                        <p style={styles.subStatusText}>Speak naturally to ask about your shipment.</p>
                    </>
                )}

                {liveStatus === 'error' && (
                    <div style={{color: '#ef4444', textAlign: 'center'}}>
                        <Icon name="alert-triangle" style={{width: 48, height: 48, margin: '0 auto 1rem'}} />
                        <p>Connection Failed. Please try again or switch to text chat.</p>
                        <button onClick={startLiveSession} style={{marginTop: '1rem', padding: '0.5rem 1rem', background: '#374151', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer'}}>Retry</button>
                    </div>
                )}
                
                <div style={styles.liveControls}>
                     <button 
                        onClick={stopLiveSession}
                        style={{
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '50%',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                        }}
                     >
                         <Icon name="stop-circle" style={{width: 28, height: 28}} />
                     </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatAssistant;