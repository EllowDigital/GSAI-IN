import React from 'react';
import { cn } from '@/lib/utils';
import {
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
  /** Max retry attempts before falling back to the raw URL / placeholder. */
  maxRetries?: number;
  /** Wrapper className for the skeleton/placeholder layer. */
  wrapperClassName?: string;
  imgClassName?: string;
};

/**
 * Resilient Supabase image:
 * - Renders a skeleton until loaded.
 * - Retries on transient failures with backoff.
 * - Falls back to the unoptimized URL if the transform endpoint fails
 *   (e.g. Supabase image transformations not enabled).
 * - Shows a graceful placeholder if everything fails.
 */
export function SmartImage({
  src,
  alt,
  transform,
  maxRetries = 2,
  wrapperClassName,
  imgClassName,
  className,
  loading = 'lazy',
  decoding = 'async',
  ...rest
}: SmartImageProps) {
  const optimized = React.useMemo(
    () => (src ? optimizeSupabaseImageUrl(src, transform) : ''),
    [src, transform]
  );

  const [currentSrc, setCurrentSrc] = React.useState(optimized);
  const [attempt, setAttempt] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const triedRawRef = React.useRef(false);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCurrentSrc(optimized);
      setAttempt(0);
      setLoaded(false);
      setFailed(false);
      triedRawRef.current = false;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [optimized]);

  const handleError = React.useCallback(() => {
    // First fallback: drop the transform and try the original Supabase URL.
    if (!triedRawRef.current && src && currentSrc !== src) {
      triedRawRef.current = true;
      setCurrentSrc(src);
      return;
    }
    // Then retry with cache-busting up to maxRetries.
    if (attempt < maxRetries) {
      const next = attempt + 1;
      const base = src || optimized;
      const sep = base.includes('?') ? '&' : '?';
      setTimeout(
        () => {
          setAttempt(next);
          setCurrentSrc(`${base}${sep}r=${next}-${Date.now()}`);
        },
        300 * Math.pow(2, attempt)
      );
      return;
    }
    setFailed(true);
  }, [attempt, currentSrc, maxRetries, optimized, src]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center bg-white/5',
          wrapperClassName,
          className
        )}
        aria-label={alt}
      >
        <ImageIcon className="w-8 h-8 text-white/20" />
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
