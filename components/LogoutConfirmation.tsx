
import React from 'react';
import Icon from './Icon';

interface LogoutConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
    animation: 'fadeIn 0.3s ease',
  },
  modal: {
    backgroundColor: 'var(--card-bg-color)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '0.75rem',
    padding: '2rem',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    border: '1px solid var(--border-color)',
  },
  iconContainer: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 1.5rem',
    color: '#f87171',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'white',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: 'var(--text-color)',
    marginBottom: '2rem',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
};

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconContainer}>
            <Icon name="alert-triangle" style={{width: '28px', height: '28px'}} />
        </div>
        <h2 style={styles.title}>Logging Out</h2>
        <p style={styles.message}>Are you sure you want to log out and end your session?</p>
        <div style={styles.buttonContainer}>
            <button 
                className="logout-action-button logout-cancel-button"
                onClick={onCancel}
            >
                Cancel
            </button>
            <button 
                className="logout-action-button logout-confirm-button"
                onClick={onConfirm}
            >
                Log Out
            </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation;
