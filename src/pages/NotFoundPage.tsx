import React from 'react';
import { GlassButton } from '../components/ui/GlassButton';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { MorphingBlob } from '../components/ui/MorphingBlob';
import { Compass, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden pt-20">
      <MorphingBlob color="orange" size="lg" className="-top-20 -left-20 opacity-30" />
      <MorphingBlob color="magenta" size="md" className="bottom-10 -right-20 opacity-20" />

      <LiquidGlass variant="elevated" className="p-8 sm:p-14 text-center max-w-lg mx-auto border border-white/20">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-[#FF6E17] flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6E17] to-[#F4511E] font-mono block mb-2">
          404
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          Page Beyond Boundaries
        </h1>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-8">
          The coordinate you are attempting to reach does not exist or has been relocated to another vector in our architecture.
        </p>

        <div className="flex items-center justify-center gap-3">
          <GlassButton size="md" withArrow onClick={() => onNavigate('/')}>
            Return to Homepage
          </GlassButton>
        </div>
      </LiquidGlass>
    </div>
  );
};
