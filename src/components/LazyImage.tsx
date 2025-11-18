import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  loadingClassName?: string;
  errorClassName?: string;
  threshold?: number;
} & React.ImgHTMLAttributes<HTMLImageElement>;

export function LazyImage({
  src,
  alt,
  className,
  placeholder,
  onLoad,
  onError,
  loadingClassName = 'bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse',
  errorClassName = 'bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center text-red-400',
  threshold = 0.1,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div ref={imgRef} className={cn(errorClassName, className)} {...props}>
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {isLoading && (
        <div className={cn(loadingClassName, className, 'absolute inset-0')} />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            className,
            isLoading && 'opacity-0',
            'transition-opacity duration-300'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}

export default LazyImage;
