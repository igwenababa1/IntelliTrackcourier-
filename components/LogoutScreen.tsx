import React, { useEffect } from 'react';

interface LogoutScreenProps {
  onComplete: () => void;
}

const LOGOUT_DURATION = 5000; // 5 seconds

const LOGOUT_BACKGROUND_IMAGES = [
  'https://images.pexels.com/photos/6152261/pexels-photo-6152261.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Cargo being unloaded
  'https://images.pexels.com/photos/13098993/pexels-photo-13098993.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Nose of cargo plane open
  'https://images.pexels.com/photos/5952227/pexels-photo-5952227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Cargo containers on tarmac
  'https://images.pexels.com/photos/804475/pexels-photo-804475.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',   // Cargo plane from below, taking off
];


const LogoutScreen: React.FC<LogoutScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, LOGOUT_DURATION);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="logout-screen-container">
      <div className="logout-bg">
        {LOGOUT_BACKGROUND_IMAGES.map((url, index) => (
          <div
            key={index}
            className="logout-bg-slide"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
      <div className="logout-content">
        <div className="logout-icon-container">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" stroke="#22c55e" strokeWidth="4" className="checkmark-circle" />
            <path d="M24 41.5L36.5 54L58 32.5" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="checkmark-check" />
          </svg>
        </div>
        <h1 className="logout-title">Thank You!</h1>
        <p className="logout-message">
          Your session has been securely logged out. We appreciate your business and look forward to serving you again.
        </p>
        <div className="logout-progress-bar-container">
          <div className="logout-progress-bar" />
        </div>
        <button className="logout-home-button" onClick={onComplete}>
          Return Home Now
        </button>
      </div>
    </div>
  );
};

export default LogoutScreen;