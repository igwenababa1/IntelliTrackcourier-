import React from 'react';

const SHIP_IMAGES = [
  'https://images.pexels.com/photos/163864/pexels-photo-163864.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/262391/pexels-photo-262391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/1203803/pexels-photo-1203803.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
];

const AppBackground: React.FC = () => {
  return (
    <div className="welcome-background" aria-hidden="true">
      {SHIP_IMAGES.map((url, index) => (
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
