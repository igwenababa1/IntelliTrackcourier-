import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const VERIFICATION_STEPS = [
  "Verifying Tracking ID...",
  "Accessing Encrypted Shipment Records...",
  "Cross-referencing Global Customs Data...",
  "Finalizing Secure Tracking Report..."
];

const STEP_DURATION = 1200; // ms

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
          // Add a small delay after the last step before completing
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
    return <div style={{ width: '20px', height: '20px' }}></div>; // Placeholder
  };

  return (
    <div className="generating-report-container">
      <h2 className="report-title">Generating Secure Shipment Report</h2>
      <ul className="report-steps">
        {VERIFICATION_STEPS.map((step, index) => (
          <li
            key={index}
            className={`report-step ${index <= currentStep ? 'visible' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="report-step-icon">
              {getStepIcon(index)}
            </div>
            <span className="report-step-text">
              {step}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GeneratingReportScreen;
