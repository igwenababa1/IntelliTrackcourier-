import React from 'react';

/**
 * A purely CSS-based 3D package model that rotates and bobs.
 * Used as a visual representation of the shipment in the sidebar.
 */
const Package3DModel: React.FC = () => {
  return (
    <div className="package-3d-model-container">
      <div className="package-3d-model">
        <div className="package-3d-model-face front"></div>
        <div className="package-3d-model-face back"></div>
        <div className="package-3d-model-face left"></div>
        <div className="package-3d-model-face right"></div>
        <div className="package-3d-model-face top"></div>
        <div className="package-3d-model-face bottom"></div>
      </div>
    </div>
  );
};

export default Package3DModel;