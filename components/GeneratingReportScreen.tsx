import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const VERIFICATION_STEPS = [
  "Verifying Tracking ID...",
  "Accessing Encrypted Shipment Records...",
  "Cross-referencing Global Customs Data...",
  "Finalizing Secure Tracking Report..."
];

const REPORT_BACKGROUND_IMAGES = [
  'https://images.pexels.com/photos/1089306/pexels-photo-1089306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Plane arriving
  'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',   // Crane loading ship
  'https://images.pexels.com/photos/4614165/pexels-photo-4614165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Cargo plane landing
  'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Container Ship at Port
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
       <div className="report-bg">
            {REPORT_BACKGROUND_IMAGES.map((url, index) => (
                <div
                    key={index}
                    className="report-bg-slide"
                    style={{ backgroundImage: `url(${url})` }}
                />
            ))}
        </div>
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