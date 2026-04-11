export const ACADEMY_NAME = 'Ghatak Sports Academy India';

const getRequiredEnv = (key: string): string => {
  const value = Deno.env.get(key)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const ACADEMY_CONTACT_EMAIL = getRequiredEnv('ACADEMY_CONTACT_EMAIL');

export const RESEND_DOMAIN_SENDERS = {
  automated: 'no-reply@ghataksportsacademy.com',
  onboarding: 'admissions@ghataksportsacademy.com',
  updates: 'updates@ghataksportsacademy.com',
} as const;

export type ResendSenderPurpose = keyof typeof RESEND_DOMAIN_SENDERS;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED_DOMAIN = 'ghataksportsacademy.com';

export function getResendSenderAddress(purpose: ResendSenderPurpose): string {
  const address = RESEND_DOMAIN_SENDERS[purpose];

  if (!EMAIL_PATTERN.test(address)) {
    throw new Error(`Invalid sender email format for ${purpose}`);
  }

  const [, domain = ''] = address.split('@');
  if (domain.toLowerCase() !== REQUIRED_DOMAIN) {
    throw new Error(
      `Sender for ${purpose} must use @${REQUIRED_DOMAIN} domain`
    );
  }

  return address;
}
