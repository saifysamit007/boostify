import React, { useState } from 'react';
import { getOptimizedImageUrl, generateSrcSet, isDataUrl } from '../../utils/imageOptimizer';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fallbackSrc?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * OptimizedImage Component
 * 
 * Automatically generates WebP <picture> sources, responsive srcSet,
 * lazy loading, async decoding, and seamless smooth fade-in with skeleton placeholder.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 80,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  fallbackSrc = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  objectFit = 'cover',
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // If error, fall back to default curated asset
  const effectiveSrc = hasError ? fallbackSrc : src;
  const isData = isDataUrl(effectiveSrc);

  // Standard WebP image URL
  const optimizedWebpUrl = getOptimizedImageUrl(effectiveSrc, {
    width: width || 1200,
    height,
    quality,
    format: 'webp',
  });

  // Responsive WebP srcSet
  const webpSrcSet = !isData ? generateSrcSet(effectiveSrc, [400, 800, 1200, 1600], quality) : undefined;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Smooth Shimmer / Skeleton Placeholder while image is loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse pointer-events-none" />
      )}

      <picture className="w-full h-full block">
        {/* Modern WebP responsive source */}
        {webpSrcSet && (
          <source
            type="image/webp"
            srcSet={webpSrcSet}
            sizes={sizes}
          />
        )}

        <img
          src={optimizedWebpUrl}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (!hasError) setHasError(true);
          }}
          style={{
            objectFit,
            ...style,
          }}
          className={`w-full h-full transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      </picture>
    </div>
  );
};
