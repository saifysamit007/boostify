import React, { useState, useEffect } from 'react';
import { LiquidGlass } from './LiquidGlass';
import { GlassButton } from './GlassButton';
import { CookiePreferences } from '../../types';
import { Cookie, Settings2, Check, X, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CookieConsent: React.FC = () => {
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    try {
      const stored = localStorage.getItem('boostify_cookies');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: '',
      decided: false,
    };
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!preferences.decided) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [preferences.decided]);

  // Global event listener so the footer can re-open cookie preferences anytime
  useEffect(() => {
    const handleReopen = () => {
      setShowDetails(true);
      setIsOpen(true);
    };
    window.addEventListener('boostify_open_cookie_settings', handleReopen);
    return () => window.removeEventListener('boostify_open_cookie_settings', handleReopen);
  }, []);

  const saveSettings = (newPrefs: Partial<CookiePreferences>) => {
    const updated: CookiePreferences = {
      necessary: true,
      analytics: newPrefs.analytics ?? preferences.analytics,
      marketing: newPrefs.marketing ?? preferences.marketing,
      timestamp: new Date().toISOString(),
      decided: true,
    };
    setPreferences(updated);
    localStorage.setItem('boostify_cookies', JSON.stringify(updated));
    setIsOpen(false);
  };

  const handleAcceptAll = () => {
    saveSettings({ analytics: true, marketing: true });
  };

  const handleRejectOptional = () => {
    saveSettings({ analytics: false, marketing: false });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <LiquidGlass variant="elevated" className="p-6 shadow-2xl border border-white/20">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FF6E17]/15 text-[#FF6E17] border border-[#FF6E17]/30">
              <Cookie className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base tracking-tight">{t('cookie_title')}</h4>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-4">
          {t('cookie_desc')}
        </p>

        {showDetails && (
          <div className="space-y-3 p-3.5 mb-4 rounded-xl bg-black/40 border border-white/10 text-xs">
            {/* Necessary */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">{t('cookie_necessary')}</span>
                <span className="text-neutral-400 text-[11px]">Core functionality, themes & authentication.</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                Always Active
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <span className="font-semibold text-white block">{t('cookie_analytics')}</span>
                <span className="text-neutral-400 text-[11px]">Site speed, page paths & UX diagnostics.</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={e => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                className="w-4 h-4 rounded accent-[#FF6E17] cursor-pointer"
              />
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <span className="font-semibold text-white block">{t('cookie_marketing')}</span>
                <span className="text-neutral-400 text-[11px]">Campaign attribution & social boost tracking.</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={e => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                className="w-4 h-4 rounded accent-[#FF6E17] cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors underline-offset-4 hover:underline"
          >
            <Settings2 className="w-3.5 h-3.5" />
            {showDetails ? 'Hide Options' : 'Custom Preferences'}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleRejectOptional}
              className="px-3.5 py-2 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Essential Only
            </button>
            <GlassButton
              size="sm"
              onClick={showDetails ? () => saveSettings(preferences) : handleAcceptAll}
            >
              {showDetails ? t('cookie_save') : t('cookie_accept_all')}
            </GlassButton>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
};
