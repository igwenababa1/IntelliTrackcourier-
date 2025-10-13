import React from 'react';
import Icon from './Icon';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
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
    backgroundColor: '#1f2937',
    borderRadius: '0.75rem',
    padding: '2rem',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    textAlign: 'left',
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '1rem',
  },
  prompt: {
    fontSize: '1rem',
    color: '#e5e7eb',
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  },
  textArea: {
    width: '100%',
    minHeight: '100px',
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#111827',
    color: '#e5e7eb',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  sendButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    marginTop: '1rem',
    float: 'right',
  },
};

const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onClose, initialPrompt }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose} aria-label="Close assistant">
          <Icon name="close" />
        </button>
        <h2 style={styles.title}>AI Assistant</h2>
        <p style={styles.prompt}>{initialPrompt}</p>
        <textarea 
          style={styles.textArea}
          placeholder="Type your message here..."
          defaultValue={`I'd like to cancel this shipment. Can you please assist?`}
        />
        <button style={styles.sendButton} onClick={onClose}>Send Message</button>
      </div>
    </div>
  );
};

export default ChatAssistant;
