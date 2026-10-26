import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '../../types';
import { PlatformBadge, TrustedCustomerBadge } from './CollaboratorBadge';
import { LiquidGlass } from './LiquidGlass';
import { Star, Quote } from 'lucide-react';

interface CollaboratorTickerProps {
  testimonials: Testimonial[];
  className?: string;
}

export const CollaboratorTicker: React.FC<CollaboratorTickerProps> = ({
  testimonials,
  className = '',
}) => {
  // Filter approved testimonials
  const approvedList = testimonials.filter(t => t.status === 'approved');
  const displayItems = approvedList.length > 0 ? approvedList : testimonials;

  // Duplicate items for a continuous, seamless infinite loop
  const duplicatedList = [...displayItems, ...displayItems, ...displayItems];

  const baseDuration = Math.max(30, displayItems.length * 9);

  return (
    <div className={`relative w-full overflow-hidden py-2 select-none pointer-events-none ${className}`}>
      {/* Left and Right Edge Vignette / Gradient Masking */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent z-20" />

      {/* Infinite Continuous Auto-Scrolling Track (Zero Hover Interruption) */}
      <div className="w-full flex overflow-hidden pointer-events-none">
        <motion.div
          className="flex gap-6 shrink-0 py-4 px-2 pointer-events-none"
          animate={{
            x: ['0%', '-33.333%'],
          }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            duration: baseDuration,
          }}
        >
          {duplicatedList.map((item, index) => {
            const stars = Math.max(1, Math.min(5, item.rating || 5));
            return (
              <div
                key={`${item.id}-${index}`}
                className="w-[340px] sm:w-[400px] shrink-0 pointer-events-none"
              >
                <LiquidGlass
                  variant="standard"
                  className="h-full p-6 flex flex-col justify-between border border-white/10 relative overflow-hidden bg-black/60 backdrop-blur-xl pointer-events-none"
                >
                  {/* Subtle ambient corner gradient */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF6E17]/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header: Stars + Platform + Trusted Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(stars)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.sourcePlatform && (
                          <PlatformBadge platform={item.sourcePlatform} />
                        )}
                        {item.isTrustedClient && (
                          <TrustedCustomerBadge />
                        )}
                      </div>
                    </div>

                    {/* Quote text */}
                    <div className="relative mb-5">
                      <Quote className="w-6 h-6 text-white/10 absolute -top-1 -left-1 pointer-events-none" />
                      <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic pl-3 relative z-10 font-normal">
                        "{item.quote}"
                      </p>
                    </div>

                    {item.projectTitle && (
                      <div className="mb-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                          Project: {item.projectTitle}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer: Avatar + Name + Position */}
                  <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.clientName}
                          className="w-10 h-10 rounded-full object-cover border border-[#FF6E17]/40 ring-2 ring-black"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6E17]/30 to-amber-500/20 border border-[#FF6E17]/40 flex items-center justify-center text-white font-bold text-xs">
                          {item.clientName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                          {item.clientName}
                        </h4>
                        <span className="text-[11px] text-neutral-400 block line-clamp-1">
                          {item.position}{item.company ? ` • ${item.company}` : ''}
                        </span>
                      </div>
                    </div>

                    {item.date && (
                      <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
                        {item.date}
                      </span>
                    )}
                  </div>
                </LiquidGlass>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
