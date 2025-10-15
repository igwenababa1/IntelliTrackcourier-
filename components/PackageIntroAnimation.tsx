import React, { useState, useEffect } from 'react';

interface PackageIntroAnimationProps {
  onAnimationComplete: () => void;
}

const PackageIntroAnimation: React.FC<PackageIntroAnimationProps> = ({ onAnimationComplete }) => {
  const [animationStage, setAnimationStage] = useState('');

  useEffect(() => {
    const sequence = [
      () => setAnimationStage('crack'),      // Start cracking after 1.5s (fly-in duration)
      () => setAnimationStage('burst'),     // Start bursting 1s after cracking
      () => onAnimationComplete(),        // Complete 1s after bursting
    ];

    setTimeout(sequence[0], 1500);
    setTimeout(sequence[1], 2500);
    setTimeout(sequence[2], 3500);

  }, [onAnimationComplete]);

  const boxClasses = `package-intro-box ${animationStage === 'crack' || animationStage === 'burst' ? 'crack' : ''}`;

  return (
    <div className="package-intro-overlay">
      <div className={boxClasses}>
        <div className="package-face front"></div>
        <div className="package-face back"></div>
        <div className="package-face left"></div>
        <div className="package-face right"></div>
        <div className="package-face top"></div>
        <div className="package-face bottom"></div>
      </div>
      {animationStage === 'burst' && <div className="light-burst" />}
    </div>
  );
};

export default PackageIntroAnimation;
