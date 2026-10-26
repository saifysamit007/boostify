import React from 'react';
import { CollaboratorPlatform } from '../../types';
import { ShieldCheck, CheckCircle2, MessageCircle, Instagram, Facebook, Globe } from 'lucide-react';

interface PlatformBadgeProps {
  platform?: CollaboratorPlatform;
  className?: string;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform = 'direct', className = '' }) => {
  switch (platform) {
    case 'fiverr':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 shadow-xs shadow-emerald-500/10 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11zm-7.6 1.4h-1.6v-5.2h1.6v5.2zm-4.3 0H9.5v-3.4H8v-1.4h1.5V7.4c0-1.5 1-2.2 2.4-2.2.6 0 1.2.1 1.5.3v1.3c-.2-.1-.5-.1-.8-.1-.7 0-1.1.4-1.1 1.1v.7h1.9v1.4h-1.8v3.4z" />
          </svg>
          <span>Fiverr Pro</span>
        </span>
      );

    case 'whatsapp':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 shadow-xs shadow-[#25D366]/10 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
          <MessageCircle className="w-3 h-3" />
          <span>WhatsApp</span>
        </span>
      );

    case 'instagram':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 text-pink-300 border border-pink-500/30 shadow-xs shadow-pink-500/10 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
          <Instagram className="w-3 h-3" />
          <span>Instagram</span>
        </span>
      );

    case 'facebook':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-900/40 text-blue-400 border border-blue-500/30 shadow-xs shadow-blue-500/10 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <Facebook className="w-3 h-3" />
          <span>Facebook</span>
        </span>
      );

    case 'discord':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#5865F2]/15 text-[#5865F2] border border-[#5865F2]/30 shadow-xs shadow-[#5865F2]/10 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2]" />
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span>Discord</span>
        </span>
      );

    case 'upwork':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-900/30 text-emerald-300 border border-emerald-400/30 shadow-xs ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Upwork</span>
        </span>
      );

    case 'direct':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-xs shadow-amber-500/10 ${className}`}
        >
          <Globe className="w-3 h-3" />
          <span>Direct Client</span>
        </span>
      );
  }
};

interface TrustedBadgeProps {
  className?: string;
  label?: string;
}

export const TrustedCustomerBadge: React.FC<TrustedBadgeProps> = ({ 
  className = '', 
  label = 'Trusted Customer' 
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-[#FF6E17]/20 to-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs shadow-amber-500/15 ${className}`}
      title="Verified Customer / Enterprise Stakeholder"
    >
      <ShieldCheck className="w-3 h-3 text-amber-400" />
      <span>{label}</span>
    </span>
  );
};
