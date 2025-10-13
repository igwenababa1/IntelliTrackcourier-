import React from 'react';

const planeImages = [
  'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
];

const containerImages = [
  'https://images.pexels.com/photos/2228330/pexels-photo-2228330.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/730778/pexels-photo-730778.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
];

const AppBackground: React.FC = () => {
  return (
    <div className="app-background">
      {/* Slider for Air Cargo Planes (slower) */}
      <div className="bg-slider planes">
        {[...planeImages, ...planeImages].map((url, index) => (
          <div
            key={`plane-${index}`}
            className="bg-slide"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
      {/* Slider for Containers (faster) */}
       <div className="bg-slider containers">
        {[...containerImages, ...containerImages].map((url, index) => (
          <div
            key={`container-${index}`}
            className="bg-slide"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
    </div>
  );
};

export default AppBackground;