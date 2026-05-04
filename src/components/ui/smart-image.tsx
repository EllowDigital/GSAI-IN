import React from 'react';
import { cn } from '@/lib/utils';
import {
  buildSupabaseSrcSet,
  optimizeSupabaseImageUrl,
  type SupabaseImageOptions,
} from '@/utils/supabaseImage';
import { ImageIcon } from 'lucide-react';

type SmartImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'onError' | 'onLoad'
> & {
  src: string | null | undefined;
  alt: string;
  transform?: SupabaseImageOptions;
  /** Widths used to generate a responsive srcSet via Supabase render endpoint. */
  srcSetWidths?: number[];
  /** Max retry attempts before falling back to the raw URL / placeholder. */
  maxRetries?: number;
  /** Wrapper className for the skeleton/placeholder layer. */
  wrapperClassName?: string;
  imgClassName?: string;
  /** Optional custom node to render when the image fails after all retries. */
  errorFallback?: React.ReactNode;
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
  const triedRawRef = React.useRef(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCurrentSrc(optimized);
      setUseSrcSet(true);
      setAttempt(0);
      setLoaded(false);
      setFailed(false);
      triedRawRef.current = false;
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [optimized]);

  const handleError = React.useCallback(() => {
    // First fallback: drop the transform/srcSet and try the original URL.
    if (!triedRawRef.current && src && currentSrc !== src) {
      triedRawRef.current = true;
      setUseSrcSet(false);
      setCurrentSrc(src);
      return;
    }
    // Then retry with exponential backoff and cache-busting up to maxRetries.
    if (attempt < maxRetries) {
      const next = attempt + 1;
      const base = src || optimized;
      const sep = base.includes('?') ? '&' : '?';
      const delay = Math.min(300 * Math.pow(2, attempt), 4000);
      timerRef.current = window.setTimeout(() => {
        setAttempt(next);
        setUseSrcSet(false);
        setCurrentSrc(`${base}${sep}r=${next}-${Date.now()}`);
      }, delay);
      return;
    }
    setFailed(true);
  }, [attempt, currentSrc, maxRetries, optimized, src]);

  if (!src || failed) {
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
