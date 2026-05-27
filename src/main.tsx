import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress ResizeObserver and benign HMR websocket errors
if (typeof window !== 'undefined') {
  const isBenignError = (err: any) => {
    if (!err) return false;
    const msg = (typeof err === 'string' ? err : (err.message || err.reason?.message || String(err))).toLowerCase();
    return msg.includes('resizeobserver') || 
           msg.includes('websocket') ||
           msg.includes('web socket') ||
           msg.includes('closed without opened');
  };

  window.addEventListener('error', (e) => {
    if (isBenignError(e.error || e.message)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    if (isBenignError(e.reason || (e as any).detail?.reason)) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
