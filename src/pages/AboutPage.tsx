import React from 'react';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { GlassButton } from '../components/ui/GlassButton';
import { MorphingBlob } from '../components/ui/MorphingBlob';
import { MapPin, Mail, MessageSquare, Target, Zap, Shield, Sparkles } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <MorphingBlob color="orange" size="lg" className="-top-20 -left-20 opacity-30" />
      <MorphingBlob color="magenta" size="md" className="top-1/2 -right-20 opacity-20" />

      {/* Header */}
      <div className="max-w-3xl mb-16 space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
          About Boostify
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase font-display leading-[0.95]">
          We Make Digital Feel Different.
        </h1>
        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-heading">
          Headquartered in Gulshan 1, Dhaka, Boostify is a modern digital growth and creative technology agency helping ambitious businesses establish a commanding presence across global digital channels.
        </p>
      </div>

      {/* Agency Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <LiquidGlass variant="standard" className="p-8 space-y-4">
          <span className="text-xs font-mono text-[#FF6E17] uppercase tracking-wider font-bold">
            The Purpose
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Craft That Demands Attention
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            In an ocean of generic templates and copy-paste branding, true distinction is rare. We believe that exceptional digital experiences require the precision of modern software engineering combined with the boldness of award-winning art direction.
          </p>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Every typeface, motion easing curve, and advertising dollar is deployed with intention to transform casual curiosity into genuine brand equity.
          </p>
        </LiquidGlass>

        <LiquidGlass variant="standard" className="p-8 space-y-4">
          <span className="text-xs font-mono text-[#FF6E17] uppercase tracking-wider font-bold">
            The Philosophy
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Accountability & Tangible Growth
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            We don’t measure success in vanity metrics or empty likes. We engineer high-speed websites that load in under 1 second, build design systems that scale across enterprise product lines, and manage paid boosting campaigns with rigorous attribution tracking.
          </p>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Our clients partner with us because we operate with transparent communication, predictable sprint milestones, and uncompromising technical standards.
          </p>
        </LiquidGlass>
      </div>

      {/* Studio Location & Contact Details */}
      <div className="p-8 md:p-12 rounded-3xl glass-elevated border border-white/15 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
              Studio Headquarters
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Dhaka, Bangladesh
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
              Located at 132, Gulshan 1, our studio serves as the creative nerve center for digital collaborations spanning Bangladesh, Southeast Asia, Europe, and North America.
            </p>

            <div className="space-y-2 pt-2 text-xs text-neutral-300 font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6E17]" />
                <span>132, Gulshan 1, Dhaka 1212, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF6E17]" />
                <a href="mailto:saifysamit456@gmail.com" className="hover:text-white transition-colors">
                  saifysamit456@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF6E17]" />
                <a href="https://wa.me/8801889010834" target="_blank" rel="noopener noreferrer" className="hover:text-white text-[#FF6E17] font-bold transition-colors">
                  WhatsApp: +8801889010834
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center gap-4">
            <GlassButton size="lg" withArrow onClick={() => onNavigate('/contact')}>
              Initiate a Discovery Call
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};
