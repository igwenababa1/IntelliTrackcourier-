import React from 'react';

// NEW HD images for a more comprehensive logistics theme: air, sea, and ground.
const airAndSeaImages = [
  'https://images.pexels.com/photos/12833589/pexels-photo-12833589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Cargo plane on runway at sunset
  'https://images.pexels.com/photos/11019815/pexels-photo-11019815.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' // Container ship at port
];

const groundImages = [
  'https://images.pexels.com/photos/163737/motorway-highway-traffic-speed-163737.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Trucks on highway with motion blur
  'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' // Detailed shot of a cargo trailer
];

const TrackingBackground: React.FC = () => {
  return (
    <div className="app-background">
      {/* Slower slider for Air & Sea Cargo (background layer) */}
      <div className="bg-slider planes">
        {[...airAndSeaImages, ...airAndSeaImages].map((url, index) => (
          <div
            key={`air-sea-${index}`}
            className="bg-slide"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
      {/* Faster slider for Ground Cargo (foreground layer) */}
       <div className="bg-slider containers">
        {[...groundImages, ...groundImages].map((url, index) => (
          <div
            key={`ground-${index}`}
            className="bg-slide"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackingBackground;