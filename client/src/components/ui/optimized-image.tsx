import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  width, 
  height, 
  priority = false,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23f3f4f6'/%3E%3C/svg%3E"
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px' // Start loading 50px before element is visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  // Generate WebP and AVIF sources if possible
  const generateSources = (originalSrc: string) => {
    if (originalSrc.startsWith('http') && !originalSrc.includes('.svg')) {
      const baseUrl = originalSrc.split('?')[0];
      const queryParams = originalSrc.includes('?') ? originalSrc.split('?')[1] : '';
      
      return [
        {
          srcSet: `${baseUrl}?format=avif${queryParams ? '&' + queryParams : ''}`,
          type: 'image/avif'
        },
        {
          srcSet: `${baseUrl}?format=webp${queryParams ? '&' + queryParams : ''}`,
          type: 'image/webp'
        }
      ];
    }
    return [];
  };

  const sources = generateSources(src);

  return (
    <picture>
      {/* Next-gen format sources */}
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={shouldLoad ? source.srcSet : undefined}
          type={source.type}
        />
      ))}
      
      <img
        ref={imgRef}
        src={shouldLoad ? src : placeholder}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-70",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          console.warn(`Failed to load image: ${src}`);
          setIsLoaded(true); // Show placeholder/fallback
        }}
      />
    </picture>
  );
}