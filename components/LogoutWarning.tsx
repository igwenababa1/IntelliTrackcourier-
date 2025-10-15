import React from 'react';
import Icon from './Icon';

interface LogoutWarningProps {
  isVisible: boolean;
  countdown: number;
  onCancel: () => void;
}

const LOGOUT_TOTAL_SECONDS = 5;

const LogoutWarning: React.FC<LogoutWarningProps> = ({ isVisible, countdown, onCancel }) => {
  if (!isVisible) {
    return null;
  }

  const progressPercentage = (countdown / LOGOUT_TOTAL_SECONDS) * 100;

  return (
    <div className="logout-warning-toast" role="alert" aria-live="assertive">
      <div className="logout-warning-icon">
        <Icon name="alert-triangle" />
      </div>
      <div className="logout-warning-content">
        <p>You will be logged out in {countdown} seconds...</p>
        <span>Your session is about to end for security reasons.</span>
      </div>
      <button className="logout-warning-cancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <div 
        className="logout-warning-progress" 
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

export default LogoutWarning;