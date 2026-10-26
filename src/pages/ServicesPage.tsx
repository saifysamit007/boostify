import React from 'react';
import { Service } from '../types';
import { ServiceCard } from '../components/ui/ServiceCard';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { GlassButton } from '../components/ui/GlassButton';
import { ArrowLeft, ArrowUpRight, Check, Sparkles } from 'lucide-react';

interface ServicesPageProps {
  services: Service[];
  onNavigate: (route: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services, onNavigate }) => {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-16 space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
          Disciplines & Solutions
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase font-display">
          Capabilities Engineered for Scale
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
          From custom full-stack web platforms and Figma design systems to 3D motion identity and high-impact Meta/Google social media boosting. We engineer end-to-end digital solutions under unified creative direction.
        </p>
      </div>

      {/* Grid of all services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {services.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            onViewDetails={slug => onNavigate(`/services/${slug}`)}
          />
        ))}
      </div>

      {/* Custom Sprint Box */}
      <LiquidGlass variant="elevated" className="p-8 md:p-12 text-center max-w-3xl mx-auto border border-white/20">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
          Need a bespoke multidisciplinary squad?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto mb-6">
          We assemble tailored sprint pods combining UI designers, frontend engineers, motion artists, and performance marketers for complex enterprise initiatives.
        </p>
        <GlassButton size="lg" withArrow onClick={() => onNavigate('/contact')}>
          Request Custom Proposal
        </GlassButton>
      </LiquidGlass>
    </div>
  );
};

interface ServiceDetailProps {
  slug: string;
  services: Service[];
  onNavigate: (route: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailProps> = ({ slug, services, onNavigate }) => {
  const service = services.find(s => s.slug === slug);

  if (!service) {
    return (
      <div className="pt-32 pb-24 px-4 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Service not found</h2>
        <p className="text-xs text-neutral-400 mb-6">The requested service discipline could not be located.</p>
        <GlassButton onClick={() => onNavigate('/services')}>Return to Services</GlassButton>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <button
        onClick={() => onNavigate('/services')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Services</span>
      </button>

      <div className="space-y-6 mb-12">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-[#FF6E17]/20 border border-[#FF6E17]/40 text-[#FF6E17]">
            {service.category} Discipline
          </span>
          <span className="text-xs font-mono text-neutral-400 font-bold">
            {service.startingPrice || 'Custom Scope'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase font-display">
          {service.title}
        </h1>
        <p className="text-base sm:text-xl text-neutral-300 leading-relaxed font-heading">
          {service.shortDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xl font-bold text-white tracking-tight">Discipline Overview</h3>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {service.fullDescription}
          </p>

          <div className="pt-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              What We Deliver
            </h4>
            <div className="space-y-3">
              {service.deliverables.map((deliv, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-200">
                  <Check className="w-4 h-4 text-[#FF6E17] shrink-0 mt-0.5" />
                  <span className="font-medium">{deliv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <LiquidGlass variant="elevated" className="p-8 sticky top-28 space-y-6 border border-white/20">
            <h4 className="text-lg font-bold text-white tracking-tight">Initiate this Service</h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Book a discovery call with our Dhaka creative team to review your objectives and receive a comprehensive sprint proposal.
            </p>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-neutral-300 space-y-1">
              <span className="text-[10px] uppercase font-mono text-neutral-400 block">Indicative Investment</span>
              <span className="text-base font-bold text-white font-mono">{service.startingPrice || 'Custom Quote'}</span>
            </div>

            <GlassButton
              size="lg"
              withArrow
              className="w-full"
              onClick={() => {
                const event = new CustomEvent('boostify_populate_inquiry', {
                  detail: {
                    services: [service.title],
                    summary: `Inquiry for ${service.title}`,
                  },
                });
                window.dispatchEvent(event);
                onNavigate('/contact');
              }}
            >
              Start {service.title}
            </GlassButton>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
};
