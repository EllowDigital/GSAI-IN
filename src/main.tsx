import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeBuildOptimizations } from './utils/buildOptimization';
import { validateSupabaseConfig } from './integrations/supabase/constants';
import { BrowserRouter } from 'react-router-dom';

// Initialize build optimizations
try {
  initializeBuildOptimizations();
} catch (error) {
  console.error('Failed to initialize build optimizations:', error);
}

// Validate Supabase configuration
try {
  validateSupabaseConfig();
} catch (error) {
  console.error('Supabase configuration validation failed:', error);
  // validateSupabaseConfig handles env-specific behavior (e.g., only throws in production)
  // This catch logs and re-throws any error that was thrown
  throw error;
}

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding: 20px; font-family: system-ui; color: red;';
  errorDiv.textContent =
    '❌ Error: Root element not found. Please refresh the page.';
  document.body.appendChild(errorDiv);
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
  const errorContainer = document.createElement('div');
  errorContainer.style.cssText = 'padding: 20px; font-family: system-ui;';

  const title = document.createElement('h1');
  title.style.color = 'red';
  title.textContent = '❌ Application Error';

  const message = document.createElement('p');
  message.textContent =
    'Failed to load the application. Please check the console for details.';

  const reloadButton = document.createElement('button');
  reloadButton.textContent = 'Reload Page';
  reloadButton.style.cssText =
    'padding: 10px 20px; margin-top: 10px; cursor: pointer;';
  reloadButton.addEventListener('click', () => location.reload());

  errorContainer.appendChild(title);
  errorContainer.appendChild(message);
  errorContainer.appendChild(reloadButton);
  document.body.appendChild(errorContainer);
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
