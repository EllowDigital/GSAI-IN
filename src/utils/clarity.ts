import Clarity from '@microsoft/clarity';

let isClarityInitialized = false;

const getClarityProjectId = (): string | null => {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();
  return projectId ? projectId : null;
};

export const initializeClarity = (): void => {
  if (typeof window === 'undefined' || isClarityInitialized) return;

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
  if (!isClarityInitialized) return;

  try {
    Clarity.identify(customId, customSessionId, customPageId, friendlyName);
  } catch (error) {
    console.warn('Clarity identify failed:', error);
  }
};

export const claritySetTag = (key: string, value: string | string[]): void => {
  if (!isClarityInitialized) return;

  try {
    Clarity.setTag(key, value);
  } catch (error) {
    console.warn(`Clarity setTag failed for key "${key}":`, error);
  }
};

export const clarityEvent = (eventName: string): void => {
  if (!isClarityInitialized) return;

  try {
    Clarity.event(eventName);
  } catch (error) {
    console.warn(`Clarity event failed for "${eventName}":`, error);
  }
};

export const clarityConsentV2 = (consentOptions?: {
  ad_Storage: 'granted' | 'denied';
  analytics_Storage: 'granted' | 'denied';
}): void => {
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
  if (!isClarityInitialized) return;

  claritySetTag('page_path', path);
  if (pageTitle) {
    claritySetTag('page_title', pageTitle);
  }
  clarityEvent('page_view');
};
