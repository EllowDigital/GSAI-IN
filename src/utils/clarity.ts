import Clarity from '@microsoft/clarity';

let isClarityInitialized = false;
let isClarityTagDetected = false;

type ClarityConsent = {
  ad_Storage: 'granted' | 'denied';
  analytics_Storage: 'granted' | 'denied';
};

type WindowWithClarity = Window & {
  clarity?: (...args: unknown[]) => void;
};

const getWindowWithClarity = (): WindowWithClarity | null => {
  if (typeof window === 'undefined') return null;
  return window as WindowWithClarity;
};

const hasGlobalClarity = (): boolean => {
  const win = getWindowWithClarity();
  return typeof win?.clarity === 'function';
};

const hasClarityScriptTag = (): boolean => {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.querySelector('script[src*="clarity.ms/tag/"]') ||
    document.querySelector('script[src*="scripts.clarity.ms"]')
  );
};

const getClarityProjectId = (): string | null => {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();
  return projectId ? projectId : null;
};

export const initializeClarity = (): void => {
  if (typeof window === 'undefined' || isClarityInitialized) return;

  // If Clarity already exists globally (for example via GTM), avoid a second
  // SDK init but still mark it as usable for downstream tracking calls.
  if (hasGlobalClarity()) {
    isClarityTagDetected = true;
    isClarityInitialized = true;
    return;
  }

  // A script tag alone does not guarantee the global API is ready yet.
  if (hasClarityScriptTag()) {
    isClarityTagDetected = true;
    return;
  }

  const projectId = getClarityProjectId();
  if (!projectId) return;

  try {
    Clarity.init(projectId);
    isClarityInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize Microsoft Clarity:', error);
  }
};

export const clarityIdentify = (
  customId: string,
  customSessionId?: string,
  customPageId?: string,
  friendlyName?: string
): void => {
  const win = getWindowWithClarity();

  if (typeof win?.clarity === 'function') {
    try {
      win.clarity(
        'identify',
        customId,
        customSessionId,
        customPageId,
        friendlyName
      );
    } catch (error) {
      console.warn('Clarity identify failed:', error);
    }
    return;
  }

  if (!isClarityInitialized) return;

  try {
    Clarity.identify(customId, customSessionId, customPageId, friendlyName);
  } catch (error) {
    console.warn('Clarity identify failed:', error);
  }
};

export const claritySetTag = (key: string, value: string | string[]): void => {
  const win = getWindowWithClarity();

  if (typeof win?.clarity === 'function') {
    try {
      win.clarity('set', key, value);
    } catch (error) {
      console.warn(`Clarity setTag failed for key "${key}":`, error);
    }
    return;
  }

  if (!isClarityInitialized) return;

  try {
    Clarity.setTag(key, value);
  } catch (error) {
    console.warn(`Clarity setTag failed for key "${key}":`, error);
  }
};

export const clarityEvent = (eventName: string): void => {
  const win = getWindowWithClarity();

  if (typeof win?.clarity === 'function') {
    try {
      win.clarity('event', eventName);
    } catch (error) {
      console.warn(`Clarity event failed for "${eventName}":`, error);
    }
    return;
  }

  if (!isClarityInitialized) return;

  try {
    Clarity.event(eventName);
  } catch (error) {
    console.warn(`Clarity event failed for "${eventName}":`, error);
  }
};

export const clarityConsentV2 = (consentOptions?: ClarityConsent): void => {
  const win = getWindowWithClarity();

  if (typeof win?.clarity === 'function') {
    try {
      win.clarity('consentv2', consentOptions);
    } catch (error) {
      console.warn('Clarity consentV2 failed:', error);
    }
    return;
  }

  if (!isClarityInitialized) return;

  try {
    Clarity.consentV2(consentOptions);
  } catch (error) {
    console.warn('Clarity consentV2 failed:', error);
  }
};

export const trackClarityPageView = (
  path: string,
  pageTitle?: string
): void => {
  if (!isClarityInitialized && !hasGlobalClarity()) return;

  claritySetTag('page_path', path);
  if (pageTitle) {
    claritySetTag('page_title', pageTitle);
  }
  clarityEvent('page_view');
};
