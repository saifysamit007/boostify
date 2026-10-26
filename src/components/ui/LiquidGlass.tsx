import React from 'react';

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'standard' | 'elevated';
  withOrangeGlow?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  variant = 'standard',
  withOrangeGlow = false,
  interactive = false,
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    subtle: 'glass-subtle',
    standard: 'glass-standard',
    elevated: 'glass-elevated',
  }[variant];

  const interactiveClasses = interactive
    ? 'transition-all duration-300 ease-out hover:border-[#FF6E17]/60 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-1 will-change-transform'
    : '';

  const glowClass = withOrangeGlow ? 'border-[#FF6E17]/50 shadow-xl shadow-black/50' : '';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${variantClasses} ${interactiveClasses} ${glowClass} ${className}`}
      {...props}
    >
      {/* Delicate luminous top-edge reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Children content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
