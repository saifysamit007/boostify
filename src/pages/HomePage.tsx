import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SiteSettings, 
  Service, 
  Project, 
  PricingPackage, 
  BlogPost, 
  Testimonial, 
  FAQ 
} from '../types';
import { MorphingBlob } from '../components/ui/MorphingBlob';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { GlassButton } from '../components/ui/GlassButton';
import { ProjectCard } from '../components/ui/ProjectCard';
import { ProjectCardSkeleton, BlogPostSkeleton } from '../components/ui/SkeletonCard';
import { ServiceCard } from '../components/ui/ServiceCard';
import { EstimatedBudgetCalculator } from '../components/ui/EstimatedBudgetCalculator';
import { ProjectInquiryForm } from '../components/ui/ProjectInquiryForm';
import { CollaboratorTicker } from '../components/ui/CollaboratorTicker';
import { useLanguage } from '../context/LanguageContext';
import { 
  ArrowDown, 
  Sparkles, 
  Check, 
  ArrowUpRight, 
  MessageSquare, 
  Mail, 
  MapPin, 
  ShieldCheck,
  ChevronDown,
  Layers,
  Zap,
  TrendingUp,
  Cpu,
  BookOpen
} from 'lucide-react';

interface HomePageProps {
  settings: SiteSettings;
  services: Service[];
  projects: Project[];
  packages: PricingPackage[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  isLoading?: boolean;
  onNavigate: (route: string) => void;
}

/**
 * ObservedSection: Uses native IntersectionObserver to trigger buttery smooth,
 * staggered scroll-reveal animations for each major section just like Lovable.dev.
 */
const ObservedSection: React.FC<{
  id?: string;
  className?: string;
  threshold?: number;
  children: (isVisible: boolean) => React.ReactNode;
}> = ({ id, className = '', threshold = 0.1, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -70px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <section id={id} ref={ref} className={className}>
      {children(isVisible)}
    </section>
  );
};

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  services,
  projects,
  packages,
  blogPosts,
  testimonials,
  faqs,
  isLoading = false,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const ALL_PROJECT_CATEGORIES = ['Web Design', 'Branding', 'Social Media', 'Motion', 'Video', 'Marketing'];
  
  const filterOptions = useMemo(() => {
    const visibilityMap = settings?.projectCategoryVisibility || {};
    const visible = ALL_PROJECT_CATEGORIES.filter(cat => {
      if (visibilityMap[cat] !== undefined) {
        return Boolean(visibilityMap[cat]);
      }
      return true; // default visible
    });
    return visible.length > 0 ? visible : ALL_PROJECT_CATEGORIES;
  }, [settings?.projectCategoryVisibility]);

  const [projectFilter, setProjectFilter] = useState<string>(() => filterOptions[0] || 'Web Design');

  // Keep projectFilter synchronized if the active category is hidden by admin
  useEffect(() => {
    if (!filterOptions.includes(projectFilter)) {
      setProjectFilter(filterOptions[0] || 'Web Design');
    }
  }, [filterOptions, projectFilter]);

  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);
  const [videoError, setVideoError] = useState(false);

  const filteredProjects = projects.filter(p => p.category === projectFilter);

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden">
      {/* ========================================================
          1. IMMERSIVE HERO SECTION
          Seamlessly positioned right below Navbar with zero black void
      ======================================================== */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16">
        {/* Background Video with Dynamic Blurriness & Dimming Controls */}
        {settings.hero.videoEnabled !== false && settings.hero.videoUrl && !videoError && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <video
              key={settings.hero.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
              style={{
                filter: `blur(${typeof settings.hero.videoBlur === 'number' ? settings.hero.videoBlur : 10}px)`,
                opacity: typeof settings.hero.videoOpacity === 'number' ? settings.hero.videoOpacity / 100 : 0.4,
              }}
              className="absolute inset-0 w-full h-full object-cover scale-110 transform-gpu transition-all duration-700 ease-out"
            >
              <source src={settings.hero.videoUrl} type="video/mp4" />
              <source src={settings.hero.videoUrl} type="video/webm" />
            </video>
            {/* Cinematic dark scrim & ambient tint overlay for ultra-crisp typography contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/50 to-[#050505]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,110,23,0.14)_0%,transparent_70%)]" />
          </div>
        )}

        {/* Organic Morphing Shapes for ambient wavy atmosphere */}
        <MorphingBlob
          color="orange"
          size="hero"
          className="-top-32 -left-40 opacity-40 pointer-events-none z-0"
          speed="slow"
        />
        <MorphingBlob
          color="magenta"
          size="lg"
          className="top-1/3 -right-32 opacity-30 pointer-events-none z-0"
          speed="medium"
        />
        <MorphingBlob
          color="deep-orange"
          size="md"
          className="bottom-10 left-1/4 opacity-20 pointer-events-none z-0"
          speed="slow"
        />

        {/* Hero Content with Smooth Entrance */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-6 pt-2 pb-6">
          {/* Availability Indicator */}
          {settings.availability.isAvailable && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-standard border border-white/15 text-xs text-neutral-300 shadow-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6E17] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6E17]" />
              </span>
              <span className="font-medium">{settings.availability.statusText}</span>
            </motion.div>
          )}

          {/* Oversized Editorial Headline with Spring Reveal */}
          <div className="space-y-3 overflow-hidden">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white uppercase leading-[0.95] select-none font-display">
              {settings.hero.headline.split('\n').map((line, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.12 + idx * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="block"
                >
                  {idx === 1 ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FF6E17] to-[#F4511E]">
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </motion.span>
              ))}
            </h1>
          </div>

          {/* Supporting Headline & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto space-y-3"
          >
            <p className="text-base sm:text-xl font-medium text-neutral-300 font-heading">
              {settings.hero.supportingHeadline}
            </p>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {settings.hero.supportingCopy}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-4 pt-3"
          >
            <GlassButton
              size="lg"
              withArrow
              onClick={() => scrollToSection('contact')}
            >
              {settings.hero.primaryCtaText}
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="lg"
              onClick={() => scrollToSection('work')}
            >
              {settings.hero.secondaryCtaText}
            </GlassButton>
          </motion.div>

          {/* Studio headquarters tag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-neutral-400"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF6E17]" />
            <span>Studio: 132, Gulshan 1, Dhaka 1212, Bangladesh</span>
          </motion.div>
        </div>

        {/* Scroll Indicator pointing directly to Selected Work */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          onClick={() => scrollToSection('work')}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer text-neutral-400 hover:text-white transition-colors z-10"
        >
          <span className="text-[10px] uppercase font-mono tracking-widest">Scroll</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-[#FF6E17]" />
        </motion.div>
      </section>

      {/* ========================================================
          2. SELECTED WORK (STAGGERED SCROLL-REVEAL VIA INTERSECTION OBSERVER)
      ======================================================== */}
      <ObservedSection id="work" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {isVisible => (
          <>
            <div
              className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 text-[#FF6E17] text-xs font-bold uppercase tracking-widest mb-2 font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('selected_work_title')}</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                  Case Studies & Craft
                </h2>
                <p className="text-sm text-neutral-400 mt-2 max-w-xl">
                  {t('selected_work_subtitle')} Every project is engineered for speed, emotion, and business impact.
                </p>
              </div>

              {/* Category Filter Controls */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl glass-subtle border border-white/10 self-start md:self-end">
                {filterOptions.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setProjectFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      projectFilter === cat
                        ? 'bg-[#FF6E17] text-white shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Grid with Staggered Cascading Reveal or Custom Dark Skeletons */}
            {isLoading ? (
              <div className={`grid gap-6 sm:gap-8 ${
                projectFilter === 'Social Media'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {[1, 2, 3, 4].map(n => (
                  <ProjectCardSkeleton key={n} isSocialMedia={projectFilter === 'Social Media'} />
                ))}
              </div>
            ) : (
              <div className={`grid gap-6 sm:gap-8 ${
                projectFilter === 'Social Media'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2'
              }`}>
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 32 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
                    transition={{
                      duration: 0.7,
                      delay: Math.min(idx * 0.08, 0.35),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-full"
                  >
                    <ProjectCard
                      project={project}
                      featured={false}
                      onClick={() => onNavigate(`/work/${project.slug}`)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            <div
              className={`mt-14 text-center transition-all duration-700 delay-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <GlassButton
                variant="secondary"
                size="md"
                withArrow
                onClick={() => onNavigate('/work')}
              >
                View Complete Work Archive
              </GlassButton>
            </div>
          </>
        )}
      </ObservedSection>

      {/* ========================================================
          3. SERVICES & DISCIPLINES (INTERSECTION OBSERVER STAGGER)
      ======================================================== */}
      <ObservedSection id="services" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {isVisible => (
          <>
            <div
              className={`text-center max-w-3xl mx-auto mb-16 space-y-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="inline-flex items-center gap-2 text-[#FF6E17] text-xs font-bold uppercase tracking-widest font-mono">
                <Layers className="w-4 h-4" />
                <span>{t('services_title')}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                Integrated Creative Disciplines
              </h2>
              <p className="text-sm text-neutral-400">
                {t('services_subtitle')} We provide end-to-end capabilities under unified creative direction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .filter(s => s.visibility)
                .map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    transition={{
                      duration: 0.6,
                      delay: Math.min(idx * 0.08, 0.35),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-full"
                  >
                    <ServiceCard
                      service={service}
                      onViewDetails={slug => onNavigate(`/services/${slug}`)}
                    />
                  </motion.div>
                ))}
            </div>
          </>
        )}
      </ObservedSection>

      {/* ========================================================
          4. CREATIVE PROCESS (INTERSECTION OBSERVER REVEAL)
      ======================================================== */}
      <ObservedSection id="process" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {isVisible => (
          <>
            <div
              className={`max-w-3xl mb-16 space-y-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
                {t('process_title')}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                How We Build Great Things
              </h2>
              <p className="text-sm text-neutral-400">
                {t('process_subtitle')} A transparent roadmap designed to eliminate guesswork and accelerate velocity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Discover',
                  desc: 'Deep-dive audit into your brand landscape, audience psychology, competitive hurdles, and conversion goals.',
                  deliverable: 'Strategy Brief & Architecture Map',
                },
                {
                  step: '02',
                  title: 'Strategize',
                  desc: 'Synthesizing insights into visual direction, wireframes, technical stack selection, and milestone roadmaps.',
                  deliverable: 'Figma Prototype & System Tokens',
                },
                {
                  step: '03',
                  title: 'Create',
                  desc: 'Engineering high-fidelity code, motion sequences, brand assets, and content with obsessive pixel-perfection.',
                  deliverable: 'Interactive Build & Media Suite',
                },
                {
                  step: '04',
                  title: 'Launch & Optimize',
                  desc: 'Rigorous QA testing, Core Web Vitals optimization, live deployment, and data-driven boosting iterations.',
                  deliverable: 'Global Deployment & Growth Review',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  transition={{
                    duration: 0.6,
                    delay: Math.min(idx * 0.08, 0.35),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full"
                >
                  <LiquidGlass
                    variant="standard"
                    interactive
                    className="p-8 h-full flex flex-col justify-between group hover:border-[#FF6E17]/40 transition-all duration-300"
                  >
                    <div>
                      <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6E17] to-[#F4511E] font-mono block mb-4 group-hover:scale-105 transition-transform origin-left">
                        {item.step}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#FF6E17] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 text-[11px] text-neutral-400">
                      <span className="text-white font-medium block">Key Output:</span>
                      <span>{item.deliverable}</span>
                    </div>
                  </LiquidGlass>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </ObservedSection>

      {/* ========================================================
          5. WHY BOOSTIFY (ASYMMETRIC INTERSECTION REVEAL)
      ======================================================== */}
      <ObservedSection className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {isVisible => (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div
              className={`lg:col-span-5 space-y-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
                The Agency Edge
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display leading-[1.05]">
                Strategy-Led Creativity. Measurable Returns.
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                We refuse to treat design as superficial ornament. At Boostify, every line of code, motion curve, and ad creative is explicitly aligned with your business objectives.
              </p>

              <div className="pt-2">
                <GlassButton
                  size="md"
                  withArrow
                  onClick={() => onNavigate('/about')}
                >
                  Learn Our Agency Story
                </GlassButton>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Zap,
                  title: 'High Velocity Execution',
                  desc: 'Fast turnarounds without bloated agency bureaucracy. Direct access to lead designers and engineers.',
                },
                {
                  icon: Cpu,
                  title: 'Modern Architecture',
                  desc: 'Engineered on React, Vite, and Cloud Firestore for sub-second load times and fluid mobile experiences.',
                },
                {
                  icon: TrendingUp,
                  title: 'Performance Marketing',
                  desc: 'Integrated Meta & Google Ads boosting configured with strict pixel attribution and conversion tracking.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Gulshan 1 Headquarters',
                  desc: 'Rooted in Dhaka’s premier commercial district, delivering international agency caliber with local accountability.',
                },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      transitionDuration: '700ms',
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: `${120 + idx * 80}ms`,
                    }}
                    className={`transition-all ${
                      isVisible
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-10 scale-[0.98]'
                    }`}
                  >
                    <LiquidGlass
                      variant="subtle"
                      interactive
                      className="p-6 h-full hover:border-[#FF6E17]/30 transition-all duration-300"
                    >
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#FF6E17] w-fit mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white mb-2">{card.title}</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">{card.desc}</p>
                    </LiquidGlass>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ObservedSection>

      {/* ========================================================
          6. PRICING PACKAGES & BUDGET ESTIMATOR
      ======================================================== */}
      <ObservedSection id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {isVisible => (
          <>
            <div
              className={`text-center max-w-3xl mx-auto mb-16 space-y-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
                Transparent Investment
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                Flexible Service Packages
              </h2>
              <p className="text-sm text-neutral-400">
                Predictable sprint packages and custom scope retainers tailored to your stage of growth.
              </p>
            </div>

            {/* Pricing Cards with Cascading Reveal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {packages
                .filter(p => p.visibility)
                .map((pkg, idx) => (
                  <div
                    key={pkg.id}
                    style={{
                      transitionDuration: '700ms',
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: `${120 + idx * 100}ms`,
                    }}
                    className={`transition-all ${
                      isVisible
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-10 scale-[0.98]'
                    }`}
                  >
                    <LiquidGlass
                      variant={pkg.featured ? 'elevated' : 'standard'}
                      withOrangeGlow={pkg.featured}
                      interactive
                      className={`p-8 h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
                        pkg.featured ? 'border-[#FF6E17] ring-1 ring-[#FF6E17]/40' : ''
                      }`}
                    >
                      <div>
                        {pkg.featured && (
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#FF6E17] text-white mb-4 shadow-md">
                            Most Popular Sprint
                          </span>
                        )}
                        <h3 className="text-2xl font-bold text-white tracking-tight mb-2">{pkg.title}</h3>
                        <p className="text-xs text-neutral-300 leading-relaxed mb-6">{pkg.tagline}</p>

                        <div className="mb-6 pb-6 border-b border-white/10">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                            {pkg.price}
                          </span>
                          <span className="text-xs text-neutral-400 block mt-1 font-mono">
                            {pkg.billingModel}
                          </span>
                        </div>

                        {/* Deliverables */}
                        <div className="space-y-2.5 mb-8">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2 font-semibold">
                            Package Inclusions
                          </span>
                          {pkg.deliverables.map((deliv, dIdx) => (
                            <div key={dIdx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                              <Check className="w-3.5 h-3.5 text-[#FF6E17] shrink-0 mt-0.5" />
                              <span>{deliv}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10 space-y-3">
                        <div className="flex justify-between text-xs text-neutral-400 font-mono">
                          <span>Revisions:</span>
                          <span className="text-white">{pkg.revisions}</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-400 font-mono">
                          <span>Timeline:</span>
                          <span className="text-white">{pkg.estimatedDelivery}</span>
                        </div>

                        <GlassButton
                          variant={pkg.featured ? 'primary' : 'secondary'}
                          size="md"
                          withArrow
                          className="w-full mt-2"
                          onClick={() => {
                            const event = new CustomEvent('boostify_populate_inquiry', {
                              detail: {
                                services: [pkg.title],
                                budgetRange: pkg.price,
                                timeline: pkg.estimatedDelivery,
                                summary: `Package Inquiry: ${pkg.title} (${pkg.price})`,
                              },
                            });
                            window.dispatchEvent(event);
                            scrollToSection('contact');
                          }}
                        >
                          Select {pkg.title}
                        </GlassButton>
                      </div>
                    </LiquidGlass>
                  </div>
                ))}
            </div>

            {/* Section 15: Interactive Budget Estimator with Smooth Entrance */}
            <div
              className={`pt-8 transition-all duration-700 delay-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.98]'
              }`}
            >
              <EstimatedBudgetCalculator />
            </div>
          </>
        )}
      </ObservedSection>

      {/* ========================================================
          7. TESTIMONIALS & COLLABORATOR SHOWCASE (SEAMLESS INFINITE LOOP MARQUEE)
      ======================================================== */}
      <ObservedSection className="relative py-24 border-t border-white/10 overflow-hidden">
        {isVisible => (
          <>
            <div
              className={`text-center max-w-3xl mx-auto mb-10 px-4 sm:px-6 lg:px-8 space-y-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
                Verified Endorsements & Real Client Trust
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                What Collaborators Say
              </h2>
              <p className="text-sm text-neutral-400">
                Direct feedback from founders, growth executives, and brand leaders across Fiverr Pro, WhatsApp, Instagram, and agency retainers.
              </p>
            </div>

            <div
              className={`transition-all duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <CollaboratorTicker testimonials={testimonials} />
            </div>
          </>
        )}
      </ObservedSection>

      {/* ========================================================
          8. EDITORIAL INSIGHTS & DISPATCHES (STAGGERED SCROLL-REVEAL)
      ======================================================== */}
      <ObservedSection id="insights" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {isVisible => (
          <>
            <div
              className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block mb-2">
                  Editorial & Insights
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                  Perspectives & Dispatches
                </h2>
                <p className="text-sm text-neutral-400 mt-2 max-w-xl">
                  Strategic essays on performance engineering, brand motion systems, and creative technology.
                </p>
              </div>

              <GlassButton
                variant="secondary"
                size="md"
                withArrow
                onClick={() => onNavigate('/insights')}
                className="self-start md:self-end"
              >
                Explore All Articles
              </GlassButton>
            </div>

            {/* Articles Grid with Dark Mode Skeletons or Staggered Reveal */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <BlogPostSkeleton key={n} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogPosts
                  .filter(b => b.status === 'published')
                  .slice(0, 3)
                  .map((post, idx) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 32 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
                      transition={{
                        duration: 0.7,
                        delay: Math.min(idx * 0.1, 0.35),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      onClick={() => onNavigate(`/insights/${post.slug}`)}
                      className="group rounded-2xl overflow-hidden glass-standard border border-white/10 hover:border-white/25 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[16/10] overflow-hidden bg-neutral-900 relative">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                          />
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                            {post.category}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono mb-3">
                            <span>{post.publishedDate}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                          </div>

                          <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-[#FF6E17] transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 pt-0 flex items-center justify-between border-t border-white/10 text-xs">
                        <span className="text-neutral-400 font-medium">{post.author.name}</span>
                        <span className="text-[#FF6E17] font-bold flex items-center gap-1 group-hover:underline">
                          Read <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </>
        )}
      </ObservedSection>

      {/* ========================================================
          9. FAQ ACCORDION (INTERSECTION OBSERVER STAGGER)
      ======================================================== */}
      <ObservedSection id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/10">
        {isVisible => (
          <>
            <div
              className={`text-center mb-16 space-y-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
                Clarity & Expectations
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-neutral-400">
                Straightforward answers regarding our collaboration process, pricing, and turnaround.
              </p>
            </div>

            <div className="space-y-4">
              {faqs
                .filter(f => f.visibility)
                .map((faq, idx) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      style={{
                        transitionDuration: '650ms',
                        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        transitionDelay: `${80 + idx * 50}ms`,
                      }}
                      className={`transition-all ${
                        isVisible
                          ? 'opacity-100 translate-y-0 scale-100'
                          : 'opacity-0 translate-y-8 scale-[0.98]'
                      }`}
                    >
                      <LiquidGlass
                        variant="subtle"
                        interactive
                        className="p-6 transition-all duration-300 hover:border-white/20"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                        >
                          <span className={`text-base font-bold tracking-tight transition-colors duration-250 ${
                            isOpen ? 'text-[#FF6E17]' : 'text-white group-hover:text-neutral-200'
                          }`}>
                            {faq.question}
                          </span>
                          <div
                            className={`p-2 rounded-full border transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
                              isOpen
                                ? 'bg-[#FF6E17] border-[#FF6E17] text-white rotate-180 shadow-md'
                                : 'border-white/15 text-neutral-400 rotate-0 group-hover:border-white/30 group-hover:text-white'
                            }`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              key={`faq-answer-${faq.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{
                                height: 'auto',
                                opacity: 1,
                                transition: {
                                  height: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
                                  opacity: { duration: 0.28, delay: 0.08, ease: 'easeOut' },
                                },
                              }}
                              exit={{
                                height: 0,
                                opacity: 0,
                                transition: {
                                  height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                                  opacity: { duration: 0.18, ease: 'easeIn' },
                                },
                              }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t border-white/10 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </LiquidGlass>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </ObservedSection>

      {/* ========================================================
          10. HIGH-CONVERSION CONTACT SECTION
      ======================================================== */}
      <ObservedSection id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        {isVisible => (
          <>
            <div
              className={`text-center max-w-3xl mx-auto mb-16 space-y-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
                Start a Collaboration
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase font-display">
                {t('contact_title')}
              </h2>
              <p className="text-base text-neutral-300 max-w-xl mx-auto">
                {t('contact_subtitle')}
              </p>

              {/* Quick Contact Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <a
                  href="https://wa.me/8801889010834"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden px-4 py-2.5 rounded-full glass-standard border border-white/15 text-white hover:border-[#FF6E17] text-xs font-semibold flex items-center gap-2 transition-all duration-500 shadow-sm"
                >
                  <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FF6E17] via-[#ff853a] to-[#F4511E] opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out" />
                    <span className="absolute -inset-x-full inset-y-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                  </span>
                  <span className="relative z-10 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#FF6E17] group-hover:text-white transition-colors duration-300" />
                    <span>WhatsApp: +8801889010834</span>
                  </span>
                </a>

                <a
                  href="mailto:saifysamit456@gmail.com"
                  className="group relative overflow-hidden px-4 py-2.5 rounded-full glass-standard border border-white/15 text-white hover:border-[#FF6E17] text-xs font-semibold flex items-center gap-2 transition-all duration-500 shadow-sm"
                >
                  <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FF6E17] via-[#ff853a] to-[#F4511E] opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out" />
                    <span className="absolute -inset-x-full inset-y-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                  </span>
                  <span className="relative z-10 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#FF6E17] group-hover:text-white transition-colors duration-300" />
                    <span>saifysamit456@gmail.com</span>
                  </span>
                </a>
              </div>
            </div>

            {/* Multi-step Project Inquiry Form with Slide Reveal */}
            <div
              className={`transition-all duration-700 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.98]'
              }`}
            >
              <ProjectInquiryForm />
            </div>
          </>
        )}
      </ObservedSection>
    </div>
  );
};
