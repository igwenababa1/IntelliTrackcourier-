

import React, { useState, useEffect, useCallback } from 'react';
import { PackageDetails, NewShipmentData, Notification } from './types';
import { getShipmentDetails, createShipment, addDeliveryEvidence } from './services/shipmentService';
import { initializeChat } from './services/geminiService';
import { simulateNextEvent } from './services/shipmentSimulator';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import TrackingDisplay from './components/TrackingDisplay';
import TrackingDisplaySkeleton from './components/TrackingDisplaySkeleton';
import QRCodeScanner from './components/QRCodeScanner';
import ChatAssistant from './components/ChatAssistant';
import LogoutConfirmation from './components/LogoutConfirmation';
import LogoutWarning from './components/LogoutWarning';
import LogoutScreen from './components/LogoutScreen';
import VoiceCommandButton, { VoiceCommand } from './components/VoiceCommandButton';
import TrackingBackground from './components/TrackingBackground';
import CreateShipment from './components/CreateShipment';
import useSound from './hooks/useSound';
import { SUCCESS_SOUND } from './components/sounds';
import AppBackground from './components/AppBackground';
import LandingPage from './components/LandingPage';
import PackageIntroAnimation from './components/PackageIntroAnimation';
import EmailVerification from './components/EmailVerification';
import Footer from './components/Footer';
import GeneratingReportScreen from './components/GeneratingReportScreen';

type AppState = 'landing' | 'intro_animation' | 'welcome' | 'generating_report' | 'tracking' | 'error' | 'create_shipment' | 'email_verification' | 'logging_out';

const LOGOUT_COUNTDOWN_SECONDS = 5;

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState('');
  
  // Logout states
  const [isLogoutWarningVisible, setIsLogoutWarningVisible] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(LOGOUT_COUNTDOWN_SECONDS);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotifiedStatus, setLastNotifiedStatus] = useState<string | null>(null);


  // Sound effect
  const [playSuccessSound] = useSound(SUCCESS_SOUND, 0.5);
  
  // Check for first visit in session
  useEffect(() => {
      if (sessionStorage.getItem('hasVisited')) {
          setAppState('welcome');
      } else {
          setAppState('landing');
      }
  }, []);
  
  // Countdown timer effect for logout warning
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLogoutWarningVisible && logoutCountdown > 0) {
      timer = setTimeout(() => {
        setLogoutCountdown(prev => prev - 1);
      }, 1000);
    } else if (isLogoutWarningVisible && logoutCountdown === 0) {
      setIsLogoutWarningVisible(false);
      setIsLogoutConfirmOpen(true);
    }
    return () => clearTimeout(timer);
  }, [isLogoutWarningVisible, logoutCountdown]);

  const addNotification = (title: string, message: string) => {
    const newNotification: Notification = {
        id: Date.now(),
        title,
        message,
        timestamp: new Date(),
        read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAllNotificationsAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const handleProceedFromLanding = () => {
    sessionStorage.setItem('hasVisited', 'true');
    setAppState('intro_animation');
  };

  const handleIntroAnimationComplete = () => {
    setAppState('welcome');
  };
  
  const handleReportGenerationComplete = useCallback(async () => {
    setIsLoading(true);
    setAppState('tracking'); // Move to tracking screen to show skeleton
    
    try {
      const details = await getShipmentDetails(trackingId);
      if (details) {
        playSuccessSound();
        setPackageDetails(details);
        initializeChat(details.id);
        setLastNotifiedStatus(details.status);
      } else {
        setError(`No shipment found for Tracking ID: ${trackingId}. Please check the ID and try again.`);
        setAppState('error');
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again later.');
      setAppState('error');
    } finally {
      setIsLoading(false);
    }
  }, [trackingId, playSuccessSound]);


  const handleTrack = useCallback(async (id: string) => {
    if (!id) return;
    setError(null);
    setTrackingId(id);
    setPackageDetails(null); 
    setAppState('generating_report');
  }, []);


  // Live simulation effect for package updates
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (appState === 'tracking' && packageDetails && packageDetails.status !== 'Delivered') {
      interval = setInterval(() => {
        setPackageDetails(prevDetails => {
          if (prevDetails) {
            const updatedDetails = simulateNextEvent(prevDetails);
            // Check if status changed to send a notification
            if (updatedDetails.status !== lastNotifiedStatus) {
                addNotification(`Status Update: ${updatedDetails.status}`, `Your package ${updatedDetails.id} is now at ${updatedDetails.history[0].location}.`);
                setLastNotifiedStatus(updatedDetails.status);
            }
            return updatedDetails;
          }
          return null;
        });
      }, 7000); // Update every 7 seconds
    }
    return () => clearInterval(interval);
  }, [appState, packageDetails, lastNotifiedStatus]);
  
  const handleAddEvidence = (type: 'photo' | 'signature' | 'audio', data: string) => {
    if (packageDetails) {
        const updatedDetails = addDeliveryEvidence(packageDetails.id, type, data);
        setPackageDetails(updatedDetails);
    }
  };


  const handleGoToCreateShipment = () => {
    setError(null);
    setAppState('create_shipment');
  };

  const handleCreateShipment = async (data: NewShipmentData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPackage = await createShipment(data);
      setPackageDetails(newPackage);
      setTrackingId(newPackage.id);
      addNotification('Shipment Created!', `Your new shipment ${newPackage.id} is ready. Awaiting verification.`);
      setAppState('email_verification');
      playSuccessSound();
    } catch (e) {
      setError('Could not create shipment. Please try again.');
      setAppState('create_shipment'); // stay on the form page on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerificationSuccess = () => {
    if (packageDetails) {
      addNotification('Shipment Verified', `Shipment ${packageDetails.id} has been confirmed and is being processed.`);
      setAppState('tracking');
      initializeChat(packageDetails.id);
    } else {
      // Fallback in case packageDetails is somehow null
      resetToHome();
    }
  };


  const handleScan = () => {
    setIsScanning(true);
  };
  
  const handleScanComplete = (id: string) => {
    setIsScanning(false);
    handleTrack(id);
  };

  const resetToHome = () => {
    setAppState('welcome');
    setPackageDetails(null);
    setTrackingId('');
    setError(null);
    setIsLoading(false);
  };

  const handleShowChat = (prompt: string = '') => {
      setChatInitialPrompt(prompt || 'Hello! How can I help you with your shipment?');
      setIsChatOpen(true);
  }
  
  const handleStartLogout = () => {
    setLogoutCountdown(LOGOUT_COUNTDOWN_SECONDS);
    setIsLogoutWarningVisible(true);
    setIsLogoutConfirmOpen(false);
  };

  const handleCancelLogout = () => {
    setIsLogoutWarningVisible(false);
    setLogoutCountdown(LOGOUT_COUNTDOWN_SECONDS);
  };
  
  const handleConfirmLogout = () => {
      console.log("Logging out...");
      setIsLogoutConfirmOpen(false);
      setAppState('logging_out');
  }

  const handleVoiceCommand = (command: VoiceCommand) => {
    console.log("Voice command received:", command);
    switch (command.command) {
      case 'track':
        if (command.payload) {
          handleTrack(command.payload);
        }
        break;
      case 'go_home':
        resetToHome();
        break;
      case 'log_out':
        handleStartLogout();
        break;
      // Add cases for other commands if needed
    }
  };

  const renderContent = () => {
    if (isScanning) {
        return <QRCodeScanner onScan={handleScanComplete} onClose={() => setIsScanning(false)} />;
    }

    switch (appState) {
      case 'landing':
        return <LandingPage onProceed={handleProceedFromLanding} />;
      case 'intro_animation':
        return <PackageIntroAnimation onAnimationComplete={handleIntroAnimationComplete} />;
      case 'generating_report':
        return <GeneratingReportScreen onComplete={handleReportGenerationComplete} />;
      case 'tracking':
        if (isLoading || !packageDetails) {
            return <TrackingDisplaySkeleton />;
        }
        return <TrackingDisplay packageDetails={packageDetails} onNewSearch={resetToHome} onShowChat={handleShowChat} setPackageDetails={setPackageDetails} onAddEvidence={handleAddEvidence} />;
      case 'create_shipment':
        return <CreateShipment onCreateShipment={handleCreateShipment} isLoading={isLoading} />;
      case 'email_verification':
        return <EmailVerification onVerify={handleVerificationSuccess} userEmail={packageDetails?.destination.name || 'your email'}/>
      case 'logging_out':
        return <LogoutScreen onComplete={resetToHome} />;
      case 'error':
        return (
          <WelcomeScreen
            onTrack={handleTrack}
            onScan={handleScan}
            isLoading={isLoading}
            initialTrackingId={trackingId}
          />
        );
      case 'welcome':
      default:
        return (
          <WelcomeScreen
            onTrack={handleTrack}
            onScan={handleScan}
            isLoading={isLoading}
            initialTrackingId={trackingId}
          />
        );
    }
  };

  const isWelcomeState = appState === 'welcome' || appState === 'error';
  const showHeader = appState !== 'landing' && appState !== 'intro_animation' && appState !== 'logging_out';

  return (
    <div className={`app-container state-${appState}`}>
       {isWelcomeState && <AppBackground />}
       {appState === 'tracking' && <TrackingBackground />}
      
       {showHeader && <Header 
        onHomeClick={resetToHome}
        onNewShipmentClick={handleGoToCreateShipment}
        onTrackClick={() => appState === 'tracking' || appState === 'generating_report' ? {} : handleTrack(trackingId || 'IT123456789')}
        supportEmail="support@intellitrack.dev"
        onLogoutClick={handleStartLogout}
        appState={appState}
        onChatClick={() => handleShowChat()}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        onMarkNotificationsRead={markAllNotificationsAsRead}
       />}
      <main className={!showHeader ? "" : "main-content"}>
        {error && !isWelcomeState && <div className="error-banner">{error}</div>}
        {renderContent()}
      </main>

      <ChatAssistant 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPrompt={chatInitialPrompt}
      />
      <LogoutWarning
        isVisible={isLogoutWarningVisible}
        countdown={logoutCountdown}
        onCancel={handleCancelLogout}
      />
      <LogoutConfirmation 
        isOpen={isLogoutConfirmOpen}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
      {showHeader && <VoiceCommandButton onCommand={handleVoiceCommand} appState={appState === 'tracking' ? 'tracking' : 'welcome'} />}
      {showHeader && <Footer />}
    </div>
  );
};

export default App;