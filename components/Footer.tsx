import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {currentYear} IntelliTrack Global Courier. All Rights Reserved.</p>
        <div className="footer-links">
          <a href="#/terms">Terms of Service</a>
          <span>|</span>
          <a href="#/privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;