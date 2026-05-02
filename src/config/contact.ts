const getViteEnv = (
  key: 'VITE_ACADEMY_CONTACT_EMAIL' | 'VITE_ADMIN_CC_EMAIL',
  fallback: string
) => {
  const value = import.meta.env[key]?.trim();
  if (!value) {
    if (typeof console !== 'undefined') {
      console.warn(
        `[contact] Missing env ${key}; using fallback "${fallback}".`
      );
    }
    return fallback;
  }
  return value;
};

export const ACADEMY_CONTACT_EMAIL = getViteEnv(
  'VITE_ACADEMY_CONTACT_EMAIL',
  'ghatakgsai@gmail.com'
);
export const ADMIN_CC_EMAIL = getViteEnv(
  'VITE_ADMIN_CC_EMAIL',
  'ghatakgsai@gmail.com'
);

export const RESEND_DOMAIN_SENDERS = {
  automated: 'no-reply@ghataksportsacademy.com',
  onboarding: 'admissions@ghataksportsacademy.com',
  updates: 'updates@ghataksportsacademy.com',
} as const;
