import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const VERIFICATION_STEPS = [
  "Verifying Tracking ID...",
  "Accessing Encrypted Shipment Records...",
  "Cross-referencing Global Customs Data...",
  "Finalizing Secure Tracking Report..."
];

const STEP_DURATION = 2000; // ms
const RING_RADIUS = 160; // in pixels

interface GeneratingReportScreenProps {
  onComplete: () => void;
}

const GeneratingReportScreen: React.FC<GeneratingReportScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prevStep => {
        if (prevStep < VERIFICATION_STEPS.length) {
          return prevStep + 1;
        } else {
          clearInterval(timer);
          // A short delay after the last checkmark appears before completing
          setTimeout(onComplete, 500);
          return prevStep;
        }
      });
    }, STEP_DURATION);

    return () => clearInterval(timer);
  }, [onComplete]);

  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      return <Icon name="check-circle" className="checkmark" />;
    }
    if (stepIndex === currentStep && currentStep < VERIFICATION_STEPS.length) {
      return <div className="spinner"></div>;
    }
    // Return a placeholder for future steps
    return <Icon name="file-text" />;
  };

  return (
    <div className="generating-report-container">
       <video 
            id="report-video-bg"
            src="https://videos.pexels.com/video-files/5789456/5789456-hd_1920_1080_25fps.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
        ></video>
        <div className="report-video-overlay"></div>

        <div className="report-content">
            <h2 className="report-title">Generating Secure Shipment Report</h2>
            <div className="report-progress-ring">
                <div className="progress-ring-base">
                    {VERIFICATION_STEPS.map((step, index) => {
                        const angle = index * (360 / VERIFICATION_STEPS.length);
                        const isCompleted = index < currentStep;
                        const isActive = index === currentStep && currentStep < VERIFICATION_STEPS.length;
                        
                        let nodeClasses = "report-step-node-icon";
                        if (isActive) nodeClasses += " active";
                        if (isCompleted) nodeClasses += " completed";

                        return (
                            <div 
                                key={index}
                                className="report-step-node"
                                style={{
                                    transform: `rotate(${angle}deg) translate(${RING_RADIUS}px) rotate(${-angle}deg)`
                                }}
                            >
                                <div className={nodeClasses}>
                                    {getStepIcon(index)}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="progress-center-text">
                    {currentStep < VERIFICATION_STEPS.length ? VERIFICATION_STEPS[currentStep] : 'Finalizing...'}
                </div>
            </div>
        </div>
    </div>
  );
};

export default GeneratingReportScreen;