import React from 'react';
import Icon from './Icon';

interface HeaderProps {
  onHomeClick: () => void;
  onTrackClick: () => void;
  supportEmail: string;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onTrackClick, supportEmail }) => {
  const handleLinkClick = (e: React.MouseEvent, handler: () => void) => {
    e.preventDefault();
    handler();
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <Icon name="globe-check" className="header-icon" />
        <div className="brand-text-container">
          <span className="brand-text">IntelliTrack</span>
          <span className="brand-tagline">Verified Global Logistics</span>
        </div>
      </div>
      <nav className="header-nav">
        <a href="#" onClick={(e) => handleLinkClick(e, onHomeClick)}>Home</a>
        <a href="#" onClick={(e) => handleLinkClick(e, onTrackClick)}>Track</a>
        <a href={`mailto:${supportEmail}`} title="Contact Customer Support">Contact Us</a>
      </nav>
    </header>
  );
};

export default Header;