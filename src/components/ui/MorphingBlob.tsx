import React from 'react';

interface MorphingBlobProps {
  color?: 'orange' | 'deep-orange' | 'magenta' | 'mixed';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  speed?: 'slow' | 'medium';
}

export const MorphingBlob: React.FC<MorphingBlobProps> = ({
  color = 'orange',
  size = 'md',
  className = '',
  speed = 'slow',
}) => {
  const sizeClasses = {
    sm: 'w-48 h-48 blur-2xl',
    md: 'w-80 h-80 blur-3xl',
    lg: 'w-[450px] h-[450px] blur-[90px]',
    hero: 'w-[600px] h-[600px] blur-[120px]',
  }[size];

  const colorGradients = {
    orange: 'bg-gradient-to-tr from-[#FF6E17]/25 via-[#F4511E]/20 to-transparent',
    'deep-orange': 'bg-gradient-to-br from-[#F4511E]/30 via-[#FF6E17]/15 to-transparent',
    magenta: 'bg-gradient-to-tr from-[#D926A9]/20 via-[#FF6E17]/15 to-transparent',
    mixed: 'bg-gradient-to-br from-[#FF6E17]/25 via-[#D926A9]/20 to-[#FF9E00]/10',
  }[color];

  const speedClass = speed === 'slow' ? 'animate-morph-slow' : 'animate-morph-medium';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none opacity-80 ${sizeClasses} ${colorGradients} ${speedClass} ${className}`}
    />
  );
};
