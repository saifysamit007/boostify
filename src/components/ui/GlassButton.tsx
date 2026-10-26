import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  withArrow?: boolean;
  magnetic?: boolean;
  magneticStrength?: number;
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  withArrow = false,
  magnetic = true,
  magneticStrength = 0.32,
  children,
  className = '',
  href,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);

  // Framer Motion spring physics for magnetic cursor attraction
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth, organic spring configuration with responsive velocity
  const springConfig = { damping: 15, stiffness: 160, mass: 0.1 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!magnetic || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Displacement from button center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Gently pull towards cursor
    mouseX.set(distanceX * magneticStrength);
    mouseY.set(distanceY * magneticStrength);
  };

  const handleMouseLeave = () => {
    if (!magnetic) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-semibold tracking-wide',
    md: 'px-6 py-3 text-sm font-semibold tracking-wide',
    lg: 'px-8 py-4 text-base font-bold tracking-wide',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#FF6E17] via-[#ff853a] to-[#F4511E] text-white shadow-md border border-white/20 hover:border-white/40',
    secondary:
      'glass-standard text-white border border-white/15 hover:border-[#FF6E17] shadow-md',
    ghost:
      'bg-transparent text-[#F7F7F7] hover:text-[#FF6E17] hover:bg-[#FF6E17]/10 border border-transparent',
  }[variant];

  const content = (
    <>
      {/* Wavy liquid orange background transition layer (zero size or position shift) */}
      <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full">
        {/* Smooth fluid orange fill for secondary glass variant */}
        {variant === 'secondary' && (
          <span className="absolute inset-0 bg-gradient-to-r from-[#FF6E17] via-[#ff853a] to-[#F4511E] opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out" />
        )}
        {/* Soft radial wave glow that expands gracefully */}
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.22)_0%,transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out" />
        {/* Wavy liquid fluid shimmer wave across the button */}
        <span className="absolute -inset-x-full inset-y-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]" />
      </span>

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
        {withArrow && (
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </span>
    </>
  );

  // Rock-solid static dimensions (no hover:scale, no hover:translate-y)
  const baseStyles = `group relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6E17]/60 focus:ring-offset-2 focus:ring-offset-black transition-colors duration-500 ease-out will-change-transform ${sizeClasses} ${variantClasses} ${className}`;

  if (href) {
    return (
      <motion.a
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={baseStyles}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={baseStyles}
      onClick={onClick}
      {...(props as any)}
    >
      {content}
    </motion.button>
  );
};
