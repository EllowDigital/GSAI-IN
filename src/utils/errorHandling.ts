/**
 * Enhanced error handling utilities for the application
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  originalError?: unknown;
}

export class DatabaseError extends Error implements AppError {
  code?: string;
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, code?: string, originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.statusCode = 500;
    this.originalError = originalError;
  }
}

export class ValidationError extends Error implements AppError {
  code?: string;
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, code?: string, originalError?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.statusCode = 400;
    this.originalError = originalError;
  }
}

export class AuthenticationError extends Error implements AppError {
  code?: string;
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, code?: string, originalError?: unknown) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = 401;
    this.originalError = originalError;
  }
}

/**
 * Enhanced error handler for Supabase operations
 */
export function handleSupabaseError(error: any): AppError {
  if (!error) {
    return new DatabaseError('Unknown database error occurred');
  }

  // Handle specific Supabase error codes
  switch (error.code) {
    case 'PGRST301':
      return new ValidationError(
        'Invalid data provided. Please check your input.'
      );
    case 'PGRST204':
      return new DatabaseError('The requested resource was not found.');
    case '23505':
      return new ValidationError(
        'This record already exists. Please use different data.'
      );
    case '23503':
      return new ValidationError(
        'Cannot delete this record as it is referenced by other data.'
      );
    case '23514':
      return new ValidationError(
        'Invalid data format. Please check your input.'
      );
    case '42501':
      return new AuthenticationError(
        'You do not have permission to perform this action.'
      );
    case '42P01':
      return new DatabaseError(
        'Database table not found. Please contact support.'
      );
    default:
      // Handle authentication errors
      if (
        error.message?.includes('refresh_token_not_found') ||
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('JWT expired')
      ) {
        return new AuthenticationError(
          'Your session has expired. Please log in again.'
        );
      }

      // Handle row level security errors
      if (
        error.message?.includes('row-level security') ||
        error.message?.includes('RLS') ||
        error.message?.includes('policy')
      ) {
        return new AuthenticationError(
          'You do not have permission to access this data.'
        );
      }

      // Handle network errors
      if (
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('connection')
      ) {
        return new DatabaseError(
          'Network error. Please check your internet connection and try again.'
        );
      }

      return new DatabaseError(
        error.message ||
          'An unexpected database error occurred. Please try again.',
        error.code,
        error
      );
  }
}

/**
 * Enhanced error handler for form validation
 */
export function handleFormValidationError(error: any): AppError {
  if (error?.issues && Array.isArray(error.issues)) {
    // Handle Zod validation errors
    const messages = error.issues.map((issue: any) => issue.message).join(', ');
    return new ValidationError(messages);
  }

  return new ValidationError(
    error.message || 'Form validation failed. Please check your input.'
  );
}

/**
 * Generic error logger
 */
export function logError(error: AppError | Error | unknown, context?: string) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context: context || 'Unknown',
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  };

  console.error('Application Error:', errorInfo);

  // In production, you might want to send errors to an external service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToErrorService(errorInfo);
  }
}

/**
 * Safe async operation wrapper with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError =
      error instanceof Error
        ? handleSupabaseError(error)
        : new DatabaseError('Unknown error occurred');

    logError(appError, context);
    return { error: appError };
  }
}

/**
 * Retry mechanism for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Don't retry on authentication or validation errors
      if (
        error instanceof AuthenticationError ||
        error instanceof ValidationError
      ) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

/**
 * Form error display helper
 */
export function formatErrorForDisplay(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}
