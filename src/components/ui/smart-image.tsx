import React from 'react';
import { cn } from '@/lib/utils';
import {
  buildSupabaseSrcSet,
  optimizeSupabaseImageUrl,
  type SupabaseImageOptions,
} from '@/utils/supabaseImage';
import { ImageIcon } from 'lucide-react';
import { logImageFailure } from '@/utils/imageTelemetry';

type SmartImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'onError' | 'onLoad'
> & {
  src: string | null | undefined;
  alt: string;
  transform?: SupabaseImageOptions;
  srcSetWidths?: number[];
  maxRetries?: number;
  wrapperClassName?: string;
  imgClassName?: string;
  errorFallback?: React.ReactNode;
  /** Identifier used in telemetry for image-failure events. */
  telemetryContext?: string;
  /** Render-prop fallback that gives access to a manual retry function. */
  renderError?: (retry: () => void) => React.ReactNode;
};

const DEFAULT_WIDTHS = [400, 800, 1200, 1600];

/**
 * Resilient Supabase image:
 * - Renders a skeleton until loaded.
 * - Retries on transient failures with exponential backoff.
 * - Falls back to the unoptimized URL if the transform endpoint fails.
 * - Generates a responsive srcSet so each device picks the best width.
 * - Shows a graceful placeholder (or custom errorFallback) if everything fails.
 */
export function SmartImage({
  src,
  alt,
  transform,
  srcSetWidths,
  maxRetries = 3,
  wrapperClassName,
  imgClassName,
  className,
  errorFallback,
  renderError,
  telemetryContext,
  loading = 'lazy',
  decoding = 'async',
  sizes,
  ...rest
}: SmartImageProps) {
  const optimized = React.useMemo(
    () => (src ? optimizeSupabaseImageUrl(src, transform) : ''),
    [src, transform]
  );

  const widths = srcSetWidths ?? DEFAULT_WIDTHS;
  const srcSet = React.useMemo(
    () =>
      src
        ? buildSupabaseSrcSet(src, widths, {
            quality: transform?.quality,
            format: transform?.format,
            resize: transform?.resize,
            height: transform?.height,
          })
        : '',
    [src, widths, transform]
  );

  const [currentSrc, setCurrentSrc] = React.useState(optimized);
  const [useSrcSet, setUseSrcSet] = React.useState(true);
  const [attempt, setAttempt] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [triedRaw, setTriedRaw] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);
  const [manualRetryCount, setManualRetryCount] = React.useState(0);
  const retryCountRef = React.useRef(0);

  React.useEffect(() => {
    retryCountRef.current = manualRetryCount;
  }, [manualRetryCount]);

  const reset = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentSrc(optimized);
    setUseSrcSet(true);
    setAttempt(0);
    setLoaded(false);
    setFailed(false);
    setTriedRaw(false);
  }, [optimized]);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(reset);
    return () => {
      window.cancelAnimationFrame(frame);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [reset]);

  const manualRetry = React.useCallback(() => {
    setManualRetryCount((count) => count + 1);
    if (!src) return;
    const sep = src.includes('?') ? '&' : '?';
    setAttempt(0);
    setUseSrcSet(true);
    setLoaded(false);
    setFailed(false);
    setTriedRaw(false);
    setCurrentSrc(`${optimized || src}${sep}rk=${Date.now()}`);
  }, [optimized, src]);

  const handleError = React.useCallback(() => {
    if (!triedRaw && src && currentSrc !== src) {
      setTriedRaw(true);
      setUseSrcSet(false);
      setCurrentSrc(src);
      return;
    }
    if (attempt < maxRetries) {
      const next = attempt + 1;
      const base = src || optimized;
      const sep = base.includes('?') ? '&' : '?';
      const delay = Math.min(300 * Math.pow(2, attempt), 4000);
      const scheduledRetryCount = retryCountRef.current;
      timerRef.current = window.setTimeout(() => {
        if (retryCountRef.current !== scheduledRetryCount) return;
        setAttempt(next);
        setUseSrcSet(false);
        setCurrentSrc(`${base}${sep}r=${next}-${Date.now()}`);
      }, delay);
      return;
    }
    setFailed(true);
    logImageFailure({
      src: src || optimized || '',
      context: telemetryContext || 'unknown',
      attempts: attempt + 1,
      finalUrl: currentSrc,
    });
  }, [
    attempt,
    currentSrc,
    maxRetries,
    optimized,
    src,
    telemetryContext,
    triedRaw,
  ]);

  if (!src || failed) {
    if (renderError) {
      return <>{renderError(manualRetry)}</>;
    }
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center gap-2 bg-white/5 text-white/40',
          wrapperClassName,
          className
        )}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-8 h-8" />
        <span className="text-xs px-2 text-center">Image unavailable</span>
        {src && (
          <button
            type="button"
            onClick={manualRetry}
            className="mt-1 text-xs underline text-white/60 hover:text-white"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full', wrapperClassName, className)}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-white/5"
          aria-hidden
        />
      )}
      <img
        {...rest}
        src={currentSrc}
        srcSet={useSrcSet && srcSet ? srcSet : undefined}
        sizes={useSrcSet ? sizes : undefined}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={cn(
          'w-full h-full transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName
        )}
      />
    </div>
  );
}

export default SmartImage;
