import React from 'react';

const TRACKING_IMAGES = [
  'https://images.pexels.com/photos/2225499/pexels-photo-2225499.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Aerial ship on sea
  'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Truck on mountain road
  'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Ship at port
  'https://images.pexels.com/photos/1078973/pexels-photo-1078973.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Trucks on highway at sunset
];

/**
 * Renders a dynamic, cinematic background slideshow for the tracking page.
 * This component cycles through high-quality images of global cargo and logistics
 * to create a professional and immersive user experience.
 */
const TrackingBackground: React.FC = () => {
  return (
    <div className="tracking-background" aria-hidden="true">
      {TRACKING_IMAGES.map((url, index) => (
        <div
          key={`tracking-bg-${index}`}
          className="tracking-bg-slide"
          style={{ backgroundImage: `url(${url})` }}
        />
      ))}
    </div>
  );
};

export default TrackingBackground;