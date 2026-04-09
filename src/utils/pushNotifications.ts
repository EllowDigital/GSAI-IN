import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY || '';

export type PushPortalScope = 'admin' | 'student';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function canEnablePushNotifications() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    Boolean(VAPID_PUBLIC_KEY)
  );
}

export async function ensurePushPermission() {
  if (!('Notification' in window)) return 'denied';

  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  const permission = await Notification.requestPermission();
  return permission;
}

export async function ensurePushSubscription() {
  if (!canEnablePushNotifications()) {
    throw new Error(
      'Push notifications are not available on this device/browser.'
    );
  }

  const permission = await ensurePushPermission();
  if (permission !== 'granted') {
    throw new Error('Push notification permission is not granted.');
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
}

export async function syncPushSubscriptionWithBackend(
  portalScope: PushPortalScope
) {
  const subscription = await ensurePushSubscription();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Allow browser-level subscription even before login; sync later after auth exists.
  if (!session?.access_token) {
    return { synced: false, reason: 'no_session', subscription };
  }

  const { error } = await supabase.functions.invoke('save-push-subscription', {
    body: {
      portal_scope: portalScope,
      subscription: subscription.toJSON(),
      user_agent: navigator.userAgent,
      metadata: {
        source: 'web_app',
        path: window.location.pathname,
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to sync push subscription.');
  }

  return { synced: true, subscription };
}
