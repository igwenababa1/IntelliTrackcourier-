import React from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '500px',
    padding: '2rem 0',
  },
  stage: {
    flex: 1,
    textAlign: 'center',
    color: 'var(--text-secondary-color)',
    transition: 'color 0.5s',
  },
  stageActive: {
    color: 'white',
    fontWeight: 600,
  },
  line: {
    flexGrow: 1,
    height: '2px',
    backgroundColor: 'var(--border-color)',
    position: 'relative',
  },
  lineFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'var(--primary-color)',
    transition: 'width 0.8s ease-in-out',
  }
};

const STAGES = ["On Its Way", "Arriving Soon", "Delivered"];

interface ZenProgressBarProps {
  status: string;
}

const ZenProgressBar: React.FC<ZenProgressBarProps> = ({ status }) => {
  const getActiveStageIndex = () => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 2;
    if (s.includes('out for delivery')) return 1;
    return 0;
  };

  const activeIndex = getActiveStageIndex();
  const fillPercentage = (activeIndex / (STAGES.length - 1)) * 100;

  return (
    <div style={styles.container}>
      <div style={{ ...styles.stage, ...(activeIndex >= 0 ? styles.stageActive : {}) }}>
        {STAGES[0]}
      </div>
      <div style={styles.line}>
        <div style={{...styles.lineFill, width: `${fillPercentage}%`}}></div>
      </div>
      <div style={{ ...styles.stage, ...(activeIndex >= 1 ? styles.stageActive : {}) }}>
        {STAGES[1]}
      </div>
      <div style={styles.line}>
         <div style={{...styles.lineFill, width: activeIndex === 2 ? `100%` : `0%`}}></div>
      </div>
      <div style={{ ...styles.stage, ...(activeIndex === 2 ? styles.stageActive : {}) }}>
        {STAGES[2]}
      </div>
    </div>
  );
};

export default ZenProgressBar;
