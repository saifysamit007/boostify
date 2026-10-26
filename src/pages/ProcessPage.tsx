import React from 'react';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { GlassButton } from '../components/ui/GlassButton';
import { Check, ArrowRight, ShieldCheck, Clock, MessageSquare, Zap } from 'lucide-react';

interface ProcessPageProps {
  onNavigate: (route: string) => void;
}

export const ProcessPage: React.FC<ProcessPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      num: '01',
      title: 'Discovery & Strategic Alignment',
      duration: 'Day 1 – 3',
      summary: 'Before touching Figma or code, we deconstruct your market positioning, conversion friction, and primary objectives.',
      activities: [
        'Stakeholder discovery interview via Google Meet / Zoom',
        'Competitor benchmarking & whitespace opportunity mapping',
        'Technical stack & content architecture definition',
        'Milestone deliverables & sprint agreement sign-off',
      ],
      output: 'Comprehensive Strategic Brief & Sitemap Structure',
    },
    {
      num: '02',
      title: 'Design Architecture & Prototyping',
      duration: 'Day 4 – 10',
      summary: 'Translating strategy into clickable, high-fidelity Figma prototypes and scalable design system tokens.',
      activities: [
        'User flow & wireframe journey mapping',
        'Liquid glass visual style exploration & art direction',
        'Component token library (Colors, Typography, Spacing)',
        'Clickable desktop & mobile interactive prototype review',
      ],
      output: 'Validated Figma Design System & Milestone Sign-Off',
    },
    {
      num: '03',
      title: 'Engineering & Motion Production',
      duration: 'Day 10 – 20',
      summary: 'Crafting responsive code, fluid CSS micro-animations, 3D motion assets, and CMS datastore integrations.',
      activities: [
        'Custom React / TypeScript / Vite engineering',
        'Firebase Firestore & secure authentication wiring',
        'Motion graphic rendering & video post-production',
        'Responsive testing across 320px, tablet, and 4K viewports',
      ],
      output: 'Staging Environment Preview Ready for Client Review',
    },
    {
      num: '04',
      title: 'Launch, Boosting & Optimization',
      duration: 'Day 20 – Launch & Beyond',
      summary: 'Deploying to global CDN, setting up technical SEO, running pixel attribution, and monitoring conversion telemetry.',
      activities: [
        'Core Web Vitals & technical SEO compliance audit',
        'Meta CAPI & Google Analytics conversion event verification',
        'Live domain deployment with SSL & DNS configuration',
        'Post-launch paid boosting launch & 30-day monitoring',
      ],
      output: 'Production Launch & Growth Performance Dashboard',
    },
  ];

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-16 space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
          Our Framework
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase font-display leading-[0.95]">
          The 4-Stage Creative Process
        </h1>
        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-heading">
          High-end creative output should never be a mystery. We operate on a disciplined, transparent sprint cadence designed to keep you informed at every milestone.
        </p>
      </div>

      {/* Steps Breakdown */}
      <div className="space-y-8 mb-20">
        {steps.map((st, idx) => (
          <LiquidGlass key={idx} variant="standard" className="p-8 md:p-10 border border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6E17] to-[#F4511E] font-mono">
                    {st.num}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                    {st.duration}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{st.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">{st.summary}</p>
              </div>

              <div className="lg:col-span-5 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-2">
                  Key Sprint Activities
                </span>
                {st.activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-200">
                    <Check className="w-3.5 h-3.5 text-[#FF6E17] shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-3 p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF6E17] font-bold block">
                  Milestone Deliverable
                </span>
                <span className="text-xs font-bold text-white block leading-snug">
                  {st.output}
                </span>
              </div>
            </div>
          </LiquidGlass>
        ))}
      </div>

      {/* Collaboration Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <LiquidGlass variant="subtle" className="p-6">
          <MessageSquare className="w-5 h-5 text-[#FF6E17] mb-3" />
          <h4 className="text-base font-bold text-white mb-2">Direct WhatsApp & Slack</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            No gatekeepers or ticket queues. You communicate directly with the designers and engineers building your project.
          </p>
        </LiquidGlass>

        <LiquidGlass variant="subtle" className="p-6">
          <Clock className="w-5 h-5 text-[#FF6E17] mb-3" />
          <h4 className="text-base font-bold text-white mb-2">Predictable Milestones</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Every deliverable has a confirmed date. We provide regular Loom video walk-throughs and staging links for feedback.
          </p>
        </LiquidGlass>

        <LiquidGlass variant="subtle" className="p-6">
          <Zap className="w-5 h-5 text-[#FF6E17] mb-3" />
          <h4 className="text-base font-bold text-white mb-2">Iterative Revisions</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Structured review windows ensure your feedback is rapidly integrated without delaying the planned launch schedule.
          </p>
        </LiquidGlass>
      </div>

      {/* CTA */}
      <div className="text-center">
        <GlassButton size="lg" withArrow onClick={() => onNavigate('/contact')}>
          Ready to Initiate Stage 01?
        </GlassButton>
      </div>
    </div>
  );
};
