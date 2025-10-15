import React from 'react';

const ADVANCED_SHIP_IMAGES = [
  'https://images.pexels.com/photos/4614165/pexels-photo-4614165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Cargo Plane landing
  'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Container Ship at Port
  'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Trucks on highway
  'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Local delivery van
  'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Crane loading ship
];


const AppBackground: React.FC = () => {
  return (
    <div className="welcome-background" aria-hidden="true">
      {ADVANCED_SHIP_IMAGES.map((url, index) => (
        <div
          key={`bg-slide-${index}`}
          className="welcome-bg-slide"
          style={{ backgroundImage: `url(${url})` }}
        />
      ))}
    </div>
  );
};

export default AppBackground;