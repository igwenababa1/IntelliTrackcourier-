// Fix: Populate the contents of components/WelcomeScreen.tsx
import React from 'react';
import TrackingInput from './TrackingInput';
import VehicleAnimation from './VehicleAnimation';
import ServiceShowcase from './ServiceShowcase';
import Icon from './Icon';

interface WelcomeScreenProps {
  onTrack: (id: string) => void;
  onScan: () => void;
  isLoading: boolean;
  initialTrackingId?: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: 'center',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)', // Adjust for header height
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 700,
    color: 'white',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    color: 'var(--text-color)',
    marginBottom: '2.5rem',
    maxWidth: '600px',
  },
  quickActionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    width: '100%',
    maxWidth: '800px',
    marginTop: '3rem',
    padding: '0 1rem',
  },
  quickActionCard: {
    backgroundColor: 'var(--card-bg-color)',
    padding: '1.5rem',
    borderRadius: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    transition: 'all 0.2s ease',
  },
  quickActionIconWrapper: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    color: 'var(--primary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  quickActionText: {
    color: 'var(--text-color)',
    fontWeight: 600,
    fontSize: '0.9rem',
  }
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onTrack, onScan, isLoading, initialTrackingId }) => {
  return (
    <div style={styles.container} className="welcome-screen-container">
      <VehicleAnimation />
      <h1 style={styles.title}>Intelligent Shipment Tracking</h1>
      <p style={styles.subtitle}>
        Real-time, secure, and verified tracking for your global shipments. Enter
        your tracking ID below to get started.
      </p>
      <TrackingInput 
        onTrack={onTrack} 
        onScan={onScan}
        isLoading={isLoading} 
        initialValue={initialTrackingId}
      />

      <div style={styles.quickActionsContainer}>
        <div style={styles.quickActionCard} className="quick-action-card" onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'} onClick={() => alert('Shipping calculator feature coming soon!')}>
          <div style={styles.quickActionIconWrapper}><Icon name="package" /></div>
          <span style={styles.quickActionText}>Calculate Time & Cost</span>
        </div>
        <div style={styles.quickActionCard} className="quick-action-card" onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'} onClick={() => alert('Location finder feature coming soon!')}>
          <div style={styles.quickActionIconWrapper}><Icon name="map-pin" /></div>
          <span style={styles.quickActionText}>Find Drop-off Location</span>
        </div>
        <div style={styles.quickActionCard} className="quick-action-card" onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'} onClick={() => alert('Delivery manager feature coming soon!')}>
          <div style={styles.quickActionIconWrapper}><Icon name="calendar" /></div>
          <span style={styles.quickActionText}>Manage Deliveries</span>
        </div>
        <div style={styles.quickActionCard} className="quick-action-card" onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'} onClick={() => alert('Support center coming soon!')}>
          <div style={styles.quickActionIconWrapper}><Icon name="message-square" /></div>
          <span style={styles.quickActionText}>Help & Support</span>
        </div>
      </div>

      <ServiceShowcase />
    </div>
  );
};

export default WelcomeScreen;
