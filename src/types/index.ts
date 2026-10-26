export interface SiteSettings {
  brandName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl?: string;
  availability: {
    isAvailable: boolean;
    statusText: string;
  };
  contact: {
    email: string;
    whatsapp: string;
    whatsappUrl: string;
    headquarters: string;
  };
  socials: {
    instagram: string;
    facebook: string;
  };
  hero: {
    headline: string;
    supportingHeadline: string;
    supportingCopy: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    videoUrl?: string;
    videoBlur?: number;
    videoOpacity?: number;
    videoEnabled?: boolean;
  };
  announcement: {
    enabled: boolean;
    text: string;
    url?: string;
    linkText?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImageUrl?: string;
    canonicalUrl?: string;
  };
  projectCategoryVisibility?: Record<string, boolean>;
  updatedAt?: number;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: 'Development' | 'Design' | 'Motion' | 'Marketing';
  deliverables: string[];
  startingPrice?: string;
  iconName: string;
  featured: boolean;
  sortOrder: number;
  visibility: boolean;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: 'Web Design' | 'Branding' | 'Social Media' | 'Motion' | 'Video' | 'Marketing';
  year: string;
  summary: string;
  clientChallenge: string;
  creativeStrategy: string;
  deliverables: string[];
  outcome: string;
  metrics?: ProjectMetric[];
  coverImage: string;
  galleryImages?: string[];
  videoUrl?: string;
  liveUrl?: string;
  featured: boolean;
  published: boolean;
  isDemo: boolean;
}

export interface PricingPackage {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  billingModel: string;
  tagline: string;
  deliverables: string[];
  revisions: string;
  estimatedDelivery: string;
  featured: boolean;
  sortOrder: number;
  visibility: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  coverImage: string;
  category: string;
  tags: string[];
  readTime: string;
  publishedDate: string;
  status: 'draft' | 'published';
  isDemo: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export type CollaboratorPlatform = 
  | 'fiverr' 
  | 'whatsapp' 
  | 'instagram' 
  | 'facebook' 
  | 'discord' 
  | 'upwork' 
  | 'direct' 
  | 'other';

export interface Testimonial {
  id: string;
  clientName: string;
  position: string;
  company: string;
  quote: string;
  avatarUrl?: string;
  status: 'approved' | 'pending';
  sortOrder: number;
  sourcePlatform?: CollaboratorPlatform;
  isTrustedClient?: boolean;
  rating?: number;
  projectTitle?: string;
  date?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'Services' | 'Pricing' | 'Process' | 'General';
  sortOrder: number;
  visibility: boolean;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  services: string[];
  brief: string;
  referenceUrls?: string;
  budgetRange: string;
  timeline: string;
  contactPreference: 'whatsapp' | 'email' | 'phone';
  phone?: string;
  consentData: boolean;
  newsletterOptIn: boolean;
  createdAt: string;
  status: 'new' | 'in_progress' | 'contacted' | 'qualified' | 'won' | 'lost';
  adminNotes?: string;
  assignedAdmin?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  source: string;
  status: 'active' | 'unsubscribed';
  consent: boolean;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'superadmin' | 'editor';
  active: boolean;
  createdAt: string;
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  decided: boolean;
}

export interface EstimatorState {
  selectedServices: string[];
  complexity: 'Startup' | 'Growth' | 'Enterprise';
  deliverableCount: number;
  selectedAddOns: string[];
  timelineSpeed: 'Standard' | 'Expedited' | 'Priority Rush';
}
