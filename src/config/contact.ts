const getRequiredViteEnv = (key: 'VITE_ACADEMY_CONTACT_EMAIL' | 'VITE_ADMIN_CC_EMAIL') => {
  const value = import.meta.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const ACADEMY_CONTACT_EMAIL = getRequiredViteEnv(
  'VITE_ACADEMY_CONTACT_EMAIL'
);
export const ADMIN_CC_EMAIL = getRequiredViteEnv('VITE_ADMIN_CC_EMAIL');

export const RESEND_DOMAIN_SENDERS = {
  automated: 'no-reply@ghataksportsacademy.com',
  onboarding: 'admissions@ghataksportsacademy.com',
  updates: 'updates@ghataksportsacademy.com',
} as const;
