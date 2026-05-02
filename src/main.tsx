import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';
import { initializeBuildOptimizations } from './utils/buildOptimization';
import { validateSupabaseConfig } from '@/services/supabase/constants';
import { BrowserRouter } from 'react-router-dom';
import { syncManifestForPath } from '@/utils/pwa';
import { initializeClarity } from '@/utils/clarity';

const runWhenIdle = (task: () => void, fallbackDelay = 150) => {
  if ('requestIdleCallback' in window) {
    (
      window as Window & {
        requestIdleCallback: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions
        ) => number;
      }
    ).requestIdleCallback(() => task(), { timeout: fallbackDelay + 2000 });
    return;
  }

  (window as unknown as { setTimeout: typeof setTimeout }).setTimeout(
    task,
    fallbackDelay
  );
};

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

// Defer Clarity analytics to idle time to protect first render performance.
runWhenIdle(() => initializeClarity(), 800);

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
  syncManifestForPath(window.location.pathname);

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

const isHardReload = (): boolean => {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return false;
  }
  const [entry] = performance.getEntriesByType(
    'navigation'
  ) as PerformanceNavigationTiming[];
  return entry?.type === 'reload';
};

const clearRuntimeCachesOnHardReload = async () => {
  if (!('caches' in window) || !isHardReload()) return;

  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith('gsai-'))
        .map((key) => caches.delete(key))
    );
  } catch (error) {
    console.warn('Unable to clear runtime caches on hard reload:', error);
  }
};

// Register the service worker for PWA functionality with error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (import.meta.env.DEV) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister())
      );
      return;
    }

    await clearRuntimeCachesOnHardReload();

    runWhenIdle(() => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(async (registration) => {
          // Proactively check for updates to ensure latest deployed assets are used.
          await registration.update();

          // Tell active service worker to purge runtime caches after hard reload.
          if (isHardReload() && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'PURGE_RUNTIME_CACHES',
            });
          }

          if (
            import.meta.env.DEV &&
            import.meta.env.VITE_ENABLE_SW_DEBUG === 'true'
          ) {
            console.log('SW registered:', registration);
          }
        })
        .catch((error) => {
          console.warn('SW registration failed:', error);
        });
    });
  });
}
