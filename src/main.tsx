// Suppress benign Vite HMR WebSocket disconnection errors in iframe/container preview environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || '';
    if (
      msg.includes('WebSocket') ||
      msg.includes('failed to connect to websocket') ||
      msg.includes('WebSocket closed without opened')
    ) {
      event.preventDefault();
    }
  });
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
