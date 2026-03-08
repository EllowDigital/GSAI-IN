export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout(
  promise: PromiseLike<unknown> | unknown,
  timeoutMs: number = 10000,
  message: string = 'Request timed out.'
): Promise<any> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(message));
    }, timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof TimeoutError ||
    (error instanceof Error && error.name === 'TimeoutError')
  );
}
