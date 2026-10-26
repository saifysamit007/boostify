import React, { useState } from 'react';
import { subscribeNewsletter } from '../../services/dataService';
import { GlassButton } from '../ui/GlassButton';
import { 
  Mail, 
  MapPin, 
  ArrowUpRight, 
  Send, 
  CheckCircle2, 
  Instagram, 
  Facebook, 
  MessageSquare,
  ShieldCheck,
  Cookie
} from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
  logoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  logoUrl = 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png',
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [logoLoadError, setLogoLoadError] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await subscribeNewsletter(email);
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Subscription failed. Please try again.');
    }
  };

  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('boostify_open_cookie_settings'));
  };

  return (
    <footer className="relative bg-[#000000] border-t border-white/10 pt-16 pb-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,rgba(255,110,23,0.12)_0%,transparent_70%)] blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Headquarters */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('/')}
              className="cursor-pointer inline-block"
            >
              {!logoLoadError ? (
                <img
                  src={logoUrl}
                  alt="Boostify Logo"
                  onError={() => setLogoLoadError(true)}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="text-2xl font-black tracking-tighter text-white">
                  BOOST<span className="text-[#FF6E17]">IFY</span>
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Boostify is a premier digital growth and creative technology agency headquartered in Gulshan 1, Dhaka. We partner with ambitious brands to engineer bespoke web platforms, cinematic brand identities, and high-performance digital marketing campaigns.
            </p>

            <div className="space-y-2 text-xs text-neutral-300 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF6E17] shrink-0 mt-0.5" />
                <span>132, Gulshan 1, Dhaka 1212, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF6E17] shrink-0" />
                <a href="mailto:saifysamit456@gmail.com" className="hover:text-white transition-colors">
                  saifysamit456@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#FF6E17] shrink-0" />
                <a
                  href="https://wa.me/8801889010834"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#FF6E17] font-semibold transition-colors"
                >
                  WhatsApp: +8801889010834
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-3">
              <a
                href="https://www.instagram.com/boostify.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:border-[#FF6E17] hover:bg-[#FF6E17]/10 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61583335207234"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:border-[#FF6E17] hover:bg-[#FF6E17]/10 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/8801889010834"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:border-[#FF6E17] hover:bg-[#FF6E17]/10 transition-all"
                aria-label="WhatsApp Direct"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('/work')} className="hover:text-white transition-colors">
                  Selected Work
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/services')} className="hover:text-white transition-colors">
                  Services & Disciplines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                  About Agency
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/process')} className="hover:text-white transition-colors">
                  Creative Process
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/insights')} className="hover:text-white transition-colors">
                  Insights
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                  Contact & Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Core Disciplines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Disciplines
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('/services/website-design-development')} className="hover:text-white transition-colors">
                  Web Design & Development
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/services/ui-ux-design')} className="hover:text-white transition-colors">
                  UI/UX & Product Design
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/services/graphic-design-brand-identity')} className="hover:text-white transition-colors">
                  Brand Identity & Graphics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/services/motion-graphics-animation')} className="hover:text-white transition-colors">
                  Motion Graphics & 3D
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/services/paid-ads-social-boosting')} className="hover:text-white transition-colors">
                  Social Media Boosting
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/services/video-editing-production')} className="hover:text-white transition-colors">
                  Video Content Production
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Agency Dispatches
            </h4>
            <p className="text-xs text-neutral-400">
              Curated breakdowns on digital product craft, motion engineering, and growth tactics from Dhaka to the world.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17]"
                />
              </div>

              <GlassButton
                type="submit"
                size="sm"
                className="w-full"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </GlassButton>

              {status === 'success' && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{message}</span>
                </div>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-[11px] pt-1">{message}</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} Boostify Agency. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => onNavigate('/insights')} className="hover:text-white transition-colors">
              Insights
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('/privacy')} className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('/terms')} className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={openCookiePreferences}
              className="hover:text-white transition-colors flex items-center gap-1 text-[#FF6E17]"
            >
              <Cookie className="w-3 h-3" />
              <span>Cookie Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
