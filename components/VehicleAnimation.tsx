import React from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto 1.5rem',
    overflow: 'hidden',
  },
  svg: {
    width: '100%',
    height: 'auto',
  },
};

const keyframes = `
  @keyframes drive {
    from { transform: translateX(-150px); }
    to { transform: translateX(450px); }
  }
  @keyframes move-lines {
    from { transform: translateX(0); }
    to { transform: translateX(-100px); }
  }
`;

const TRUCK_SVG = (
  <g transform="translate(0 2)">
    <path fill="#4f46e5" d="M42,23H7a1,1,0,0,1-1-1V9A1,1,0,0,1,7,8H36.22a1,1,0,0,1,.73.34l5.36,6.25A1,1,0,0,1,43,15.2V22A1,1,0,0,1,42,23Z" />
    <path fill="#a5b4fc" d="M35,23H17a1,1,0,0,1-1-1V9a1,1,0,0,1,1-1H35Z" />
    <circle fill="#1f2937" cx="13" cy="24" r="4" />
    <circle fill="#e5e7eb" cx="13" cy="24" r="1.5" />
    <circle fill="#1f2937" cx="35" cy="24" r="4" />
    <circle fill="#e5e7eb" cx="35"cy="24" r="1.5" />
  </g>
);

const VehicleAnimation: React.FC = () => {
  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      <svg viewBox="0 0 300 50" xmlns="http://www.w3.org/2000/svg" style={styles.svg}>
        {/* Road */}
        <path d="M-50 32 H350" stroke="#4b5563" strokeWidth="10" />
        
        {/* Dashed Lines */}
        <g style={{ animation: 'move-lines 3s linear infinite' }}>
          <path d="M-50 32 H450" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="20, 30" />
        </g>

        {/* Truck */}
        <g style={{ animation: 'drive 8s linear infinite' }}>
          {TRUCK_SVG}
        </g>
      </svg>
    </div>
  );
};

export default VehicleAnimation;
