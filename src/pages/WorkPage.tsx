import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Project, SiteSettings } from '../types';
import { ProjectCard } from '../components/ui/ProjectCard';
import { ProjectCardSkeleton } from '../components/ui/SkeletonCard';
import { GlassButton } from '../components/ui/GlassButton';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { ArrowLeft, ArrowUpRight, Sparkles, Check, CheckCircle2, ExternalLink } from 'lucide-react';

interface WorkPageProps {
  projects: Project[];
  settings?: SiteSettings;
  isLoading?: boolean;
  onNavigate: (route: string) => void;
}

export const WorkPage: React.FC<WorkPageProps> = ({ projects, settings, isLoading = false, onNavigate }) => {
  const ALL_CATEGORIES = ['Web Design', 'Branding', 'Social Media', 'Motion', 'Video', 'Marketing'];
  
  const filters = useMemo(() => {
    const visibilityMap = settings?.projectCategoryVisibility || {};
    const visible = ALL_CATEGORIES.filter(cat => {
      if (visibilityMap[cat] !== undefined) {
        return Boolean(visibilityMap[cat]);
      }
      return true;
    });
    return visible.length > 0 ? visible : ALL_CATEGORIES;
  }, [settings?.projectCategoryVisibility]);

  const [selectedFilter, setSelectedFilter] = useState(() => filters[0] || 'Web Design');

  useEffect(() => {
    if (!filters.includes(selectedFilter)) {
      setSelectedFilter(filters[0] || 'Web Design');
    }
  }, [filters, selectedFilter]);

  const filtered = projects.filter(p => p.category === selectedFilter);

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header with Lovable-style entrance */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mb-12 space-y-4"
      >
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
          Portfolio & Case Studies
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase font-display">
          Selected Creative Work
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
          Explore our archive of bespoke web systems, 3D motion identities, and high-conversion brand architectures. Each case study represents an uncompromising commitment to craft and measurable performance.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-2 mb-12 p-1.5 rounded-2xl glass-subtle border border-white/10 w-fit"
      >
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === f
                ? 'bg-[#FF6E17] text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Projects Grid with Dark Mode Skeletons or Staggered Reveal */}
      {isLoading ? (
        <div className={`grid gap-6 sm:gap-8 mb-16 ${
          selectedFilter === 'Social Media'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <ProjectCardSkeleton key={n} isSocialMedia={selectedFilter === 'Social Media'} />
          ))}
        </div>
      ) : (
        <div className={`grid gap-6 sm:gap-8 mb-16 ${
          selectedFilter === 'Social Media'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {filtered.map((proj, idx) => (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.65,
                delay: Math.min(idx * 0.08, 0.35),
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              <ProjectCard
                project={proj}
                featured={false}
                onClick={() => onNavigate(`/work/${proj.slug}`)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="p-8 md:p-12 rounded-3xl glass-elevated border border-white/15 text-center max-w-3xl mx-auto">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
          Have a unique challenge in mind?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto mb-6">
          We collaborate with early-stage founders and enterprise leaders worldwide. Let’s talk through your vision.
        </p>
        <GlassButton size="lg" withArrow onClick={() => onNavigate('/contact')}>
          Start a Project
        </GlassButton>
      </div>
    </div>
  );
};

interface ProjectDetailProps {
  slug: string;
  projects: Project[];
  onNavigate: (route: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailProps> = ({ slug, projects, onNavigate }) => {
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    return (
      <div className="pt-32 pb-24 px-4 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Case study not found</h2>
        <p className="text-xs text-neutral-400 mb-6">The requested case study could not be located in our portfolio.</p>
        <GlassButton onClick={() => onNavigate('/work')}>Return to Portfolio</GlassButton>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/work')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Work</span>
      </button>

      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-white/10 text-[#FF6E17] border border-[#FF6E17]/30">
            {project.category}
          </span>
          <span className="text-xs font-mono text-neutral-400">{project.year}</span>
          {project.isDemo && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-white/10">
              Demonstration Case Study
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase font-display">
          {project.title}
        </h1>
        <p className="text-base sm:text-lg text-neutral-300 max-w-3xl leading-relaxed">
          {project.summary}
        </p>

        {project.liveUrl && (
          <div className="pt-2">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6E17] to-[#F4511E] text-white text-xs font-bold shadow-md border border-white/20 hover:border-white/40 transition-all duration-500 cursor-pointer select-none"
            >
              <span className="pointer-events-none absolute -inset-x-full inset-y-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]" />
              <span className="relative z-10 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>Visit Live Website</span>
              </span>
            </a>
          </div>
        )}
      </div>

      {/* Main Cover Media */}
      <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 mb-12 shadow-2xl bg-neutral-900">
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Metrics Row if available */}
      {project.metrics && project.metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {project.metrics.map((metric, idx) => (
            <LiquidGlass key={idx} variant="standard" className="p-6 text-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#FF6E17] font-mono block mb-1">
                {metric.value}
              </span>
              <span className="text-xs text-neutral-400 font-medium">{metric.label}</span>
            </LiquidGlass>
          ))}
        </div>
      )}

      {/* Case Study Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        <div className="lg:col-span-8 space-y-10">
          {/* Challenge */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">The Challenge</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{project.clientChallenge}</p>
          </div>

          {/* Strategy */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Creative & Technical Strategy</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{project.creativeStrategy}</p>
          </div>

          {/* Outcome */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Outcome & Commercial Impact</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{project.outcome}</p>
          </div>

          {/* Gallery Images */}
          {project.galleryImages && project.galleryImages.length > 1 && (
            <div className="space-y-6 pt-6">
              <h3 className="text-xl font-bold text-white">Visual Artifacts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.galleryImages.slice(1).map((img, i) => (
                  <div key={i} className="aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deliverables Sidebar */}
        <div className="lg:col-span-4">
          <LiquidGlass variant="elevated" className="p-6 sticky top-28 space-y-6">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
              Project Deliverables
            </h4>
            <ul className="space-y-3">
              {project.deliverables.map((deliv, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-200">
                  <Check className="w-4 h-4 text-[#FF6E17] shrink-0 mt-0.5" />
                  <span>{deliv}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-white/10 space-y-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative overflow-hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6E17] to-[#F4511E] text-white text-xs font-bold shadow-md border border-white/20 hover:border-white/40 transition-all duration-500 cursor-pointer select-none"
                >
                  <span className="pointer-events-none absolute -inset-x-full inset-y-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                  <span className="relative z-10 flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Visit Live Website</span>
                  </span>
                </a>
              )}
              <span className="text-xs text-neutral-400 block">
                Inspired by this case study? Let's engineer something extraordinary for your brand.
              </span>
              <GlassButton
                size="md"
                withArrow
                className="w-full"
                onClick={() => {
                  const event = new CustomEvent('boostify_populate_inquiry', {
                    detail: {
                      services: [project.category],
                      summary: `Inquiry inspired by case study: ${project.title}`,
                    },
                  });
                  window.dispatchEvent(event);
                  onNavigate('/contact');
                }}
              >
                Inquire Similar Project
              </GlassButton>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
};
