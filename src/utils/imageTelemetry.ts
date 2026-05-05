/**
 * Lightweight client-side telemetry for image load failures.
 * Logs to the console and pushes to the GTM dataLayer (if present)
 * so we can monitor which gallery/blog images are failing in production.
 */

type ImageFailureInfo = {
  src: string;
  context: string;
  attempts: number;
  finalUrl?: string;
  meta?: Record<string, unknown>;
};

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export function logImageFailure(info: ImageFailureInfo) {
  try {
    // eslint-disable-next-line no-console
    console.warn('[image-failure]', info.context, {
      src: info.src,
      attempts: info.attempts,
      finalUrl: info.finalUrl,
      ...info.meta,
    });
  } catch {
    /* noop */
  }

  if (typeof window === 'undefined') return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'image_load_failure',
      image_src: info.src,
      image_context: info.context,
      image_attempts: info.attempts,
      image_final_url: info.finalUrl,
      ...info.meta,
    });
  } catch {
    /* noop */
  }
}
