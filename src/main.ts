import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AppBootstrap } from './app';

const root = ReactDOM.createRoot(document.getElementById('root')!);

const boot = async () => {
  try {
    const initialState = await AppBootstrap.init();
    
    // If the URL has no hash, set it based on initial state
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.hash = initialState.route;
    }

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('[CRITICAL] System Boot Failure:', error);
    // Fallback to minimal error UI
    document.body.innerHTML = '<div style="color:white;background:black;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif">SYSTEM_BOOT_FAILURE</div>';
  }
};

boot();
