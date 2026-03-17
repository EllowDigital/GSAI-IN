const stripNonDigits = (value: string) => value.replace(/\D/g, '');

const isLikelyMobileDevice = () => {
  const ua = navigator.userAgent || '';
  const mobileUA = /android|iphone|ipad|ipod|mobile|windows phone/i.test(ua);

  // iPadOS can report a desktop-like user agent; touch points catch that case.
  const isTouchCapableDesktopLike =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return mobileUA || isTouchCapableDesktopLike;
};

export const normalizeIndianWhatsAppNumber = (phone: string) => {
  const digits = stripNonDigits(phone);

  if (!digits) {
    return '';
  }

  // Accept country-coded Indian numbers like 91XXXXXXXXXX
  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }

  // Accept local numbers that include a leading 0
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  // Handle overlong inputs by extracting the last 10 local digits.
  // This covers copied values with prefixes, spaces, or accidental extras.
  if (digits.length > 12) {
    return `91${digits.slice(-10)}`;
  }

  return '';
};

export const createWhatsAppUrl = (phone: string, message?: string) => {
  const normalizedPhone = normalizeIndianWhatsAppNumber(phone);

  if (!normalizedPhone) {
    return null;
  }

  // api.whatsapp.com provides better cross-device behavior (app on mobile,
  // WhatsApp Web on desktop) than deep links alone.
  const baseUrl = new URL('https://api.whatsapp.com/send');
  baseUrl.searchParams.set('phone', normalizedPhone);

  if (message?.trim()) {
    baseUrl.searchParams.set('text', message.trim());
  }

  return baseUrl.toString();
};

const createWhatsAppAppUrl = (phone: string, message?: string) => {
  const normalizedPhone = normalizeIndianWhatsAppNumber(phone);

  if (!normalizedPhone) {
    return null;
  }

  const params = new URLSearchParams({ phone: normalizedPhone });

  if (message?.trim()) {
    params.set('text', message.trim());
  }

  return `whatsapp://send?${params.toString()}`;
};

export const openWhatsAppConversation = (phone: string, message?: string) => {
  const url = createWhatsAppUrl(phone, message);
  const appUrl = createWhatsAppAppUrl(phone, message);

  if (!url || !appUrl) {
    return false;
  }

  if (isLikelyMobileDevice()) {
    let appOpened = false;

    const markAppOpened = () => {
      appOpened = true;
    };

    const cleanup = () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', markAppOpened);
      window.removeEventListener('blur', markAppOpened);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markAppOpened();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', markAppOpened);
    window.addEventListener('blur', markAppOpened);

    const fallbackTimer = window.setTimeout(() => {
      cleanup();
      if (!appOpened) {
        window.location.assign(url);
      }
    }, 1200);

    window.location.assign(appUrl);

    // Safety cleanup in case the user returns without navigation.
    window.setTimeout(() => {
      window.clearTimeout(fallbackTimer);
      cleanup();
    }, 3000);

    return true;
  }

  const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');

  // If popup is blocked (common after async flows), navigate current tab
  // so the message still opens reliably on all devices.
  if (!openedWindow) {
    window.location.assign(url);
  }

  return true;
};
