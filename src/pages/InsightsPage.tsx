import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BlogPost } from '../types';
import { BlogPostSkeleton } from '../components/ui/SkeletonCard';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { GlassButton } from '../components/ui/GlassButton';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import { ArrowLeft, ArrowUpRight, Clock, Calendar, User, Tag, Share2 } from 'lucide-react';

interface InsightsPageProps {
  posts: BlogPost[];
  isLoading?: boolean;
  onNavigate: (route: string) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ posts, isLoading = false, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))];

  const published = posts.filter(p => p.status === 'published');
  const filtered = published.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mb-12 space-y-4"
      >
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
          Editorial & Strategic Thinking
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase font-display leading-[0.95]">
          Agency Insights & Dispatches
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-heading">
          Essays on modern digital product engineering, liquid glass aesthetics, high-velocity motion design, and performance marketing strategies from our studio in Gulshan 1, Dhaka.
        </p>
      </motion.div>

      {/* Category filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-2 mb-12 p-1.5 rounded-2xl glass-subtle border border-white/10 w-fit"
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#FF6E17] text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Blog Posts Grid with Dark Mode Skeletons or Staggered Reveal */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <BlogPostSkeleton key={n} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filtered.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.65,
                delay: Math.min(idx * 0.08, 0.35),
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => onNavigate(`/insights/${post.slug}`)}
              className="group rounded-2xl overflow-hidden glass-standard border border-white/10 cursor-pointer transition-all duration-300 hover:border-white/25 hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between"
            >
            <div>
              <div className="aspect-[16/10] overflow-hidden bg-neutral-900 relative">
                <OptimizedImage
                  src={post.coverImage}
                  alt={post.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                  {post.category}
                </div>
                {post.isDemo && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#FF6E17]/20 border border-[#FF6E17]/40 text-[#FF6E17] backdrop-blur-md">
                    Demo Essay
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6E17]" />
                    {post.publishedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight mb-3 group-hover:text-[#FF6E17] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center justify-between border-t border-white/10 text-xs">
              <span className="text-neutral-400 font-medium">By {post.author.name}</span>
              <span className="text-[#FF6E17] font-bold flex items-center gap-1 group-hover:underline">
                Read Article <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
};

interface ArticleDetailProps {
  slug: string;
  posts: BlogPost[];
  onNavigate: (route: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailProps> = ({ slug, posts, onNavigate }) => {
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="pt-32 pb-24 px-4 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Article not found</h2>
        <p className="text-xs text-neutral-400 mb-6">The requested insight article could not be located.</p>
        <GlassButton onClick={() => onNavigate('/insights')}>Return to Insights</GlassButton>
      </div>
    );
  }

  const related = posts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 2);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button
        onClick={() => onNavigate('/insights')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Insights</span>
      </button>

      {/* Article Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-[#FF6E17]/20 border border-[#FF6E17]/40 text-[#FF6E17]">
            {post.category}
          </span>
          <span className="text-xs font-mono text-neutral-400">{post.readTime}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display leading-[1.05]">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 pt-2 text-xs text-neutral-400 font-mono border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="text-white font-bold block">{post.author.name}</span>
              <span className="text-[11px] text-neutral-400">{post.author.role}</span>
            </div>
          </div>
          <span className="ml-auto">Published: {post.publishedDate}</span>
        </div>
      </div>

      {/* Featured Cover Media */}
      <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 mb-12 shadow-2xl bg-neutral-900">
        <OptimizedImage
          src={post.coverImage}
          alt={post.title}
          sizes="(max-width: 1024px) 100vw, 896px"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content */}
      <div className="prose prose-invert max-w-none text-neutral-200 text-sm sm:text-base leading-relaxed space-y-6 mb-16">
        {post.content.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-2xl font-bold text-white pt-4 tracking-tight">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
            return (
              <div key={idx} className="pl-4 border-l-2 border-[#FF6E17] text-neutral-300 text-sm space-y-1">
                {paragraph}
              </div>
            );
          }
          return <p key={idx}>{paragraph}</p>;
        })}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-6 pb-12 border-t border-white/10">
          <Tag className="w-4 h-4 text-[#FF6E17]" />
          {post.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-neutral-300">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Related Dispatches</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map(r => (
              <LiquidGlass
                key={r.id}
                variant="subtle"
                interactive
                onClick={() => onNavigate(`/insights/${r.slug}`)}
                className="p-6 cursor-pointer"
              >
                <span className="text-[10px] font-mono text-[#FF6E17] uppercase block mb-1">{r.category}</span>
                <h4 className="text-base font-bold text-white line-clamp-2 mb-2">{r.title}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2">{r.excerpt}</p>
              </LiquidGlass>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
