import React, { useState, useEffect, useCallback } from 'react';
import { PackageDetails, NewShipmentData, Notification } from './types';
import { getShipmentDetails, createShipment, addDeliveryEvidence } from './services/shipmentService';
import { initializeChat, analyzeFeedback } from './services/geminiService';
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
import FeedbackModal from './components/FeedbackModal';
import UserProfile from './components/UserProfile';
import { DeliveryConfirmationEmail, CustomsHoldEmail } from './components/EmailNotifications';
import BottomNav from './components/BottomNav';

type AppState = 'landing' | 'intro_animation' | 'welcome' | 'generating_report' | 'tracking' | 'error' | 'create_shipment' | 'email_verification' | 'logging_out' | 'profile';

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
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotifiedStatus, setLastNotifiedStatus] = useState<string | null>(null);
  
  // Simulated Email Notification State
  const [showDeliveryEmailForPackage, setShowDeliveryEmailForPackage] = useState<PackageDetails | null>(null);
  const [showCustomsHoldEmailForPackage, setShowCustomsHoldEmailForPackage] = useState<PackageDetails | null>(null);


  // Sound effect
  const [playSuccessSound] = useSound(SUCCESS_SOUND, 0.5);
  
  // Apply theme from localStorage on initial load
  useEffect(() => {
    const storedTheme = localStorage.getItem('intellitrack-theme-color');
    if (storedTheme) {
      document.documentElement.style.setProperty('--primary-color', storedTheme);
    }
  }, []);
  
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
        id: Date.now() + Math.random(),
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
        initializeChat(details);
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
    if (appState === 'tracking' && packageDetails && !packageDetails.status.toLowerCase().includes('delivered')) {
      interval = setInterval(() => {
        setPackageDetails(prevDetails => {
          if (prevDetails) {
            const updatedDetails = simulateNextEvent(prevDetails);
            const newStatus = updatedDetails.status.toLowerCase();
            const oldStatus = lastNotifiedStatus?.toLowerCase();

            // Check if status changed to send a notification
            if (newStatus !== oldStatus) {
                addNotification(`Status Update: ${updatedDetails.status}`, `Your package ${updatedDetails.id} is now at ${updatedDetails.history[0].location}.`);
                setLastNotifiedStatus(updatedDetails.status);
                
                // Trigger email modals on specific status changes
                if (newStatus.includes('delivered')) {
                    setShowDeliveryEmailForPackage(updatedDetails);
                } else if (newStatus.includes('held by customs')) {
                    setShowCustomsHoldEmailForPackage(updatedDetails);
                }
            }
            return updatedDetails;
          }
          return null;
        });
      }, 4000); // Faster update for demo purposes
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

  const handleGoToProfile = () => {
    setError(null);
    setAppState('profile');
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
      initializeChat(packageDetails);
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

  const handleSubmitFeedback = async (feedback: { rating: number; category: string; comment: string }) => {
    console.log("Submitting feedback:", feedback);
    try {
      const analysis = await analyzeFeedback(feedback);
      console.log("Gemini Feedback Analysis:", analysis);
      // In a real app, you would save this analysis to your database
      addNotification('Feedback Received', `AI analysis summary: "${analysis.summary}"`);
    } catch (error) {
      console.error("Failed to process feedback:", error);
      addNotification('Feedback Error', 'There was an issue submitting your feedback.');
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
        return <EmailVerification onVerify={handleVerificationSuccess} userEmail={packageDetails?.destination.email || 'your email'}/>
      case 'profile':
        return <UserProfile userEmail="info@lawrenceconsultantsorg.org" />
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
        onTrackClick={() => appState === 'tracking' || appState === 'generating_report' ? {} : handleTrack(trackingId || 'ITK-9X81-GBL-774A')}
        supportEmail="support@intellitrack.dev"
        onLogoutClick={handleStartLogout}
        appState={appState}
        onChatClick={() => handleShowChat()}
        onFeedbackClick={() => setIsFeedbackModalOpen(true)}
        onProfileClick={handleGoToProfile}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        onMarkNotificationsRead={markAllNotificationsAsRead}
       />}
      <main className={!showHeader ? "" : "main-content"}>
        {error && !isWelcomeState && <div className="error-banner">{error}</div>}
        {renderContent()}
      </main>
      
      {showDeliveryEmailForPackage && (
          <DeliveryConfirmationEmail
            details={showDeliveryEmailForPackage}
            onClose={() => setShowDeliveryEmailForPackage(null)}
            onViewEvidence={() => {
                setShowDeliveryEmailForPackage(null);
                // In a real app, you might deep-link to the vault. Here, we just close.
            }}
            onLeaveFeedback={() => {
                setShowDeliveryEmailForPackage(null);
                setIsFeedbackModalOpen(true);
            }}
          />
      )}
      
      {showCustomsHoldEmailForPackage && (
        <CustomsHoldEmail
            details={showCustomsHoldEmailForPackage}
            onClose={() => setShowCustomsHoldEmailForPackage(null)}
            onContactSupport={() => {
                setShowCustomsHoldEmailForPackage(null);
                handleShowChat(`I have a question about my shipment ${showCustomsHoldEmailForPackage.id} which is being held by customs.`);
            }}
        />
      )}

      <ChatAssistant 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPrompt={chatInitialPrompt}
        packageDetails={packageDetails}
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
       <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleSubmitFeedback}
      />
      {/* The StreetViewModal is managed within TrackingDisplay, so no state is needed here */}
      {showHeader && <VoiceCommandButton onCommand={handleVoiceCommand} appState={appState === 'tracking' ? 'tracking' : 'welcome'} />}
      {showHeader && (
        <BottomNav 
          currentView={appState === 'create_shipment' ? 'create' : appState === 'tracking' ? 'tracking' : 'home'}
          onNavigate={(view) => {
            if (view === 'home') resetToHome();
            if (view === 'create') handleGoToCreateShipment();
            if (view === 'tracking') {
              if (trackingId) handleTrack(trackingId);
              else handleTrack('ITK-9X81-GBL-774A');
            }
          }}
          onShowChat={() => handleShowChat()}
        />
      )}
      {showHeader && <Footer />}
    </div>
  );
};

export default App;