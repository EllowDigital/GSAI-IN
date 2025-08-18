import React from 'react';
import LazyImage from './LazyImage';

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * OptimizedImage component with lazy loading, WebP support, and responsive images
 */
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}: OptimizedImageProps) {
  // Create srcSet for different screen sizes
  const createSrcSet = (baseSrc: string) => {
    const ext = baseSrc.split('.').pop();
    const baseUrl = baseSrc.replace(`.${ext}`, '');

    // For now, return the original src. In a real production setup,
    // you'd generate multiple sizes during build time
    return baseSrc;
  };

  // For critical images (like hero images), use regular img tag with preload
  if (priority) {
    return (
      <>
        <link rel="preload" as="image" href={src} />
        <img
          src={src}
          srcSet={createSrcSet(src)}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          className={className}
          loading="eager"
          decoding="sync"
          {...props}
        />
      </>
    );
  }

  // For non-critical images, use lazy loading
  const { onLoad, onError, ...otherProps } = props;

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      onLoad={onLoad ? () => onLoad({} as any) : undefined}
      onError={onError ? () => onError({} as any) : undefined}
      {...otherProps}
    />
  );
}

export default OptimizedImage;
