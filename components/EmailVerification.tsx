import React, { useState, useRef, useEffect } from 'react';

interface EmailVerificationProps {
  onVerify: () => void;
  userEmail: string;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

const EmailVerification: React.FC<EmailVerificationProps> = ({ onVerify, userEmail }) => {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Fix: `setTimeout` returns a number in browsers, not a NodeJS.Timeout.
    let timer: ReturnType<typeof setTimeout>;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    // Focus the first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== '' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move focus back on backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pastedData)) return; // Only paste if it's all digits

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
        if (i < OTP_LENGTH) {
            newOtp[i] = pastedData[i];
        }
    }
    setOtp(newOtp);
    inputRefs.current[pastedData.length - 1]?.focus();
  };

  const handleResendCode = () => {
    console.log("Resending verification code...");
    setResendTimer(RESEND_COOLDOWN);
    setOtp(new Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    // In a real app, you would trigger the API to resend the code here
  };
  
  const isFormComplete = otp.every(digit => digit !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormComplete) {
      console.log("Verifying OTP:", otp.join(''));
      onVerify(); // In this mock, any complete code is accepted
    }
  };

  return (
    <div className="email-verification-container">
      <video
        id="verification-video-bg"
        src="https://videos.pexels.com/video-files/5495856/5495856-hd_1920_1080_25fps.mp4"
        autoPlay
        loop
        muted
        playsInline
      ></video>
      <div className="verification-content">
        <h1 className="verification-title">Verify Your Shipment</h1>
        <p className="verification-subtitle">
          For your security, a 6-digit verification code has been sent to <strong>{userEmail}</strong>. Please enter it below.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((data, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                className="otp-input"
                type="text"
                name="otp"
                maxLength={1}
                value={data}
                onChange={e => handleChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
              />
            ))}
          </div>
          <button
            className="verification-button"
            type="submit"
            disabled={!isFormComplete}
          >
            Verify & Track
          </button>
        </form>
        <p className="resend-code-text">
          Didn't receive the code?{' '}
          <button
            className="resend-code-button"
            onClick={handleResendCode}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;