import React, { useState } from 'react';
import { LiquidGlass } from './LiquidGlass';
import { GlassButton } from './GlassButton';
import { Calculator, Check, Sparkles, ArrowRight, Info, DollarSign } from 'lucide-react';

interface EstimatorProps {
  onApplyEstimate?: (details: {
    services: string[];
    budgetRange: string;
    timeline: string;
    summary: string;
  }) => void;
}

const AVAILABLE_SERVICES = [
  { id: 'web', name: 'Website Design & Development', basePrice: 850 },
  { id: 'uiux', name: 'UI/UX & Product Design', basePrice: 750 },
  { id: 'branding', name: 'Brand Identity & Graphics', basePrice: 600 },
  { id: 'motion', name: 'Motion Graphics & Animation', basePrice: 550 },
  { id: 'video', name: 'Video Editing & Content', basePrice: 450 },
  { id: 'boosting', name: 'Social Media & Boosting', basePrice: 400 },
];

const ADDONS = [
  { id: 'seo', name: 'Comprehensive Technical SEO & Schema', price: 250 },
  { id: 'perf', name: 'Hyper-Performance & CDN Setup', price: 200 },
  { id: 'copy', name: 'Strategic Copywriting & Brand Messaging', price: 300 },
  { id: 'micro', name: 'Bespoke UI Micro-Animations & Lottie', price: 350 },
  { id: 'rush', name: 'Priority Express Delivery (Accelerated)', price: 400 },
];

export const EstimatedBudgetCalculator: React.FC<EstimatorProps> = ({ onApplyEstimate }) => {
  const [selectedServices, setSelectedServices] = useState<string[]>(['web']);
  const [complexity, setComplexity] = useState<'Startup' | 'Growth' | 'Enterprise'>('Growth');
  const [deliverableCount, setDeliverableCount] = useState<number>(4);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['seo']);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(s => s !== id) : prev) : [...prev, id]
    );
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Calculation logic
  const baseServiceTotal = selectedServices.reduce((sum, sId) => {
    const item = AVAILABLE_SERVICES.find(s => s.id === sId);
    return sum + (item ? item.basePrice : 0);
  }, 0);

  const complexityMultiplier = {
    Startup: 1.0,
    Growth: 1.45,
    Enterprise: 2.2,
  }[complexity];

  const deliverableFactor = 1 + (deliverableCount - 1) * 0.08;

  const addonsTotal = selectedAddons.reduce((sum, aId) => {
    const item = ADDONS.find(a => a.id === aId);
    return sum + (item ? item.price : 0);
  }, 0);

  const rawEstimate = Math.round(baseServiceTotal * complexityMultiplier * deliverableFactor + addonsTotal);
  const minEstimate = Math.round(rawEstimate * 0.9);
  const maxEstimate = Math.round(rawEstimate * 1.15);

  const BDT_RATE = 122; // 1 USD ~ 122 BDT

  const formatAmount = (usd: number) => {
    if (currency === 'BDT') {
      return `৳${(usd * BDT_RATE).toLocaleString()}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  const estimatedTimeline = {
    Startup: '7–12 Business Days',
    Growth: '14–21 Business Days',
    Enterprise: '4–6 Weeks Sprint',
  }[complexity];

  const handleTransferToInquiry = () => {
    const serviceNames = selectedServices.map(
      sId => AVAILABLE_SERVICES.find(s => s.id === sId)?.name || sId
    );
    const budgetRange = `${formatAmount(minEstimate)} – ${formatAmount(maxEstimate)} (${currency})`;
    const summary = `Estimated Scope: ${complexity} tier with ${deliverableCount} deliverables/pages. Selected add-ons: ${selectedAddons.join(', ') || 'None'}.`;

    if (onApplyEstimate) {
      onApplyEstimate({
        services: serviceNames,
        budgetRange,
        timeline: estimatedTimeline,
        summary,
      });
    } else {
      // scroll to contact form or trigger event
      const event = new CustomEvent('boostify_populate_inquiry', {
        detail: {
          services: serviceNames,
          budgetRange,
          timeline: estimatedTimeline,
          summary,
        },
      });
      window.dispatchEvent(event);

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <LiquidGlass variant="elevated" className="p-6 md:p-10 max-w-4xl mx-auto border border-white/15">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#FF6E17] text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Interactive Project Estimator</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Scope Your Project in Real Time
          </h3>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center p-1 rounded-full bg-black/60 border border-white/10 text-xs">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              currency === 'USD'
                ? 'bg-[#FF6E17] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('BDT')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              currency === 'BDT'
                ? 'bg-[#FF6E17] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            BDT (৳)
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Step 1: Services Selection */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">
            1. Select Required Services (Multi-select)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_SERVICES.map(srv => {
              const isSelected = selectedServices.includes(srv.id);
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => toggleService(srv.id)}
                  className={`text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#FF6E17] bg-[#FF6E17]/15 text-white shadow-sm'
                      : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <span className="font-semibold">{srv.name}</span>
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

        {/* Step 2: Project Complexity */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">
            2. Scale & Brand Tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(
              [
                { id: 'Startup', label: 'Startup / MVP', desc: 'Fast, focused launch sprint.' },
                { id: 'Growth', label: 'Growth / Scaling', desc: 'Bespoke design system & conversion flows.' },
                { id: 'Enterprise', label: 'Enterprise / Flagship', desc: 'High-volume architecture & custom features.' },
              ] as const
            ).map(tier => {
              const isSelected = complexity === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setComplexity(tier.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#FF6E17] bg-[#FF6E17]/10 text-white ring-1 ring-[#FF6E17]'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="block font-bold text-sm text-white mb-1">{tier.label}</span>
                  <span className="block text-xs text-neutral-400">{tier.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Key Deliverables / Pages Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              3. Deliverables / Scope Units
            </label>
            <span className="text-xs font-mono font-bold text-[#FF6E17] bg-[#FF6E17]/10 px-2.5 py-1 rounded-md border border-[#FF6E17]/30">
              {deliverableCount} {deliverableCount === 1 ? 'Unit / Page' : 'Units / Pages'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            value={deliverableCount}
            onChange={e => setDeliverableCount(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FF6E17]"
          />
          <div className="flex justify-between text-[11px] text-neutral-500 mt-1 font-mono">
            <span>1 (Focused Landing)</span>
            <span>6 (Full Platform)</span>
            <span>12+ (Omnichannel Ecosystem)</span>
          </div>
        </div>

        {/* Step 4: High-Value Add-ons */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">
            4. Specialized Add-ons
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ADDONS.map(addon => {
              const isChecked = selectedAddons.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isChecked
                      ? 'border-[#FF6E17]/60 bg-[#FF6E17]/10 text-white'
                      : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/20'
                  }`}
                >
                  <span className="font-medium text-left">{addon.name}</span>
                  <span className="font-mono text-neutral-400 font-semibold ml-2 shrink-0">
                    +{formatAmount(addon.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estimation Result Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-black/80 via-neutral-900/90 to-black/80 border border-[#FF6E17]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
              Indicative Investment Estimate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {formatAmount(minEstimate)} – {formatAmount(maxEstimate)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
              <span>⏱ Est. Timeline: <strong className="text-white">{estimatedTimeline}</strong></span>
              <span>•</span>
              <span>Revisions: <strong className="text-white">Included</strong></span>
            </div>
          </div>

          <GlassButton
            onClick={handleTransferToInquiry}
            size="lg"
            withArrow
            className="w-full md:w-auto shrink-0 shadow-lg hover:shadow-xl hover:shadow-black/50"
          >
            Apply Estimate & Inquire
          </GlassButton>
        </div>

        <div className="flex items-start gap-2 text-[11px] text-neutral-400 bg-white/5 p-3 rounded-xl border border-white/5">
          <Info className="w-4 h-4 shrink-0 text-[#FF6E17] mt-0.5" />
          <span>
            This calculator provides an indicative estimate based on typical project scopes at Boostify. Final quotes are confirmed during discovery based on exact specifications.
          </span>
        </div>
      </div>
    </LiquidGlass>
  );
};
