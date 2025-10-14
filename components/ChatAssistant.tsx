import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { sendMessage } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
}

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
    maxHeight: '80vh',
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary-color)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'background-color 0.2s, color 0.2s',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '1rem',
    paddingRight: '2rem',
  },
};

const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onClose, initialPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      if (initialPrompt) {
        setMessages([{ text: initialPrompt, sender: 'assistant' }]);
      }
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          style={styles.closeButton} 
          onClick={onClose} 
          aria-label="Close assistant"
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary-color)'; }}
        >
          <Icon name="close" />
        </button>
        <h2 style={styles.title}>AI Assistant</h2>
        
        <div ref={messageListRef} className="chat-message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.sender}`}>
              {msg.text}
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
      </div>
    </div>
  );
};

export default ChatAssistant;