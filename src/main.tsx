import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeBuildOptimizations } from './utils/buildOptimization';

// Initialize build optimizations
initializeBuildOptimizations();

createRoot(document.getElementById('root')!).render(<App />);

// Register the service worker for PWA functionality with error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Service Worker registered successfully
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        // Service Worker registration failed silently
        console.warn('SW registration failed:', error);
      });
  });
}
