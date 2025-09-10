import React, { useMemo } from 'react';
import LazyImage from './LazyImage';

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
} & React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * OptimizedImage component with modern image optimization features
 */
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  format = 'auto',
  ...props
}: OptimizedImageProps) {
  // Generate optimized srcSet for different screen densities
  const srcSet = useMemo(() => {
    const baseUrl = src;
    const densities = [1, 2];

    // For now, return the original src until we implement image optimization
    return densities.map((density) => `${baseUrl} ${density}x`).join(', ');
  }, [src]);

  // Generate placeholder for better perceived performance
  const placeholder = useMemo(() => {
    // Simple placeholder SVG with dominant color
    const svgPlaceholder = `data:image/svg+xml;base64,${btoa(`
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="hsl(var(--muted))"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
              font-family="system-ui" font-size="14" fill="hsl(var(--muted-foreground))">
          Loading...
        </text>
      </svg>
    `)}`;

    return svgPlaceholder;
  }, [width, height]);

  // For critical images (like hero images), use regular img tag with preload
  if (priority) {
    return (
      <>
        <link
          rel="preload"
          as="image"
          href={src}
          imageSizes={sizes}
          imageSrcSet={srcSet}
        />
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          className={className}
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          {...props}
        />
      </>
    );
  }

  // For non-critical images, use lazy loading with intersection observer
  const { onLoad, onError, ...otherProps } = props;

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      placeholder={placeholder}
      onLoad={onLoad ? () => onLoad({} as any) : undefined}
      onError={onError ? () => onError({} as any) : undefined}
      {...otherProps}
    />
  );
}

export default OptimizedImage;
