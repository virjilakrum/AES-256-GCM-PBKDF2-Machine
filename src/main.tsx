import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App';
import './index.css';

// Polyfill Buffer globally
window.Buffer = Buffer;

if (!('phantom' in window)) {
  const warning = document.createElement('div');
  warning.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: 'League Spartan', sans-serif;">
      <h1 style="color: #feffaf; margin-bottom: 16px;">Phantom Wallet Required</h1>
      <p style="color: #feffaf;">
        Please install the 
        <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" style="color: #feffaf; text-decoration: underline;">
          Phantom Wallet
        </a>
        to use this application.
      </p>
    </div>
  `;
  document.body.appendChild(warning);
} else {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}