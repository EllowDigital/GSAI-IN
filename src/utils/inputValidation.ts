/**
 * Input Validation and Sanitization Utilities
 *
 * Security-focused input validation to prevent XSS and injection attacks
 */

/**
 * Sanitizes text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>'"&]/g, '') // Remove common XSS vectors
    .trim()
    .slice(0, 1000); // Limit length to prevent DOS
}

/**
 * Validates and sanitizes email addresses
 */
export function validateEmail(email: string): {
  isValid: boolean;
  sanitized: string;
} {
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return {
    isValid: emailRegex.test(sanitized) && sanitized.length <= 254,
    sanitized,
  };
}

/**
 * Validates phone numbers (Indian format)
 */
export function validatePhoneNumber(phone: string): {
  isValid: boolean;
  sanitized: string;
} {
  const sanitized = phone.replace(/\D/g, ''); // Remove non-digits
  const indianPhoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format

  return {
    isValid: indianPhoneRegex.test(sanitized),
    sanitized,
  };
}

/**
 * Validates Aadhar number format (12 digits)
 */
export function validateAadharNumber(aadhar: string): {
  isValid: boolean;
  sanitized: string;
} {
  const sanitized = aadhar.replace(/\D/g, ''); // Remove non-digits

  return {
    isValid: sanitized.length === 12,
    sanitized,
  };
}

/**
 * Sanitizes file upload names
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace unsafe characters
    .slice(0, 100); // Limit length
}

/**
 * Validates monetary amounts
 */
export function validateAmount(amount: string | number): {
  isValid: boolean;
  value: number;
} {
  const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;

  return {
    isValid:
      !isNaN(numericValue) && numericValue >= 0 && numericValue <= 1000000, // Max 10 lakh
    value: numericValue,
  };
}

/**
 * Validates date inputs
 */
export function validateDate(dateString: string): {
  isValid: boolean;
  date: Date | null;
} {
  try {
    const date = new Date(dateString);
    const isValid =
      !isNaN(date.getTime()) &&
      date.getFullYear() >= 1900 &&
      date.getFullYear() <= 2100;

    return { isValid, date: isValid ? date : null };
  } catch {
    return { isValid: false, date: null };
  }
}
