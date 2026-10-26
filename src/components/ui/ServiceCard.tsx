import React from 'react';
import { Service } from '../../types';
import { LiquidGlass } from './LiquidGlass';
import { Magnetic } from './Magnetic';
import { 
  Code2, 
  Layout, 
  Palette, 
  Sparkles, 
  Video, 
  Share2, 
  TrendingUp, 
  Target, 
  Check, 
  ArrowUpRight 
} from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onSelectService?: (serviceTitle: string) => void;
  onViewDetails?: (slug: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  Layout,
  Palette,
  Sparkles,
  Video,
  Share2,
  TrendingUp,
  Target,
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onSelectService,
  onViewDetails,
}) => {
  const IconComponent = ICON_MAP[service.iconName] || Sparkles;

  return (
    <LiquidGlass
      variant="standard"
      interactive
      className="p-7 md:p-8 flex flex-col justify-between group transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#FF6E17]/60 hover:shadow-2xl hover:shadow-black/70 h-full will-change-transform"
    >
      <div>
        {/* Header Icon & Category */}
        <div className="flex items-center justify-between mb-6">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white group-hover:text-[#FF6E17] group-hover:bg-[#FF6E17]/15 group-hover:border-[#FF6E17]/40 group-hover:scale-105 transition-all duration-500 ease-out">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 px-3 py-1 rounded-full bg-white/5 border border-white/5 group-hover:border-white/15 transition-colors duration-400">
            {service.category}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails && onViewDetails(service.slug)}
          className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3 cursor-pointer group-hover:text-[#FF6E17] transition-colors duration-300"
        >
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-xs md:text-sm text-neutral-300 leading-relaxed mb-6">
          {service.shortDescription}
        </p>

        {/* Deliverables List */}
        <div className="space-y-2.5 mb-6 pt-4 border-t border-white/10">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-2 font-mono">
            Key Deliverables
          </span>
          {service.deliverables.slice(0, 4).map((deliv, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 group-hover:text-neutral-200 transition-colors">
              <Check className="w-3.5 h-3.5 text-[#FF6E17] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <span>{deliv}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4 mt-auto">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
            Pricing
          </span>
          <span className="text-xs font-bold text-white font-mono group-hover:text-[#FF6E17] transition-colors">
            {service.startingPrice || 'Custom Scope'}
          </span>
        </div>

        <Magnetic>
          <button
            type="button"
            onClick={() => {
              if (onSelectService) {
                onSelectService(service.title);
              } else {
                const event = new CustomEvent('boostify_populate_inquiry', {
                  detail: { services: [service.title] },
                });
                window.dispatchEvent(event);
                const contactEl = document.getElementById('contact');
                if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group/btn relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-white/10 border border-white/15 hover:border-[#FF6E17] transition-all duration-500 cursor-pointer shadow-sm select-none"
          >
            {/* Smooth wavy liquid orange fill */}
            <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 bg-gradient-to-r from-[#FF6E17] via-[#ff853a] to-[#F4511E] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-600 ease-out" />
              <span className="absolute -inset-x-full inset-y-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]" />
            </span>
            <span className="relative z-10 flex items-center gap-1.5">
              <span>Inquire</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </span>
          </button>
        </Magnetic>
      </div>
    </LiquidGlass>
  );
};
