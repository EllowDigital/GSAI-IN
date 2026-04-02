const stripNonDigits = (value: string) => value.replace(/\D/g, '');

export const normalizeIndianWhatsAppNumber = (phone: string) => {
  const digits = stripNonDigits(phone);

  if (!digits) return '';

  // Already country-coded Indian number
  if (digits.startsWith('91') && digits.length === 12) return digits;

  // Local number with leading 0
  if (digits.length === 11 && digits.startsWith('0'))
    return `91${digits.slice(1)}`;

  // Standard 10-digit Indian number
  if (digits.length === 10) return `91${digits}`;

  // Overlong — extract last 10 digits
  if (digits.length > 12) return `91${digits.slice(-10)}`;

  return '';
};

export const createWhatsAppUrl = (phone: string, message?: string) => {
  const normalizedPhone = normalizeIndianWhatsAppNumber(phone);
  if (!normalizedPhone) return null;

  const url = new URL(`https://wa.me/${normalizedPhone}`);
  if (message?.trim()) {
    url.searchParams.set('text', message.trim());
  }
  return url.toString();
};

export const openWhatsAppConversation = (
  phone: string,
  message?: string
): boolean => {
  const url = createWhatsAppUrl(phone, message);
  if (!url) return false;

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};
