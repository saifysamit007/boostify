import React from 'react';

interface ProjectCardSkeletonProps {
  isSocialMedia?: boolean;
  count?: number;
}

export const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({ isSocialMedia = false }) => {
  if (isSocialMedia) {
    return (
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0e] shadow-lg">
        {/* Shimmer sweep */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer" />

        {/* Minimalist pill skeleton at bottom */}
        <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
          <div className="h-3.5 w-32 rounded bg-white/[0.08] animate-pulse" />
          <div className="h-3 w-10 rounded bg-white/[0.05] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] md:aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0e] shadow-lg">
      {/* Shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer" />

      {/* Top Badges Skeleton */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between">
        <div className="h-6 w-24 rounded-full bg-white/[0.08] animate-pulse" />
        <div className="h-6 w-14 rounded-full bg-white/[0.06] animate-pulse" />
      </div>

      {/* Resting Preview Pill Skeleton at Bottom */}
      <div className="absolute bottom-4 inset-x-4 flex items-center justify-between">
        <div className="h-10 w-56 rounded-xl bg-black/70 border border-white/10 p-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6E17]/40 animate-pulse" />
          <div className="h-3.5 w-28 rounded bg-white/[0.08] animate-pulse" />
        </div>
        <div className="w-10 h-10 rounded-full bg-black/70 border border-white/10 flex items-center justify-center">
          <div className="w-4 h-4 rounded bg-white/[0.08]" />
        </div>
      </div>
    </div>
  );
};

export const BlogPostSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl overflow-hidden glass-standard border border-white/10 bg-[#0c0c0e] flex flex-col justify-between shadow-lg">
      {/* Cover image skeleton */}
      <div className="aspect-[16/10] bg-white/[0.04] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer" />
        <div className="absolute top-3 left-3 h-5 w-20 rounded-full bg-white/[0.08] animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Date & read time */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 rounded bg-white/[0.06] animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="h-3 w-16 rounded bg-white/[0.05] animate-pulse" />
        </div>

        {/* Title lines */}
        <div className="space-y-2">
          <div className="h-5 w-5/6 rounded-lg bg-white/[0.09] animate-pulse" />
          <div className="h-5 w-3/5 rounded-lg bg-white/[0.07] animate-pulse" />
        </div>

        {/* Excerpt lines */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3.5 w-full rounded bg-white/[0.04] animate-pulse" />
          <div className="h-3.5 w-4/5 rounded bg-white/[0.04] animate-pulse" />
        </div>

        {/* Footer author */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/[0.08] animate-pulse" />
            <div className="h-3 w-24 rounded bg-white/[0.05] animate-pulse" />
          </div>
          <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-pulse" />
        </div>
      </div>
    </div>
  );
};
