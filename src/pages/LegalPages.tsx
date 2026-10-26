import React from 'react';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { GlassButton } from '../components/ui/GlassButton';
import { ArrowLeft, Cookie, Shield, FileText } from 'lucide-react';

interface LegalPageProps {
  onNavigate: (route: string) => void;
}

export const PrivacyPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      <div className="space-y-4 mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
          Legal & Compliance
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-neutral-400">Effective Date: October 2025 • Version 2.4</p>
      </div>

      <LiquidGlass variant="standard" className="p-8 md:p-12 prose prose-invert max-w-none text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">1. Overview</h2>
          <p>
            Boostify (&quot;we,&quot; &quot;our,&quot; or &quot;the Agency&quot;), headquartered at 132, Gulshan 1, Dhaka 1212, Bangladesh, is committed to safeguarding the privacy and confidentiality of visitors and client partners who submit inquiries through our digital platforms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">2. Information We Collect</h2>
          <p>
            When you complete our project inquiry form or subscribe to our agency dispatches, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your contact details (Full Name, Business Email Address, Phone / WhatsApp number).</li>
            <li>Organization name, project briefs, reference links, budget ranges, and desired timelines.</li>
            <li>Technical metadata (IP address, browser type, anonymous usage data via essential cookies).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">3. Purpose of Processing</h2>
          <p>
            We process your information strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Review project briefs and formulate accurate design, development, and marketing proposals.</li>
            <li>Coordinate milestone deliverables and direct communication via email or WhatsApp.</li>
            <li>Send periodic design engineering and marketing insights if explicitly opted-in.</li>
          </ul>
          <p>
            We never sell, lease, or monetize your contact information to third-party data brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">4. Security & Storage</h2>
          <p>
            Inquiries are stored using secure cloud infrastructure with restrictive role-based access control. Only authorized Boostify creative directors and project managers have access to project briefs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">5. Contact Regarding Data Rights</h2>
          <p>
            To request deletion or a copy of your submitted project inquiries, contact our data administrator at <a href="mailto:saifysamit456@gmail.com" className="text-[#FF6E17] underline">saifysamit456@gmail.com</a>.
          </p>
        </section>
      </LiquidGlass>
    </div>
  );
};

export const TermsPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      <div className="space-y-4 mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
          Client Agreement
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-neutral-400">Effective Date: October 2025 • Version 1.8</p>
      </div>

      <LiquidGlass variant="standard" className="p-8 md:p-12 prose prose-invert max-w-none text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">1. Services & Engagement</h2>
          <p>
            Boostify delivers bespoke digital services including Website Design & Development, UI/UX Design, Brand Identity, Motion Graphics, Video Production, and Social Media Advertising/Boosting as specified in individual Statement of Work (SOW) documents.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">2. Intellectual Property Rights</h2>
          <p>
            Upon receipt of 100% full project payment, all final approved deliverables, custom vector logo files, and customized frontend source code become the exclusive intellectual property of the client partner. Boostify retains the right to display non-confidential project artifacts and case studies in its agency portfolio and promotional materials.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">3. Payment Terms & Milestones</h2>
          <p>
            Sprint projects typically require a 50% commencement deposit prior to discovery kickoff and 50% upon final sign-off before production domain deployment. Monthly retainers are invoiced at the commencement of each billing cycle.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">4. Client Reviews & Feedback Windows</h2>
          <p>
            To maintain agreed sprint velocities, clients agree to provide feedback on milestone deliverables within three (3) business days. Delays in feedback may adjust projected deployment schedules.
          </p>
        </section>
      </LiquidGlass>
    </div>
  );
};

export const CookiePolicyPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('boostify_open_cookie_settings'));
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      <div className="space-y-4 mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
          Browser Storage
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
          Cookie Policy
        </h1>
        <p className="text-xs font-mono text-neutral-400">Effective Date: October 2025</p>
      </div>

      <LiquidGlass variant="standard" className="p-8 md:p-12 prose prose-invert max-w-none text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-tight">How Boostify Uses Cookies</h2>
          <p>
            We use minimal cookies and local storage tokens to retain user preferences (such as Dark/Light theme and English/Bengali language settings), maintain secure admin authentication, and analyze general page performance.
          </p>
        </section>

        <div className="p-6 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white text-sm block">Manage Your Cookie Preferences</span>
            <span className="text-xs text-neutral-400">Reconfigure essential, analytics, or marketing consent at any time.</span>
          </div>
          <GlassButton size="sm" onClick={openCookiePreferences}>
            Open Preferences
          </GlassButton>
        </div>
      </LiquidGlass>
    </div>
  );
};
