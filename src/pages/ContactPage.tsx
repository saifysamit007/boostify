import React from 'react';
import { ProjectInquiryForm } from '../components/ui/ProjectInquiryForm';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { MorphingBlob } from '../components/ui/MorphingBlob';
import { Mail, MessageSquare, MapPin, Instagram, Facebook, Clock, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <MorphingBlob color="orange" size="lg" className="-top-20 -right-20 opacity-30" />
      <MorphingBlob color="deep-orange" size="md" className="top-1/2 -left-20 opacity-20" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
          Initiate Collaboration
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase font-display leading-[0.95]">
          Let’s Build Something Remarkable
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-heading max-w-xl mx-auto">
          Whether you require a flagship digital web platform, a 3D kinetic brand refresh, or aggressive social media boosting, our Dhaka studio is ready.
        </p>
      </div>

      {/* Contact Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* WhatsApp Card */}
        <LiquidGlass variant="standard" interactive className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Direct WhatsApp</h3>
          <p className="text-xs text-neutral-400 mb-4">Fastest response channel for project discovery & chat.</p>
          <a
            href="https://wa.me/8801889010834?text=Hello%20Boostify%2C%20I%20would%20like%20to%20discuss%20a%20new%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FF6E17] hover:underline"
          >
            +8801889010834 →
          </a>
        </LiquidGlass>

        {/* Email Card */}
        <LiquidGlass variant="standard" interactive className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#FF6E17]" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Executive Inquiries</h3>
          <p className="text-xs text-neutral-400 mb-4">Send formal RFPs, scopes, and pitch invitations.</p>
          <a
            href="mailto:saifysamit456@gmail.com"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white hover:text-[#FF6E17] transition-colors"
          >
            saifysamit456@gmail.com →
          </a>
        </LiquidGlass>

        {/* Studio Location Card */}
        <LiquidGlass variant="standard" interactive className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-[#FF6E17]" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Dhaka Studio</h3>
          <p className="text-xs text-neutral-400 mb-4">Gulshan 1, Dhaka 1212, Bangladesh.</p>
          <span className="text-xs font-mono text-neutral-300">
            Sunday – Thursday: 10:00 – 19:00 BST
          </span>
        </LiquidGlass>
      </div>

      {/* Multi-step Project Inquiry Section */}
      <div className="mb-20">
        <ProjectInquiryForm />
      </div>

      {/* Social Media Channels */}
      <div className="p-8 rounded-2xl glass-subtle border border-white/10 text-center max-w-xl mx-auto">
        <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mb-4">
          Connect Across Social Platforms
        </h4>
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://www.instagram.com/boostify.bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full glass-standard border border-white/15 text-xs font-semibold text-white hover:border-[#FF6E17] flex items-center gap-2 transition-all"
          >
            <Instagram className="w-4 h-4 text-[#FF6E17]" />
            <span>@boostify.bd</span>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61583335207234"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full glass-standard border border-white/15 text-xs font-semibold text-white hover:border-[#FF6E17] flex items-center gap-2 transition-all"
          >
            <Facebook className="w-4 h-4 text-[#FF6E17]" />
            <span>Boostify Facebook</span>
          </a>
        </div>
      </div>
    </div>
  );
};
