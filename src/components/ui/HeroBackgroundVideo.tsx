import React, { useState, useEffect } from 'react';

export interface HeroBackgroundVideoProps {
  videoUrl?: string;
  videoEnabled?: boolean;
  videoBlur?: number;
  videoOpacity?: number;
  className?: string;
  isInteractivePreview?: boolean;
}

/**
 * Extracts YouTube Video ID from any standard or shortened YouTube URL
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Extracts Vimeo Video ID from standard Vimeo URLs
 */
export function getVimeoVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+))/;
  const match = url.match(regExp);
  return match ? match[2] : null;
}

/**
 * Universal Hero Background Video Component
 * Seamlessly plays HTML5 direct videos (.mp4/.webm), YouTube embeds, or Vimeo embeds
 * as a muted, ambient cinematic backdrop with customizable blur and opacity.
 */
export const HeroBackgroundVideo: React.FC<HeroBackgroundVideoProps> = ({
  videoUrl,
  videoEnabled = true,
  videoBlur = 10,
  videoOpacity = 40,
  className = '',
  isInteractivePreview = false,
}) => {
  const [videoError, setVideoError] = useState(false);

  // Auto-reset videoError whenever videoUrl changes
  useEffect(() => {
    setVideoError(false);
  }, [videoUrl]);

  if (!videoEnabled || !videoUrl || videoError) {
    return null;
  }

  const blurPx = typeof videoBlur === 'number' ? videoBlur : 10;
  const opacityVal = typeof videoOpacity === 'number' ? videoOpacity / 100 : 0.4;

  const ytId = getYouTubeVideoId(videoUrl);
  const vimeoId = getVimeoVideoId(videoUrl);

  const containerStyle: React.CSSProperties = {
    filter: `blur(${blurPx}px)`,
    opacity: opacityVal,
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* 1. YouTube Background Embed */}
      {ytId ? (
        <div
          style={containerStyle}
          className="absolute inset-0 w-full h-full flex items-center justify-center transform-gpu transition-all duration-700 ease-out"
        >
          <iframe
            key={ytId}
            src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
            title="Hero Background Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-[150vw] h-[150vh] min-w-[150%] min-h-[150%] max-w-none pointer-events-none object-cover border-0 scale-125"
          />
        </div>
      ) : vimeoId ? (
        /* 2. Vimeo Background Embed */
        <div
          style={containerStyle}
          className="absolute inset-0 w-full h-full flex items-center justify-center transform-gpu transition-all duration-700 ease-out"
        >
          <iframe
            key={vimeoId}
            src={`https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1`}
            title="Hero Background Video"
            allow="autoplay; fullscreen"
            className="w-[150vw] h-[150vh] min-w-[150%] min-h-[150%] max-w-none pointer-events-none object-cover border-0 scale-125"
          />
        </div>
      ) : (
        /* 3. Direct HTML5 Video (.mp4, .webm, cdn streams) */
        <video
          key={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => {
            console.warn('[Boostify] Hero video stream error for URL:', videoUrl);
            setVideoError(true);
          }}
          style={containerStyle}
          className="absolute inset-0 w-full h-full object-cover scale-110 transform-gpu transition-all duration-700 ease-out"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
        </video>
      )}

      {/* Cinematic dark scrim overlay for crisp typography contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/50 to-[#050505] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,110,23,0.14)_0%,transparent_70%)] pointer-events-none" />
    </div>
  );
};
