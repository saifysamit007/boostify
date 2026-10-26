import React, { useState, useEffect } from 'react';
import { LiquidGlass } from './LiquidGlass';
import { GlassButton } from './GlassButton';
import { submitInquiry } from '../../services/dataService';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

const SERVICE_OPTIONS = [
  'Website Design & Development',
  'UI/UX & Digital Product Design',
  'Graphic Design & Brand Identity',
  'Motion Graphics & Animation',
  'Video Editing & Content Production',
  'Social Media Management',
  'Paid Advertising & Social Media Boosting',
  'Digital Marketing & Creative Strategy',
];

const BUDGET_OPTIONS = [
  'Under $1,000 / ৳100K',
  '$1,000 – $2,500 / ৳120K–৳300K',
  '$2,500 – $5,000 / ৳300K–৳600K',
  '$5,000+ / ৳600K+',
  'Custom Enterprise Scope',
];

const TIMELINE_OPTIONS = [
  'Rush (1–2 Weeks)',
  'Standard (3–4 Weeks)',
  'Flexible (1–2 Months)',
  'Quarterly Retainer',
];

export const ProjectInquiryForm: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>(['Website Design & Development']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [brief, setBrief] = useState('');
  const [referenceUrls, setReferenceUrls] = useState('');
  const [budgetRange, setBudgetRange] = useState('$1,000 – $2,500 / ৳120K–৳300K');
  const [timeline, setTimeline] = useState('Standard (3–4 Weeks)');
  const [contactPreference, setContactPreference] = useState<'whatsapp' | 'email' | 'phone'>('whatsapp');
  const [phone, setPhone] = useState('');
  const [consentData, setConsentData] = useState(true);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  // Listen for auto-fill events from Budget Estimator
  useEffect(() => {
    const handlePopulate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        services: string[];
        budgetRange: string;
        timeline: string;
        summary: string;
      }>;
      if (customEvent.detail) {
        if (customEvent.detail.services && customEvent.detail.services.length > 0) {
          setSelectedServices(customEvent.detail.services);
        }
        if (customEvent.detail.budgetRange) {
          setBudgetRange(customEvent.detail.budgetRange);
        }
        if (customEvent.detail.timeline) {
          setTimeline(customEvent.detail.timeline);
        }
        if (customEvent.detail.summary) {
          setBrief(prev => prev ? `${prev}\n\n[Budget Estimator] ${customEvent.detail.summary}` : `[Budget Estimator] ${customEvent.detail.summary}`);
        }
      }
    };

    window.addEventListener('boostify_populate_inquiry', handlePopulate);
    return () => window.removeEventListener('boostify_populate_inquiry', handlePopulate);
  }, []);

  const toggleService = (srv: string) => {
    setSelectedServices(prev =>
      prev.includes(srv)
        ? prev.length > 1
          ? prev.filter(s => s !== srv)
          : prev
        : [...prev, srv]
    );
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please provide your name.';
    if (!email.trim()) {
      errs.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email format.';
    }
    if (!brief.trim() || brief.trim().length < 10) {
      errs.brief = 'Please describe your project goals (at least 10 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 2 && !validateStep2()) {
      return;
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentData) {
      setErrors({ consent: 'Please accept the data processing consent to proceed.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await submitInquiry({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        services: selectedServices,
        brief: brief.trim(),
        referenceUrls: referenceUrls.trim() || undefined,
        budgetRange,
        timeline,
        contactPreference,
        phone: phone.trim() || undefined,
        consentData,
        newsletterOptIn,
      });

      if (result.success) {
        setIsSubmitted(true);
        setSubmittedId(result.id);
      } else {
        setErrors({ submit: result.error || 'Failed to submit inquiry. Please try again.' });
      }
    } catch {
      setErrors({ submit: 'An error occurred during submission. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <LiquidGlass variant="elevated" className="p-8 md:p-12 text-center max-w-2xl mx-auto border border-emerald-500/30">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-2">
          Inquiry Successfully Dispatched
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">
          Thank you, {name}!
        </h3>
        <p className="text-neutral-300 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
          We have received your project details and assigned Reference ID: <strong className="text-white font-mono">{submittedId}</strong>. 
          Our creative director will review your brief and respond via <strong className="text-[#FF6E17] capitalize">{contactPreference}</strong> within 24 hours.
        </p>
        <div className="p-4 rounded-xl bg-black/60 border border-white/10 mb-8 text-xs text-neutral-400 flex items-center justify-center gap-4">
          <span>Need immediate assistance?</span>
          <a
            href="https://wa.me/8801889010834"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6E17] font-semibold hover:underline flex items-center gap-1"
          >
            WhatsApp +8801889010834 <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        <GlassButton
          variant="secondary"
          onClick={() => {
            setIsSubmitted(false);
            setStep(1);
            setName('');
            setEmail('');
            setBrief('');
          }}
        >
          Submit Another Inquiry
        </GlassButton>
      </LiquidGlass>
    );
  }

  return (
    <LiquidGlass variant="elevated" className="p-6 md:p-10 max-w-3xl mx-auto border border-white/15">
      {/* Progress Bar & Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2">
          <span>
            Step {step} of 4: {' '}
            <strong className="text-white">
              {step === 1 && 'What do you need?'}
              {step === 2 && 'Tell us about your project'}
              {step === 3 && 'Scope & budget'}
              {step === 4 && 'Review & submit'}
            </strong>
          </span>
          <span className="text-[#FF6E17] font-mono">{step * 25}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF6E17] to-[#F4511E] transition-all duration-300 rounded-full"
            style={{ width: `${step * 25}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1: SERVICES */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Which services do you require?</h4>
              <p className="text-xs text-neutral-400">Select all that apply to your current roadmap.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICE_OPTIONS.map(srv => {
                const isSelected = selectedServices.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleService(srv)}
                    className={`p-4 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#FF6E17] bg-[#FF6E17]/10 text-white font-semibold ring-1 ring-[#FF6E17]'
                        : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20'
                    }`}
                  >
                    <span>{srv}</span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-2 border ${
                        isSelected
                          ? 'bg-[#FF6E17] border-[#FF6E17] text-white'
                          : 'border-neutral-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: PROJECT & CONTACT DETAILS */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-bold text-white mb-1">Tell us about your brand & vision</h4>
              <p className="text-xs text-neutral-400">We keep all project briefs strictly confidential.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Your Full Name <span className="text-[#FF6E17]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Saify Samit"
                  className={`w-full rounded-xl bg-black/60 border px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17] ${
                    errors.name ? 'border-red-500' : 'border-white/15'
                  }`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Business Email <span className="text-[#FF6E17]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full rounded-xl bg-black/60 border px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17] ${
                    errors.email ? 'border-red-500' : 'border-white/15'
                  }`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Company or Brand Name (Optional)
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Lumina Digital Ltd."
                className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Project Overview & Goals <span className="text-[#FF6E17]">*</span>
              </label>
              <textarea
                rows={4}
                value={brief}
                onChange={e => setBrief(e.target.value)}
                placeholder="What are you building? What problems are you solving? What is your desired outcome?"
                className={`w-full rounded-xl bg-black/60 border px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17] ${
                  errors.brief ? 'border-red-500' : 'border-white/15'
                }`}
              />
              {errors.brief && <p className="text-red-400 text-xs mt-1">{errors.brief}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Reference URLs or Inspiration (Optional)
              </label>
              <input
                type="text"
                value={referenceUrls}
                onChange={e => setReferenceUrls(e.target.value)}
                placeholder="https://yourcurrentsite.com, competitor links, Figma..."
                className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17]"
              />
            </div>
          </div>
        )}

        {/* STEP 3: SCOPE, BUDGET & PREFERENCE */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold text-white mb-1">Scope, Budget & Timeline</h4>
              <p className="text-xs text-neutral-400">Aligning expectations early guarantees a successful sprint.</p>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2.5">
                Approximate Budget Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BUDGET_OPTIONS.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudgetRange(b)}
                    className={`p-3 rounded-xl border text-xs text-left transition-all ${
                      budgetRange === b
                        ? 'border-[#FF6E17] bg-[#FF6E17]/10 text-white font-bold ring-1 ring-[#FF6E17]'
                        : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2.5">
                Desired Launch Timeline
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TIMELINE_OPTIONS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeline(t)}
                    className={`p-3 rounded-xl border text-xs text-center transition-all ${
                      timeline === t
                        ? 'border-[#FF6E17] bg-[#FF6E17]/10 text-white font-bold ring-1 ring-[#FF6E17]'
                        : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact preference */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2.5">
                Preferred Contact Channel
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'phone', label: 'Phone Call', icon: Phone },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setContactPreference(item.id as any)}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-center gap-2 transition-all ${
                        contactPreference === item.id
                          ? 'border-[#FF6E17] bg-[#FF6E17]/10 text-white font-bold ring-1 ring-[#FF6E17]'
                          : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#FF6E17]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {(contactPreference === 'whatsapp' || contactPreference === 'phone') && (
                <div className="mt-3">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter WhatsApp or Phone number (with country code, e.g. +8801889010834)"
                    className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold text-white mb-1">Review Your Project Scope</h4>
              <p className="text-xs text-neutral-400">Confirm your details before sending to Boostify.</p>
            </div>

            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-neutral-400">Client:</span>
                <span className="font-semibold text-white">{name} ({email})</span>
              </div>
              {company && (
                <div className="flex justify-between pb-2 border-b border-white/5">
                  <span className="text-neutral-400">Company:</span>
                  <span className="font-semibold text-white">{company}</span>
                </div>
              )}
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-neutral-400">Budget Range:</span>
                <span className="font-semibold text-[#FF6E17]">{budgetRange}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-neutral-400">Timeline:</span>
                <span className="font-semibold text-white">{timeline}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-neutral-400">Channel:</span>
                <span className="font-semibold text-white capitalize">{contactPreference} {phone && `(${phone})`}</span>
              </div>
              <div>
                <span className="text-neutral-400 block mb-1">Selected Services:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedServices.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-white/10 text-neutral-200 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Consents */}
            <div className="space-y-3 pt-2 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentData}
                  onChange={e => setConsentData(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[#FF6E17] cursor-pointer shrink-0"
                />
                <span className="text-neutral-300">
                  I consent to Boostify storing and processing my project details to prepare a proposal. <span className="text-[#FF6E17]">*</span>
                </span>
              </label>
              {errors.consent && <p className="text-red-400 text-xs ml-7">{errors.consent}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={e => setNewsletterOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[#FF6E17] cursor-pointer shrink-0"
                />
                <span className="text-neutral-400">
                  Keep me updated with Boostify digital strategy insights and creative dispatches (optional, unsubscribe anytime).
                </span>
              </label>
            </div>

            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <GlassButton
              type="button"
              onClick={handleNext}
              size="md"
              withArrow
            >
              Continue
            </GlassButton>
          ) : (
            <GlassButton
              type="submit"
              size="md"
              disabled={isSubmitting}
              className="min-w-[150px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Dispatching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Proposal Request
                </span>
              )}
            </GlassButton>
          )}
        </div>
      </form>
    </LiquidGlass>
  );
};
