import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Register the service worker for PWA functionality.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      // Service Worker registered successfully
    })
    .catch(() => {
      // Service Worker registration failed
    });
  });
}
