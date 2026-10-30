import React, { useState, useRef, useCallback } from 'react';
import { Project } from '../../types';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { Magnetic } from './Magnetic';
import { OptimizedImage } from './OptimizedImage';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  featured?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, featured = false }) => {
  const isSocialMedia = project.category === 'Social Media';
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Parallax Tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalized coordinates from -0.5 to 0.5
    const normalizedX = (e.clientX - rect.left) / width - 0.5;
    const normalizedY = (e.clientY - rect.top) / height - 0.5;

    // Smooth tilt angles (subtle & refined: max 7 degrees)
    const maxTilt = 7;
    setTilt({
      x: -normalizedY * maxTilt,
      y: normalizedX * maxTilt,
    });

    // Dynamic light specular reflection coordinates (in percentage)
    setGlarePos({
      x: ((e.clientX - rect.left) / width) * 100,
      y: ((e.clientY - rect.top) / height) * 100,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  // 1. Social Media Poster Card with 3D Parallax
  if (isSocialMedia) {
    return (
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '1000px' }}
        className="group relative aspect-square w-full cursor-pointer select-none"
        title={project.title}
      >
        <div
          style={{
            transform: isHovered
              ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)`
              : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
            transformStyle: 'preserve-3d',
            transition: isHovered
              ? 'transform 0.1s ease-out'
              : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 bg-neutral-950 shadow-lg hover:shadow-2xl hover:shadow-black/70 will-change-transform"
        >
          {/* Full-bleed Social Media Poster image with smooth zoom & WebP optimization */}
          <OptimizedImage
            src={project.coverImage}
            alt={project.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106 will-change-transform"
          />

          {/* 3D Specular Light Glare Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            style={{
              background: `radial-gradient(circle 300px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.08), transparent 80%)`,
            }}
          />

          {/* Minimalist click affordance: smoothly appears on hover */}
          <div
            style={{ transform: 'translateZ(25px)' }}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out translate-y-2 group-hover:translate-y-0 z-10 pointer-events-none"
          >
            <div className="w-9 h-9 rounded-full bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg group-hover:bg-[#FF6E17] group-hover:border-[#FF6E17] transition-all duration-300">
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          {/* Floating title pill on hover only */}
          <div
            style={{ transform: 'translateZ(30px)' }}
            className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out translate-y-3 group-hover:translate-y-0 z-10 pointer-events-none"
          >
            <div className="px-3.5 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-white flex items-center justify-between shadow-xl">
              <span className="text-xs font-bold truncate pr-2">{project.title}</span>
              <span className="text-[10px] font-mono text-[#FF6E17] uppercase tracking-wider shrink-0 font-bold">
                {project.year}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Standard Case Study Card (Web Design, Branding, Motion, etc.) with 3D Parallax & Smooth Reveal
  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1100px' }}
      className={`group relative cursor-pointer ${featured ? 'md:col-span-2' : ''}`}
    >
      <div
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.12s ease-out'
            : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 bg-neutral-950 shadow-lg hover:shadow-2xl hover:shadow-black/80 will-change-transform"
      >
        {/* Background Image with smooth Zoom and parallax depth */}
        <div className="relative aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden bg-neutral-900">
          <OptimizedImage
            src={project.coverImage}
            alt={project.title}
            sizes={featured ? '(max-width: 768px) 100vw, 80vw' : '(max-width: 768px) 100vw, 50vw'}
            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-106 filter brightness-[0.92] group-hover:brightness-105 will-change-transform"
          />

          {/* Ambient Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-90 transition-opacity duration-600 ease-out group-hover:opacity-75 pointer-events-none" />

          {/* 3D Specular Light Glare Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out"
            style={{
              background: `radial-gradient(circle 380px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.07), transparent 75%)`,
            }}
          />

          {/* Top Badges (Category & Year) in 3D Layer */}
          <div
            style={{ transform: 'translateZ(25px)' }}
            className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 z-10 pointer-events-none"
          >
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md border border-white/15 text-white shadow-sm transition-colors duration-300 group-hover:border-white/30">
              {project.category}
            </span>

            <div className="flex items-center gap-2 pointer-events-auto">
              {project.isDemo && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wide bg-[#FF6E17]/20 border border-[#FF6E17]/40 text-[#FF6E17] backdrop-blur-md">
                  Demonstration Study
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-xs font-mono text-neutral-400 bg-black/70 backdrop-blur-md border border-white/10">
                {project.year}
              </span>
            </div>
          </div>

          {/* Resting Preview Pill (visible before hover, smoothly glides away on hover) */}
          <div
            style={{ transform: 'translateZ(20px)' }}
            className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-0 group-hover:translate-y-3 group-hover:scale-95 z-10 max-sm:hidden"
          >
            <div className="px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white flex items-center gap-2.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#FF6E17] animate-pulse" />
              <span className="text-xs font-bold tracking-tight truncate max-w-[220px] sm:max-w-xs">{project.title}</span>
              <span className="text-[10px] font-mono text-neutral-400 border-l border-white/20 pl-2 uppercase font-medium">{project.category}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-black/75 border border-white/15 backdrop-blur-md flex items-center justify-center text-white/80 shadow-lg">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#FF6E17]" />
            </div>
          </div>

          {/* Bottom Details (Liquid Glass Panel: Luxuriously smooth, eye-pleasing slide & fade reveal) */}
          <div
            style={{ transform: 'translateZ(35px)' }}
            className="absolute bottom-4 inset-x-4 p-5 sm:p-6 rounded-2xl glass-standard border border-white/15 backdrop-blur-2xl transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 translate-y-5 scale-[0.98] pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto group-hover:border-white/30 group-hover:shadow-2xl max-sm:opacity-100 max-sm:translate-y-0 max-sm:scale-100 max-sm:pointer-events-auto z-20 overflow-hidden"
          >
            {/* Luminous reflection highlight at top edge */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight mb-1.5 transition-colors duration-300 group-hover:text-[#FF6E17]">
                  {project.title}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                  {project.summary}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white transition-all duration-500 ease-out group-hover:bg-[#FF6E17] group-hover:border-[#FF6E17] shadow-sm">
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            {/* Metrics preview if available */}
            {project.metrics && project.metrics.length > 0 && (
              <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-white/10 text-xs">
                {project.metrics.slice(0, 2).map((m, idx) => (
                  <div key={idx} className="flex items-baseline gap-2">
                    <span className="font-extrabold text-white text-sm tracking-tight font-mono group-hover:text-[#FF6E17] transition-colors duration-300">{m.value}</span>
                    <span className="text-[11px] text-neutral-400 font-medium">{m.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Direct Live Website action button (Smooth wavy orange transition, static dimensions) */}
            {project.liveUrl && (
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <Magnetic strength={0.25}>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="group/btn relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold border border-white/20 hover:border-white/40 shadow-md transition-all duration-500 cursor-pointer z-20 select-none"
                    title="Visit Live Website"
                  >
                    {/* Smooth wavy liquid orange background */}
                    <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl">
                      <span className="absolute inset-0 bg-gradient-to-r from-[#FF6E17] via-[#ff853a] to-[#F4511E] transition-opacity duration-500 ease-out" />
                      <span className="absolute -inset-x-full inset-y-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                    </span>
                    <span className="relative z-10 flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visit Live Website</span>
                    </span>
                  </a>
                </Magnetic>

                <span className="text-[11px] text-neutral-400 group-hover:text-white transition-colors duration-300 flex items-center gap-1 font-medium">
                  <span>View Case Study</span>
                  <ArrowUpRight className="w-3 h-3 text-[#FF6E17] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
