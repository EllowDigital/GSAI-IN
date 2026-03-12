const stripNonDigits = (value: string) => value.replace(/\D/g, '');

export const normalizeIndianWhatsAppNumber = (phone: string) => {
  const digits = stripNonDigits(phone);

  if (!digits) {
    return '';
  }

  if (digits.startsWith('91') && digits.length >= 12) {
    return digits;
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length > 10) {
    return digits;
  }

  return '';
};

export const createWhatsAppUrl = (phone: string, message?: string) => {
  const normalizedPhone = normalizeIndianWhatsAppNumber(phone);

  if (!normalizedPhone) {
    return null;
  }

  const baseUrl = new URL(`https://wa.me/${normalizedPhone}`);

  if (message?.trim()) {
    baseUrl.searchParams.set('text', message.trim());
  }

  return baseUrl.toString();
};

export const openWhatsAppConversation = (phone: string, message?: string) => {
  const url = createWhatsAppUrl(phone, message);

  if (!url) {
    return false;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};
