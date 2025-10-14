// Fix: Populate the contents of App.tsx
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TrackingDisplay from './components/TrackingDisplay';
import GeneratingReportScreen from './components/GeneratingReportScreen';
import Header from './components/Header';
import AppBackground from './components/AppBackground';
import QRCodeScanner from './components/QRCodeScanner';
import ChatAssistant from './components/ChatAssistant';
import LogoutConfirmation from './components/LogoutConfirmation';
import { getShipmentDetails } from './services/shipmentService';
import { initializeChat } from './services/geminiService';
import { PackageDetails } from './types';
import VoiceCommandButton, { VoiceCommand } from './components/VoiceCommandButton';
import useSound from './hooks/useSound';
import { SUCCESS_SOUND, COMMAND_SOUND } from './components/sounds';

type AppState = 'welcome' | 'generating_report' | 'tracking' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [trackingId, setTrackingId] = useState<string>('');
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  const [playSuccess] = useSound(SUCCESS_SOUND);
  const [playCommand] = useSound(COMMAND_SOUND);

  useEffect(() => {
    // Initialize chat with no specific package ID initially
    initializeChat(null);
  }, []);

  const handleTrack = async (id: string) => {
    setTrackingId(id);
    setAppState('generating_report');
    setError(null);
    try {
      const details = await getShipmentDetails(id);
      if (details) {
        setPackageDetails(details);
        initializeChat(details.id); // Re-initialize chat with package context
        setAppState('tracking');
        playSuccess();
      } else {
        setError(`No shipment found for Tracking ID: ${id}`);
        setAppState('error');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      setAppState('error');
    }
  };

  const handleScan = () => {
    setIsScanning(true);
  };
  
  const handleScanComplete = (id: string) => {
    setIsScanning(false);
    handleTrack(id);
  };

  const handleNewSearch = () => {
    setPackageDetails(null);
    setTrackingId('');
    setError(null);
    initializeChat(null);
    setAppState('welcome');
  };
  
  const handleVoiceCommand = (command: VoiceCommand) => {
    playCommand();
    switch (command.command) {
      case 'track':
        if (command.payload) {
          handleTrack(command.payload);
        }
        break;
      case 'go_home':
        handleNewSearch();
        break;
      case 'log_out':
        setIsLogoutConfirmOpen(true);
        break;
      // Other commands could be handled here for the 'tracking' state
      default:
        console.log("Received command for different state:", command);
    }
  };
  
  const handleLogout = () => {
      // In a real app, this would clear tokens, etc.
      console.log("User logged out.");
      setIsLogoutConfirmOpen(false);
      handleNewSearch(); // Reset to welcome screen
  }

  const renderContent = () => {
    switch (appState) {
      case 'generating_report':
        return <GeneratingReportScreen onComplete={() => {}} />;
      case 'tracking':
        return packageDetails ? <TrackingDisplay details={packageDetails} onNewSearch={handleNewSearch} /> : null;
      case 'error':
        // Display error on the welcome screen
        return (
          <>
            <WelcomeScreen onTrack={handleTrack} onScan={handleScan} isLoading={false} />
            {error && <p style={{ color: '#f87171', textAlign: 'center', marginTop: '-1rem' }}>{error}</p>}
          </>
        );
      case 'welcome':
      default:
        return <WelcomeScreen onTrack={handleTrack} onScan={handleScan} isLoading={false} initialTrackingId={trackingId} />;
    }
  };

  return (
    <div className="app-container">
      <AppBackground />
      <Header 
        onHomeClick={handleNewSearch} 
        onTrackClick={() => appState !== 'tracking' && appState !== 'generating_report' && setAppState('welcome')}
        supportEmail="support@intellitrack.dev"
        onLogoutClick={() => setIsLogoutConfirmOpen(true)}
        appState={appState}
        onChatClick={() => setIsChatOpen(true)}
      />
      <main className="main-content">
        {renderContent()}
      </main>
      
      {isScanning && <QRCodeScanner onScan={handleScanComplete} onClose={() => setIsScanning(false)} />}
      
      <ChatAssistant 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        initialPrompt={packageDetails ? `Hello! How can I help you with shipment ${packageDetails.id}?` : "Hello! How can I assist you with your shipment today?"}
      />
      
      <LogoutConfirmation 
        isOpen={isLogoutConfirmOpen}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      <VoiceCommandButton onCommand={handleVoiceCommand} appState={appState === 'tracking' ? 'tracking' : 'welcome'} />
    </div>
  );
};

export default App;
