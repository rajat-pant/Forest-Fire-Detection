import React from 'react';
import FireDetector from './components/FireDetector';
import LiveCameraDetector from './components/LiveCameraDetector';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">Forest Fire Detection</h1>
      <FireDetector />
      <h2 className="section-title">Live Camera Detection</h2>
      <LiveCameraDetector />
    </div>
  );
}

export default App;
