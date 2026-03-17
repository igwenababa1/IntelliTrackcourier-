import React from 'react';
import Icon from './Icon';

interface BottomNavProps {
  currentView: 'home' | 'create' | 'tracking';
  onNavigate: (view: 'home' | 'create' | 'tracking') => void;
  onShowChat: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onShowChat }) => {
  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
        onClick={() => onNavigate('home')}
      >
        <Icon name="home" />
        <span>Home</span>
      </button>
      <button 
        className={`nav-item ${currentView === 'create' ? 'active' : ''}`}
        onClick={() => onNavigate('create')}
      >
        <Icon name="plus-circle" />
        <span>Ship</span>
      </button>
      <button 
        className="nav-item chat-fab"
        onClick={onShowChat}
      >
        <div className="fab-inner">
          <Icon name="message-square" />
        </div>
      </button>
      <button 
        className={`nav-item ${currentView === 'tracking' ? 'active' : ''}`}
        onClick={() => onNavigate('tracking')}
      >
        <Icon name="map-pin" />
        <span>Track</span>
      </button>
      <button 
        className="nav-item"
        onClick={() => alert('Profile settings coming soon!')}
      >
        <Icon name="user" />
        <span>Profile</span>
      </button>
    </nav>
  );
};

export default BottomNav;
