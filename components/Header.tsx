import React from 'react';
import Icon from './Icon';

interface HeaderProps {
  onHomeClick: () => void;
  onNewShipmentClick: () => void;
  onTrackClick: () => void;
  supportEmail: string;
  onLogoutClick: () => void;
  appState: 'welcome' | 'generating_report' | 'tracking' | 'error' | 'create_shipment';
  onChatClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onNewShipmentClick, onTrackClick, supportEmail, onLogoutClick, appState, onChatClick }) => {
  const handleLinkClick = (e: React.MouseEvent, handler: () => void) => {
    e.preventDefault();
    handler();
  };

  const isTrackingActive = appState === 'tracking' || appState === 'generating_report';
  const isHomeActive = appState === 'welcome' || appState === 'error';
  const isCreateActive = appState === 'create_shipment';

  return (
    <header className="app-header">
      <div className="header-brand" style={{cursor: 'pointer'}} onClick={onHomeClick}>
        <Icon name="globe-check" className="header-icon" />
        <div className="brand-text-container">
          <span className="brand-text">IntelliTrack</span>
          <span className="brand-tagline">Verified Global Logistics</span>
        </div>
      </div>
      <nav className="header-nav">
        <a href="#" onClick={(e) => handleLinkClick(e, onHomeClick)} className={isHomeActive ? 'active' : ''}>Home</a>
        <a href="#" onClick={(e) => handleLinkClick(e, onNewShipmentClick)} className={isCreateActive ? 'active' : ''}>New Shipment</a>
        <a href="#" onClick={(e) => handleLinkClick(e, onTrackClick)} className={isTrackingActive ? 'active' : ''}>Track</a>
        <a href="#" onClick={(e) => handleLinkClick(e, onChatClick)}>AI Assistant</a>
        <a href={`mailto:${supportEmail}`} title="Contact Customer Support">Contact</a>
        <a 
          href="#" 
          onClick={(e) => handleLinkClick(e, onLogoutClick)} 
          title="Log Out" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.5rem',
            borderRadius: '50%',
            transition: 'background-color 0.2s ease-in-out'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Icon name="log-out" />
        </a>
      </nav>
    </header>
  );
};

export default Header;