import React, { useState, useRef, useCallback, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TrackingDisplay, { TrackingDisplayHandle } from './components/TrackingDisplay';
import { PackageDetails, TrackingEvent, Address } from './types';
import AppBackground from './components/AppBackground';
import VoiceCommandButton, { VoiceCommand } from './components/VoiceCommandButton';
import ChatAssistant from './components/ChatAssistant';
import Header from './components/Header';
import useSound from './hooks/useSound';
import GeneratingReportScreen from './components/GeneratingReportScreen';
import TrackingBackground from './components/TrackingBackground';
import { SUCCESS_SOUND, COMMAND_SOUND } from './components/sounds';

const allPossibleEvents: TrackingEvent[] = [
  { date: 'June 23, 2024 - 02:00 PM', status: 'Picked Up', location: 'Los Angeles, CA', locationCoords: { lat: 34.0522, lng: -118.2437 } },
  { date: 'June 24, 2024 - 03:00 AM', status: 'Departed Facility', location: 'Los Angeles, CA', locationCoords: { lat: 34.0522, lng: -118.2437 } },
  { date: 'June 25, 2024 - 09:00 PM', status: 'Arrived at Hub', location: 'Denver, CO', locationCoords: { lat: 39.7392, lng: -104.9903 } },
  { date: 'June 26, 2024 - 10:00 AM', status: 'Processing at Sort Facility', location: 'Chicago, IL', locationCoords: { lat: 41.8781, lng: -87.6298 } },
  { date: 'June 27, 2024 - 02:00 PM', status: 'Departed Hub', location: 'Chicago, IL', locationCoords: { lat: 41.8781, lng: -87.6298 } },
  { date: 'June 28, 2024 - 08:00 AM', status: 'Arrived at Local Facility', location: 'New York, NY', locationCoords: { lat: 40.7128, lng: -74.0060 } },
  { date: 'June 28, 2024 - 09:30 AM', status: 'Out for Delivery', location: 'New York, NY', locationCoords: { lat: 40.7128, lng: -74.0060 } },
  { date: 'June 28, 2024 - 01:45 PM', status: 'Delivered', location: 'New York, NY', locationCoords: { lat: 40.7128, lng: -74.0060 } },
];

const SUPPORT_EMAIL = 'support@intellitrack.com';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'welcome' | 'generating_report' | 'tracking' | 'error'>('welcome');
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatPrompt, setChatPrompt] = useState<string>('');
  const [recentShipments, setRecentShipments] = useState<string[]>([]);

  const [playTrackSuccess] = useSound(SUCCESS_SOUND, 0.5);
  const [playVoiceCommand] = useSound(COMMAND_SOUND, 0.6);

  const trackingDisplayRef = useRef<TrackingDisplayHandle>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedShipments = localStorage.getItem('recentShipments');
      if (storedShipments) {
        setRecentShipments(JSON.parse(storedShipments));
      }
    } catch (error) {
      console.error("Failed to parse recent shipments from localStorage", error);
      setRecentShipments([]);
    }
  }, []);

  useEffect(() => {
    if (appState === 'tracking' && !packageDetails) {
      console.error("Correcting inconsistent state: 'tracking' state without package details.");
      setError('An unexpected error occurred while loading package details.');
      setAppState('error');
    }
  }, [appState, packageDetails]);
  
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (appState === 'tracking' && packageDetails?.status !== 'Delivered') {
      pollingIntervalRef.current = window.setInterval(() => {
        setPackageDetails(currentDetails => {
          if (!currentDetails || currentDetails.status === 'Delivered') {
            stopPolling();
            return currentDetails;
          }

          const currentHistoryLength = currentDetails.history.length;
          if (currentHistoryLength < allPossibleEvents.length) {
            const nextEvent = allPossibleEvents[currentHistoryLength];
            const updatedHistory = [...currentDetails.history, nextEvent];
            const updatedStatus = nextEvent.status;

            if (updatedStatus === 'Delivered') {
              stopPolling();
            }

            return {
              ...currentDetails,
              history: updatedHistory,
              status: updatedStatus,
            };
          } else {
            stopPolling();
            return currentDetails;
          }
        });
      }, 30000);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [appState, packageDetails?.status]);
  
  const addRecentShipment = (id: string) => {
    setRecentShipments(prev => {
      const filtered = prev.filter(shipmentId => shipmentId.toLowerCase() !== id.toLowerCase());
      const updated = [id, ...filtered];
      const final = updated.slice(0, 5);
      try {
        localStorage.setItem('recentShipments', JSON.stringify(final));
      } catch (error) {
        console.error("Failed to save recent shipments to localStorage", error);
      }
      return final;
    });
  };

  const handleTrack = useCallback((id: string) => {
    setIsExiting(true);
    setTimeout(() => {
      setError(null);
      setPackageDetails(null);
      
      if (id.toUpperCase() === 'INVALID-ID') {
        setError('Invalid tracking ID. Please try again.');
        setAppState('error');
        setIsExiting(false);
      } else {
        addRecentShipment(id);
        playTrackSuccess();
        const initialHistory = allPossibleEvents.slice(0, 3);
        const mockData: PackageDetails = {
          id: id,
          status: initialHistory[initialHistory.length - 1].status,
          estimatedDelivery: 'June 28, 2024',
          origin: {
            name: 'IntelliTrack Fulfillment',
            street: '123 Logistics Lane',
            cityStateZip: 'Los Angeles, CA 90001',
            country: 'USA'
          },
          destination: {
            name: 'Jane Doe',
            street: '456 Recipient Road, Apt 7B',
            cityStateZip: 'New York, NY 10001',
            country: 'USA'
          },
          contents: 'A limited edition pair of designer sneakers in a vibrant box',
          deliveryPreference: 'Leave at door',
          availableDeliveryOptions: ['Leave at door', 'Signature required', 'Hold at location'],
          history: initialHistory,
        };
        setPackageDetails(mockData);
        setAppState('generating_report');
      }
    }, 500);
  }, [playTrackSuccess]);

  const handleReportGenerationComplete = useCallback(() => {
    setAppState('tracking');
  }, []);

  const handleGoHome = useCallback(() => {
    if (appState === 'welcome' || appState === 'error') return;
    setAppState('welcome');
    setError(null);
    setPackageDetails(null);
    setIsExiting(false);
  }, [appState]);

  const handleTrackClick = useCallback(() => {
    if(appState === 'tracking') {
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [appState]);

  const handleCommand = useCallback((command: VoiceCommand) => {
    playVoiceCommand();
    switch (command.command) {
      case 'track':
        if (command.payload) {
          handleTrack(command.payload);
        }
        break;
      case 'show_details':
        trackingDisplayRef.current?.scrollToDetails();
        break;
      case 'cancel_shipment':
        setChatPrompt(
          `You've requested to cancel the shipment for package ID: ${packageDetails?.id}. Please provide a reason below, and a customer service agent will review your request.`
        );
        setIsChatOpen(true);
        break;
    }
  }, [packageDetails, handleTrack, playVoiceCommand]);

  const renderContent = () => {
    const commonContainerStyle = appState === 'tracking' ? { maxWidth: '1200px' } : { maxWidth: '600px' };

    return (
      <div className="app-container" style={commonContainerStyle} ref={topRef}>
        {appState === 'generating_report' && <GeneratingReportScreen onComplete={handleReportGenerationComplete} />}
        {appState === 'tracking' && packageDetails && (
          <TrackingDisplay ref={trackingDisplayRef} details={packageDetails} />
        )}
        {(appState === 'welcome' || appState === 'error') && (
           <WelcomeScreen 
              onTrack={handleTrack} 
              error={error} 
              isExiting={isExiting}
              recentShipments={recentShipments}
              onRetrack={handleTrack}
            />
        )}
      </div>
    );
  };
  
  const currentVoiceState = appState === 'tracking' ? 'tracking' : 'welcome';

  return (
    <>
      {appState === 'tracking' || appState === 'generating_report' ? <TrackingBackground /> : <AppBackground />}
      <Header onHomeClick={handleGoHome} onTrackClick={handleTrackClick} supportEmail={SUPPORT_EMAIL} />
      {renderContent()}
      <VoiceCommandButton onCommand={handleCommand} appState={currentVoiceState} />
      <ChatAssistant 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPrompt={chatPrompt}
      />
    </>
  );
};

export default App;