import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeBuildOptimizations } from './utils/buildOptimization';
import { BrowserRouter } from 'react-router-dom';

// Initialize build optimizations
try {
  initializeBuildOptimizations();
} catch (error) {
  console.error('Failed to initialize build optimizations:', error);
}

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; font-family: system-ui; color: red;">❌ Error: Root element not found. Please refresh the page.</div>';
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = '<div style="padding: 20px; font-family: system-ui;"><h1 style="color: red;">❌ Application Error</h1><p>Failed to load the application. Please check the console for details.</p><button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px; cursor: pointer;">Reload Page</button></div>';
}

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
