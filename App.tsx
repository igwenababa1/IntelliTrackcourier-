import React, { useState, useEffect, useCallback } from 'react';
import { PackageDetails, NewShipmentData } from './types';
import { getShipmentDetails, createShipment } from './services/shipmentService';
import { initializeChat } from './services/geminiService';
import { simulateNextEvent } from './services/shipmentSimulator';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import TrackingDisplay from './components/TrackingDisplay';
import GeneratingReportScreen from './components/GeneratingReportScreen';
import QRCodeScanner from './components/QRCodeScanner';
import ChatAssistant from './components/ChatAssistant';
import LogoutConfirmation from './components/LogoutConfirmation';
import LogoutWarning from './components/LogoutWarning';
import VoiceCommandButton, { VoiceCommand } from './components/VoiceCommandButton';
import TrackingBackground from './components/TrackingBackground';
import CreateShipment from './components/CreateShipment';
import useSound from './hooks/useSound';
import { SUCCESS_SOUND } from './components/sounds';
import AppBackground from './components/AppBackground';
import LandingPage from './components/LandingPage';

type AppState = 'landing' | 'welcome' | 'generating_report' | 'tracking' | 'error' | 'create_shipment';

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

  const handleProceedFromLanding = () => {
    sessionStorage.setItem('hasVisited', 'true');
    setAppState('welcome');
  };

  const handleTrack = useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setTrackingId(id);
    setAppState('generating_report');

    // Artificial delay for the "generating report" screen
    setTimeout(async () => {
      try {
        const details = await getShipmentDetails(id);
        if (details) {
          playSuccessSound();
          setPackageDetails(details);
          setAppState('tracking');
          initializeChat(details.id);
        } else {
          setError(`No shipment found for Tracking ID: ${id}. Please check the ID and try again.`);
          setAppState('error');
        }
      } catch (e) {
        setError('An unexpected error occurred. Please try again later.');
        setAppState('error');
      } finally {
        setIsLoading(false);
      }
    }, 8500); // Duration of the generating report animation
  }, [playSuccessSound]);

  // Live simulation effect for package updates
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (appState === 'tracking' && packageDetails && packageDetails.status !== 'Delivered') {
      interval = setInterval(() => {
        setPackageDetails(prevDetails => {
          if (prevDetails) {
            return simulateNextEvent(prevDetails);
          }
          return null;
        });
      }, 7000); // Update every 7 seconds
    }
    return () => clearInterval(interval);
  }, [appState, packageDetails]);

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
      setAppState('tracking');
      initializeChat(newPackage.id);
      playSuccessSound();
    } catch (e) {
      setError('Could not create shipment. Please try again.');
      setAppState('create_shipment'); // stay on the form page on error
    } finally {
      setIsLoading(false);
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
      // In a real app, you'd clear tokens, etc.
      resetToHome();
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
      case 'generating_report':
        return <GeneratingReportScreen onComplete={() => {}} />; // onComplete is handled by handleTrack timeout
      case 'tracking':
        return packageDetails ? <TrackingDisplay packageDetails={packageDetails} onNewSearch={resetToHome} onShowChat={handleShowChat} /> : null;
      case 'create_shipment':
        return <CreateShipment onCreateShipment={handleCreateShipment} isLoading={isLoading} />;
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
  const showHeader = appState !== 'landing';

  return (
    <div className={`app-container state-${appState}`}>
       {isWelcomeState && <AppBackground />}
       {appState === 'tracking' && <TrackingBackground />}
      
       {showHeader && <Header 
        onHomeClick={resetToHome}
        onNewShipmentClick={handleGoToCreateShipment}
        onTrackClick={() => appState === 'tracking' ? {} : handleTrack(trackingId || 'IT123456789')}
        supportEmail="support@intellitrack.dev"
        onLogoutClick={handleStartLogout}
        appState={appState}
        onChatClick={() => handleShowChat()}
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
    </div>
  );
};

export default App;