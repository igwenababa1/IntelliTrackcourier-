

import React, { useState } from 'react';
import Icon from './Icon';
import { Notification } from '../types';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  onHomeClick: () => void;
  onNewShipmentClick: () => void;
  onTrackClick: () => void;
  supportEmail: string;
  onLogoutClick: () => void;
  appState: 'welcome' | 'tracking' | 'error' | 'create_shipment' | 'email_verification' | 'generating_report';
  onChatClick: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkNotificationsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  onNewShipmentClick, 
  onTrackClick, 
  supportEmail, 
  onLogoutClick, 
  appState, 
  onChatClick,
  notifications,
  unreadCount,
  onMarkNotificationsRead
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent, handler: () => void) => {
    e.preventDefault();
    handler();
  };

  const handleMobileLinkClick = (handler: () => void) => {
    handler();
    setIsMobileMenuOpen(false);
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
        
        <NotificationBell 
            notifications={notifications} 
            unreadCount={unreadCount}
            onMarkAsRead={onMarkNotificationsRead}
        />

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

      <button className="hamburger-menu" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open navigation menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay">
            <button className="mobile-nav-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close navigation menu">
                <Icon name="close" />
            </button>
            <div className="mobile-nav-links">
                <a href="#" onClick={(e) => { e.preventDefault(); handleMobileLinkClick(onHomeClick); }} className={isHomeActive ? 'active' : ''}>Home</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleMobileLinkClick(onNewShipmentClick); }} className={isCreateActive ? 'active' : ''}>New Shipment</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleMobileLinkClick(onTrackClick); }} className={isTrackingActive ? 'active' : ''}>Track</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleMobileLinkClick(onChatClick); }}>AI Assistant</a>
                <a href={`mailto:${supportEmail}`}>Contact</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleMobileLinkClick(onLogoutClick); }}>Log Out</a>
            </div>
        </div>
      )}

    </header>
  );
};

export default Header;