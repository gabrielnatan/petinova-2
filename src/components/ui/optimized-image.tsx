"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '100vw',
  quality = 80,
  loading = 'lazy',
  onLoad,
  onError,
  fallback
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
    }
    
    onError?.();
  };

  // Gerar srcset para imagens responsivas
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [320, 640, 1024, 1920];
    return sizes
      .map(size => `${baseSrc}?w=${size} ${size}w`)
      .join(', ');
  };

  // Gerar sizes para diferentes breakpoints
  const generateSizes = () => {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  if (hasError && !fallback) {
    return (
      <div
        ref={imageRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Erro ao carregar imagem</span>
      </div>
    );
  }

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder durante carregamento */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Imagem otimizada */}
      {isInView && (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          quality={quality}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          srcSet={generateSrcSet(imageSrc)}
        />
      )}

      {/* Overlay de loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Componente para imagens responsivas
interface ResponsiveImageProps extends OptimizedImageProps {
  breakpoints?: { [key: string]: number };
  aspectRatio?: number;
}

export function ResponsiveImage({
  src,
  alt,
  breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  aspectRatio = 16 / 9,
  className = '',
  ...props
}: ResponsiveImageProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width >= 1536) setCurrentBreakpoint('2xl');
      else if (width >= 1280) setCurrentBreakpoint('xl');
      else if (width >= 1024) setCurrentBreakpoint('lg');
      else if (width >= 768) setCurrentBreakpoint('md');
      else if (width >= 640) setCurrentBreakpoint('sm');
      else setCurrentBreakpoint('xs');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentWidth = breakpoints[currentBreakpoint] || 1024;
  const currentHeight = currentWidth / aspectRatio;

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={currentWidth}
      height={currentHeight}
      className={className}
      sizes={`(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw`}
      {...props}
    />
  );
}

// Componente para imagens com lazy loading avançado
interface LazyImageProps extends OptimizedImageProps {
  threshold?: number;
  rootMargin?: string;
}

export function LazyImage({
  threshold = 0.1,
  rootMargin = '50px 0px',
  ...props
}: LazyImageProps) {
  return (
    <OptimizedImage
      loading="lazy"
      priority={false}
      {...props}
    />
  );
}

// Componente para imagens com placeholder blur
interface BlurImageProps extends OptimizedImageProps {
  blurAmount?: number;
}

export function BlurImage({
  blurAmount = 10,
  placeholder = 'blur',
  ...props
}: BlurImageProps) {
  const [blurDataURL, setBlurDataURL] = useState<string>('');

  useEffect(() => {
    // Gerar placeholder blur simples
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 20;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 20, 20);
      
      // Adicionar ruído
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
        ctx.fillRect(
          Math.random() * 20,
          Math.random() * 20,
          1,
          1
        );
      }
      
      setBlurDataURL(canvas.toDataURL());
    }
  }, []);

  return (
    <OptimizedImage
      placeholder="blur"
      blurDataURL={blurDataURL}
      {...props}
    />
  );
}
