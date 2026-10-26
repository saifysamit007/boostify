import React, { useState, useEffect } from 'react';
import { GlassButton } from '../ui/GlassButton';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Shield } from 'lucide-react';
import { SiteSettings } from '../../types';

interface NavbarProps {
  currentRoute?: string;
  onNavigate: (route: string) => void;
  logoUrl?: string;
  announcement?: SiteSettings['announcement'];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute = '/',
  onNavigate,
  logoUrl = 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png',
  announcement,
}) => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav_work'), route: '/work' },
    { label: t('nav_services'), route: '/services' },
    { label: t('nav_about'), route: '/about' },
    { label: t('nav_process'), route: '/process' },
    { label: t('nav_insights'), route: '/insights' },
    { label: t('nav_contact'), route: '/contact' },
  ];

  const handleLinkClick = (route: string) => {
    onNavigate(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-500 ease-out ${
        isScrolled
          ? 'bg-[#050505]/85 backdrop-blur-2xl border-b border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85)]'
          : 'bg-[#050505]/30 backdrop-blur-md border-b border-white/5'
      }`}
    >
      {/* 1. Announcement Bar: Stays cleanly stacked above main navbar with zero overlap and zero layout jumping */}
      {announcement?.enabled && currentRoute !== '/admin' && (
        <div className="bg-gradient-to-r from-[#FF6E17] via-[#F4511E] to-[#D926A9] text-white text-[11px] sm:text-xs font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 border-b border-white/10 shadow-sm relative z-50">
          <span className="truncate">{announcement.text}</span>
          {announcement.url && (
            <a
              href={announcement.url}
              className="inline-flex items-center gap-1 underline underline-offset-2 text-white font-bold hover:text-black transition-colors ml-1 shrink-0"
            >
              {announcement.linkText || 'Explore'} →
            </a>
          )}
        </div>
      )}

      {/* 2. Main Navbar Bar: Perfectly flush with constant stable height for zero bumpy shifts */}
      <div className="py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <div
              onClick={() => handleLinkClick('/')}
              className="flex items-center cursor-pointer select-none py-1"
              title="Boostify Digital Agency"
            >
              {!logoLoadError ? (
                <img
                  src={logoUrl}
                  alt="Boostify Logo"
                  onError={() => setLogoLoadError(true)}
                  className="h-7 sm:h-8 w-auto object-contain transition-opacity duration-200 hover:opacity-90"
                />
              ) : (
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-white">
                  BOOST<span className="text-[#FF6E17]">IFY</span>
                </span>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 p-1.5 rounded-full glass-subtle border border-white/10">
              {navLinks.map(link => {
                const isActive = currentRoute === link.route;
                return (
                  <button
                    key={link.route}
                    onClick={() => handleLinkClick(link.route)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-white/15 text-white shadow-sm border border-white/10'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Admin status, Start Project CTA */}
            <div className="hidden md:flex items-center gap-3">
              {/* Admin Badge if authenticated */}
              {isAdmin && (
                <button
                  onClick={() => onNavigate('/admin')}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-[#FF6E17]/20 border border-[#FF6E17]/40 text-[#FF6E17] hover:bg-[#FF6E17]/30 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </button>
              )}

              {/* CTA */}
              <GlassButton
                size="sm"
                withArrow
                onClick={() => {
                  const contactEl = document.getElementById('contact');
                  if (contactEl && currentRoute === '/') {
                    contactEl.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    handleLinkClick('/contact');
                  }
                }}
              >
                {t('nav_start_project')}
              </GlassButton>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl glass-subtle text-white border border-white/10 hover:bg-white/10 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-elevated border-b border-white/15 px-6 py-8 mt-2 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col space-y-3">
              {navLinks.map(link => (
                <button
                  key={link.route}
                  onClick={() => handleLinkClick(link.route)}
                  className={`text-left text-base font-bold py-2 border-b border-white/5 transition-colors ${
                    currentRoute === link.route ? 'text-[#FF6E17]' : 'text-neutral-200'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {isAdmin && (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => handleLinkClick('/admin')}
                  className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-[#FF6E17]/20 border border-[#FF6E17]/40 text-[#FF6E17] flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
              </div>
            )}

            <GlassButton
              size="md"
              withArrow
              className="w-full"
              onClick={() => handleLinkClick('/contact')}
            >
              {t('nav_start_project')}
            </GlassButton>
          </div>
        )}
      </div>
    </header>
  );
};
