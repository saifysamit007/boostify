import React, { useState, useEffect } from 'react';
import { 
  SiteSettings, 
  Service, 
  Project, 
  PricingPackage, 
  BlogPost, 
  Inquiry, 
  Subscriber,
  Testimonial,
  CollaboratorPlatform
} from '../types';
import { 
  fetchInquiries, 
  updateInquiryStatus, 
  saveSiteSettings, 
  saveService, 
  deleteService, 
  saveProject, 
  deleteProject, 
  savePackage,
  deletePackage,
  saveBlogPost, 
  deleteBlogPost, 
  saveTestimonial,
  deleteTestimonial,
  fetchSubscribers,
  isFirebaseConfigured,
  syncAllToFirestore,
  generateProjectDescription
} from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { GlassButton } from '../components/ui/GlassButton';
import { PlatformBadge, TrustedCustomerBadge } from '../components/ui/CollaboratorBadge';
import { 
  LayoutDashboard, 
  Inbox, 
  Briefcase, 
  Layers, 
  FileText, 
  Settings, 
  Database, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Download, 
  Search, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Globe,
  Video,
  Sliders,
  Play,
  Eye,
  EyeOff,
  MessageSquare,
  Star,
  Quote,
  Package,
  Share2,
  Smartphone,
  Monitor
} from 'lucide-react';

interface AdminDashboardProps {
  settings: SiteSettings;
  services: Service[];
  projects: Project[];
  packages: PricingPackage[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  onRefreshData: () => Promise<void>;
  onNavigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  services,
  projects,
  packages,
  blogPosts,
  testimonials = [],
  onRefreshData,
  onNavigate,
}) => {
  const { logout, session, role } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'inquiries' | 'projects' | 'services' | 'packages' | 'collaborators' | 'blog' | 'seo' | 'settings' | 'firebase'
  >('overview');

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchInquiry, setSearchInquiry] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');

  // Editable settings state
  const [editSettings, setEditSettings] = useState<SiteSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState<string>('');
  const [serpPreviewMode, setSerpPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    setEditSettings(settings);
  }, [settings]);

  // New Project modal / state
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [showProjectAdvanced, setShowProjectAdvanced] = useState(false);
  const [aiSummarySuccess, setAiSummarySuccess] = useState(false);
  // New Service state
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  // New Package state
  const [editingPackage, setEditingPackage] = useState<Partial<PricingPackage> | null>(null);
  const [packageDeliverableInput, setPackageDeliverableInput] = useState<string>('');
  // New Blog Post state
  const [editingBlogPost, setEditingBlogPost] = useState<Partial<BlogPost> | null>(null);
  // New Collaborator / Testimonial state
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

  // In-App Deletion Dialog States (Bypasses iframe sandbox alert/confirm blocking)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [projectDeleteSuccess, setProjectDeleteSuccess] = useState<string | null>(null);

  const [packageToDelete, setPackageToDelete] = useState<PricingPackage | null>(null);
  const [isDeletingPackage, setIsDeletingPackage] = useState(false);

  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);
  const [isDeletingTestimonial, setIsDeletingTestimonial] = useState(false);

  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);
  const [isDeletingBlog, setIsDeletingBlog] = useState(false);

  // Firestore sync state
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadInquiriesAndSubscribers();
  }, []);

  const handleSyncFirestore = async () => {
    setIsSyncingFirestore(true);
    setFirestoreSyncStatus(null);
    try {
      const res = await syncAllToFirestore();
      setFirestoreSyncStatus(res);
      if (res.success) {
        await onRefreshData();
      }
    } catch (err: any) {
      setFirestoreSyncStatus({
        success: false,
        message: err.message || 'Synchronization encountered an error.'
      });
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  const loadInquiriesAndSubscribers = async () => {
    const inqs = await fetchInquiries();
    const subs = await fetchSubscribers();
    setInquiries(inqs);
    setSubscribers(subs);
  };

  const handleUpdateStatus = async (inqId: string, newStatus: Inquiry['status']) => {
    await updateInquiryStatus(inqId, newStatus);
    await loadInquiriesAndSubscribers();
    if (selectedInquiry && selectedInquiry.id === inqId) {
      setSelectedInquiry(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleSaveAdminNote = async () => {
    if (!selectedInquiry) return;
    await updateInquiryStatus(selectedInquiry.id, selectedInquiry.status, adminNoteText);
    await loadInquiriesAndSubscribers();
    setSelectedInquiry(prev => (prev ? { ...prev, adminNotes: adminNoteText } : null));
  };

  useEffect(() => {
    setEditSettings(settings);
  }, [settings]);

  const handleFaviconFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose an image file under 2MB for the favicon.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditSettings(prev => ({ ...prev, faviconUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHeroVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('Video file exceeds 25MB. For optimal website loading speeds, we recommend a compressed video under 10MB or hosting it on a CDN.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditSettings(prev => ({
          ...prev,
          hero: {
            ...prev.hero,
            videoUrl: dataUrl,
            videoEnabled: true,
          }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOgImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file exceeds 5MB. Please upload an image under 5MB for fast social share previews.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditSettings(prev => ({
          ...prev,
          seo: {
            ...prev.seo,
            ogImageUrl: dataUrl,
          }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const curatedVideoPresets = [
    {
      name: 'Oceans Flow (Deep Ambient Wave)',
      url: 'https://vjs.zencdn.net/v/oceans.mp4',
      badge: 'Fluid & Dark',
    },
    {
      name: 'Modern High-Energy Media Sample',
      url: 'https://cdn.jsdelivr.net/npm/video-media-samples@1.0.0/big-buck-bunny-480p-30sec.mp4',
      badge: 'High FPS',
    },
    {
      name: 'Abstract Organic Bloom',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      badge: 'Creative',
    },
  ];

  const blurPresets = [
    { label: '0px (Sharp)', value: 0 },
    { label: '4px (Subtle)', value: 4 },
    { label: '10px (Standard)', value: 10 },
    { label: '18px (Heavy)', value: 18 },
    { label: '28px (Dreamy)', value: 28 },
  ];

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      const settingsToSave: SiteSettings = {
        ...editSettings,
        updatedAt: Date.now(),
      };
      await saveSiteSettings(settingsToSave);
      setSettingsSaved(true);
      await onRefreshData();
    } finally {
      setIsSavingSettings(false);
      setTimeout(() => setSettingsSaved(false), 3000);
    }
  };

  const CASE_STUDY_CATEGORIES = [
    { 
      name: 'Web Design', 
      tag: 'UI/UX & Web Systems',
      icon: Globe,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    { 
      name: 'Branding', 
      tag: 'Identities & Visual Systems',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    { 
      name: 'Social Media', 
      tag: 'Campaigns, Carousels & Reels',
      icon: Share2,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30'
    },
    { 
      name: 'Motion', 
      tag: '3D Loops & Kinetic Typography',
      icon: Play,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    { 
      name: 'Video', 
      tag: 'Commercial Edits & Video Production',
      icon: Video,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    { 
      name: 'Marketing', 
      tag: 'Performance Ads & Funnels',
      icon: Flame,
      color: 'text-[#FF6E17] bg-[#FF6E17]/10 border-[#FF6E17]/30'
    },
  ];

  const handleToggleCategoryVisibility = async (categoryName: string) => {
    const currentMap = editSettings.projectCategoryVisibility || {
      'Web Design': true,
      'Branding': true,
      'Social Media': true,
      'Motion': true,
      'Video': true,
      'Marketing': true,
    };
    const currentVal = currentMap[categoryName] ?? true;
    const updatedMap = {
      ...currentMap,
      [categoryName]: !currentVal,
    };
    const updatedSettings: SiteSettings = {
      ...editSettings,
      projectCategoryVisibility: updatedMap,
      updatedAt: Date.now(),
    };
    setEditSettings(updatedSettings);
    await saveSiteSettings(updatedSettings);
    await onRefreshData();
  };

  const handleSetAllCategoriesVisibility = async (visible: boolean) => {
    const updatedMap = {
      'Web Design': visible,
      'Branding': visible,
      'Social Media': visible,
      'Motion': visible,
      'Video': visible,
      'Marketing': visible,
    };
    const updatedSettings: SiteSettings = {
      ...editSettings,
      projectCategoryVisibility: updatedMap,
      updatedAt: Date.now(),
    };
    setEditSettings(updatedSettings);
    await saveSiteSettings(updatedSettings);
    await onRefreshData();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Name', 'Email', 'Company', 'Services', 'Budget', 'Timeline', 'Channel', 'Phone', 'Status', 'Notes'];
    const rows = inquiries.map(inq => [
      inq.id,
      inq.createdAt,
      `"${inq.name.replace(/"/g, '""')}"`,
      `"${inq.email}"`,
      `"${(inq.company || '').replace(/"/g, '""')}"`,
      `"${inq.services.join('; ')}"`,
      `"${inq.budgetRange}"`,
      `"${inq.timeline}"`,
      inq.contactPreference,
      `"${inq.phone || ''}"`,
      inq.status,
      `"${(inq.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `boostify_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (inquiryFilter !== 'all' && inq.status !== inquiryFilter) return false;
    if (!searchInquiry.trim()) return true;
    const q = searchInquiry.toLowerCase();
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.company && inq.company.toLowerCase().includes(q)) ||
      inq.services.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF6E17] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Boostify Internal Control Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agency Management Suite
          </h1>
          <p className="text-xs text-neutral-400">
            Authenticated as <strong className="text-white">{session?.email || 'Administrator'}</strong> • Role: <strong className="text-[#FF6E17] uppercase">{role || 'superadmin'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('/')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white glass-subtle border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-2xl glass-subtle border border-white/10">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: Inbox },
          { id: 'projects', label: `Projects (${projects.length})`, icon: Briefcase },
          { id: 'services', label: `Services (${services.length})`, icon: Layers },
          { id: 'packages', label: `Packages (${packages.length})`, icon: Package },
          { id: 'collaborators', label: `Collaborators (${testimonials.length})`, icon: MessageSquare },
          { id: 'blog', label: `Articles (${blogPosts.length})`, icon: FileText },
          { id: 'seo', label: 'SEO Settings', icon: Search },
          { id: 'settings', label: 'Site Settings', icon: Settings },
          { id: 'firebase', label: 'Firebase Architecture', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-[#FF6E17] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: OVERVIEW
      ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <LiquidGlass variant="standard" className="p-6">
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-1">Total Inquiries</span>
              <span className="text-3xl font-black text-white font-mono">{inquiries.length}</span>
              <span className="text-[11px] text-emerald-400 block mt-1">
                {inquiries.filter(i => i.status === 'new').length} newly submitted
              </span>
            </LiquidGlass>

            <LiquidGlass variant="standard" className="p-6">
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-1">Active Projects</span>
              <span className="text-3xl font-black text-white font-mono">{projects.length}</span>
              <span className="text-[11px] text-neutral-400 block mt-1">
                {projects.filter(p => p.published).length} published live
              </span>
            </LiquidGlass>

            <LiquidGlass variant="standard" className="p-6">
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-1">Services Offered</span>
              <span className="text-3xl font-black text-white font-mono">{services.length}</span>
              <span className="text-[11px] text-neutral-400 block mt-1">Full-stack disciplines</span>
            </LiquidGlass>

            <LiquidGlass variant="standard" className="p-6">
              <span className="text-xs font-mono uppercase text-neutral-400 block mb-1">Subscribers</span>
              <span className="text-3xl font-black text-white font-mono">{subscribers.length}</span>
              <span className="text-[11px] text-neutral-400 block mt-1">Newsletter list</span>
            </LiquidGlass>
          </div>

          {/* Firebase Connection Status Banner */}
          <LiquidGlass variant={isFirebaseConfigured ? 'elevated' : 'standard'} className="p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${isFirebaseConfigured ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'}`}>
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {isFirebaseConfigured ? 'Cloud Firestore Connected' : 'Local Storage Mode (Firebase Keys Pending)'}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {isFirebaseConfigured
                      ? 'Live real-time Firestore database synchronizing inquiries and content.'
                      : 'All submissions and content edits are currently persisting locally. Connect your Firebase Project in .env or settings.'}
                  </p>
                </div>
              </div>

              <GlassButton
                size="sm"
                variant="secondary"
                onClick={() => setActiveTab('firebase')}
              >
                View Setup Guide
              </GlassButton>
            </div>
          </LiquidGlass>

          {/* Recent Inquiries List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Recent Project Submissions</h3>
              <button
                onClick={() => setActiveTab('inquiries')}
                className="text-xs text-[#FF6E17] font-semibold hover:underline"
              >
                View all ({inquiries.length}) →
              </button>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-8 rounded-2xl glass-subtle text-center text-xs text-neutral-400">
                No inquiries submitted yet. Testing forms on the public site will appear here immediately.
              </div>
            ) : (
              <div className="space-y-2.5">
                {inquiries.slice(0, 5).map(inq => (
                  <div
                    key={inq.id}
                    onClick={() => {
                      setSelectedInquiry(inq);
                      setAdminNoteText(inq.adminNotes || '');
                      setActiveTab('inquiries');
                    }}
                    className="p-4 rounded-xl glass-subtle border border-white/10 hover:border-[#FF6E17]/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{inq.name}</span>
                        {inq.company && <span className="text-neutral-400 font-medium">({inq.company})</span>}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          inq.status === 'new' ? 'bg-[#FF6E17]/20 text-[#FF6E17]' :
                          inq.status === 'won' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-white/10 text-neutral-300'
                        }`}>
                          {inq.status}
                        </span>
                      </div>
                      <span className="text-neutral-400 block line-clamp-1">{inq.brief}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-white font-mono font-bold block">{inq.budgetRange}</span>
                      <span className="text-neutral-500 text-[11px]">{new Date(inq.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: INQUIRIES MANAGEMENT
      ======================================================== */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                <input
                  type="text"
                  value={searchInquiry}
                  onChange={e => setSearchInquiry(e.target.value)}
                  placeholder="Search by client, email, brief..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17]"
                />
              </div>

              <select
                value={inquiryFilter}
                onChange={e => setInquiryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF6E17]"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won / Contracted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <GlassButton size="sm" variant="secondary" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export to CSV
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List column */}
            <div className="lg:col-span-6 space-y-2.5">
              {filteredInquiries.length === 0 ? (
                <div className="p-8 rounded-2xl glass-subtle text-center text-xs text-neutral-400">
                  No inquiries match the current filter.
                </div>
              ) : (
                filteredInquiries.map(inq => (
                  <div
                    key={inq.id}
                    onClick={() => {
                      setSelectedInquiry(inq);
                      setAdminNoteText(inq.adminNotes || '');
                    }}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedInquiry?.id === inq.id
                        ? 'border-[#FF6E17] bg-[#FF6E17]/10'
                        : 'border-white/10 glass-subtle hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm">{inq.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        inq.status === 'new' ? 'bg-[#FF6E17]/20 text-[#FF6E17]' :
                        inq.status === 'won' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-white/10 text-neutral-300'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    <div className="text-neutral-400 mb-2">
                      <span>{inq.email}</span>
                      {inq.phone && <span> • {inq.phone}</span>}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-2 border-t border-white/5">
                      <span>{inq.budgetRange}</span>
                      <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detail & Notes column */}
            <div className="lg:col-span-6">
              {selectedInquiry ? (
                <LiquidGlass variant="elevated" className="p-6 sticky top-28 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedInquiry.name}</h3>
                      <p className="text-xs text-neutral-400">
                        {selectedInquiry.company ? `${selectedInquiry.company} • ` : ''}
                        Ref: {selectedInquiry.id}
                      </p>
                    </div>

                    {/* Status updater dropdown */}
                    <select
                      value={selectedInquiry.status}
                      onChange={e => handleUpdateStatus(selectedInquiry.id, e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg bg-black/80 border border-[#FF6E17]/40 text-xs text-white font-bold uppercase font-mono"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="won">Won / Contracted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block font-mono">Contact Details</span>
                      <span className="text-white font-semibold">{selectedInquiry.email}</span>
                      {selectedInquiry.phone && <span className="text-white block">{selectedInquiry.phone}</span>}
                      <span className="text-[11px] text-[#FF6E17] block capitalize">Preferred via {selectedInquiry.contactPreference}</span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block font-mono">Requested Services</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedInquiry.services.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-white/10 text-white text-[11px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-neutral-400 block font-mono">Project Scope & Brief</span>
                      <p className="p-3 rounded-lg bg-black/40 border border-white/5 text-neutral-200 mt-1 whitespace-pre-wrap leading-relaxed">
                        {selectedInquiry.brief}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-neutral-400 block font-mono text-[10px]">Budget</span>
                        <span className="text-white font-bold">{selectedInquiry.budgetRange}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block font-mono text-[10px]">Timeline</span>
                        <span className="text-white font-bold">{selectedInquiry.timeline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Private Admin Notes */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                      Private Admin Notes (Internal Only)
                    </span>
                    <textarea
                      rows={3}
                      value={adminNoteText}
                      onChange={e => setAdminNoteText(e.target.value)}
                      placeholder="Add confidential discovery notes, client qualification status..."
                      className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17]"
                    />
                    <GlassButton size="sm" onClick={handleSaveAdminNote}>
                      Save Note
                    </GlassButton>
                  </div>
                </LiquidGlass>
              ) : (
                <div className="p-8 rounded-2xl glass-subtle text-center text-xs text-neutral-400">
                  Select an inquiry from the list to review details and update its processing status.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: PROJECTS MANAGEMENT
      ======================================================== */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {projectDeleteSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-fade-in shadow-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{projectDeleteSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setProjectDeleteSuccess(null)}
                className="text-emerald-400/70 hover:text-emerald-400 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Portfolio Projects ({projects.length})</h3>
            <GlassButton
              size="sm"
              onClick={() => {
                setEditingProject({
                  id: 'proj-' + Date.now(),
                  title: '',
                  slug: '',
                  category: 'Web Design',
                  year: new Date().getFullYear().toString(),
                  summary: '',
                  clientChallenge: '',
                  creativeStrategy: '',
                  deliverables: ['Custom Web Architecture'],
                  outcome: '',
                  coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
                  liveUrl: '',
                  featured: false,
                  published: true,
                  isDemo: false,
                });
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
            </GlassButton>
          </div>

          {/* ========================================================
              CASE STUDIES & CRAFT: CATEGORY FILTER VISIBILITY CONTROLLER
              Directly controls visibility of Web Design, Branding, Social Media, Motion, Video, Marketing
          ======================================================== */}
          <LiquidGlass variant="standard" className="p-5 space-y-4 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6E17]" />
                    <span>"Case Studies &amp; Craft" Category Filter Visibility</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF6E17]/15 text-[#FF6E17] border border-[#FF6E17]/30">
                    {CASE_STUDY_CATEGORIES.filter(c => (editSettings.projectCategoryVisibility?.[c.name] ?? true)).length} of 6 Live
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Turn on or off any category tab (Web Design, Branding, Social Media, Motion, Video, Marketing) displayed on the Homepage and Work archive.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSetAllCategoriesVisibility(true)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30 transition-colors cursor-pointer"
                >
                  Show All 6
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllCategoriesVisibility(false)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
                >
                  Hide All
                </button>
              </div>
            </div>

            {/* Grid of the 6 Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CASE_STUDY_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isVisible = (editSettings.projectCategoryVisibility?.[cat.name] ?? true);
                const categoryProjectsCount = projects.filter(p => p.category === cat.name).length;

                return (
                  <div
                    key={cat.name}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      isVisible
                        ? 'bg-white/5 border-white/15 shadow-sm'
                        : 'bg-black/40 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg border shrink-0 ${cat.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            {cat.tag}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                        isVisible
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                          : 'bg-neutral-800 text-neutral-400 border border-white/10'
                      }`}>
                        {isVisible ? '● Live' : '○ Hidden'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                      <span className="text-neutral-400 font-mono">
                        {categoryProjectsCount} {categoryProjectsCount === 1 ? 'project' : 'projects'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleCategoryVisibility(cat.name)}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isVisible
                            ? 'bg-white/5 hover:bg-red-500/15 text-neutral-300 hover:text-red-400 border border-white/10 hover:border-red-500/30'
                            : 'bg-[#FF6E17] hover:bg-[#e05d0e] text-white shadow-sm'
                        }`}
                      >
                        {isVisible ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Make Live</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </LiquidGlass>

          {editingProject && (
            <LiquidGlass variant="elevated" className="p-6 space-y-4 border border-[#FF6E17]/40 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {editingProject.id?.startsWith('proj-') && !projects.some(p => p.id === editingProject.id)
                      ? 'Create New Project'
                      : 'Edit Project'}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF6E17]/15 text-[#FF6E17] border border-[#FF6E17]/30">
                      AI-Assisted
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Fill the details below. If you leave description empty, AI will automatically analyze your fields to write a bespoke agency summary.
                  </p>
                </div>
                <button
                  onClick={() => setEditingProject(null)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={editingProject.title || ''}
                    onChange={e => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setEditingProject(prev => ({ ...prev, title, slug }));
                    }}
                    placeholder="e.g. Lumina FinTech"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={editingProject.slug || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white font-mono focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <select
                    value={editingProject.category || 'Web Design'}
                    onChange={e => setEditingProject(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  >
                    <option value="Web Design">Web Design</option>
                    <option value="Branding">Branding</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Motion">Motion</option>
                    <option value="Video">Video</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Year</label>
                  <input
                    type="text"
                    value={editingProject.year || new Date().getFullYear().toString()}
                    onChange={e => setEditingProject(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2026"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white font-mono focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={editingProject.coverImage || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 flex items-center justify-between">
                    <span>Live Project / Preview URL</span>
                    <span className="text-[10px] text-[#FF6E17] font-mono">For Web & Motion</span>
                  </label>
                  <input
                    type="url"
                    value={editingProject.liveUrl || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, liveUrl: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white font-mono focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>
              </div>

              {/* Expandable Case Study Details to give AI deep context */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowProjectAdvanced(prev => !prev)}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors font-mono py-1"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#FF6E17]" />
                  <span>{showProjectAdvanced ? 'Hide Case Study Details' : 'More Details (Deliverables, Challenge, Strategy) — Enhances AI Context'}</span>
                </button>

                {showProjectAdvanced && (
                  <div className="mt-3 p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-3 text-xs animate-in fade-in duration-200">
                    <div>
                      <label className="block text-neutral-400 mb-1">Deliverables (comma separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(editingProject.deliverables) ? editingProject.deliverables.join(', ') : (editingProject.deliverables || '')}
                        onChange={e => {
                          const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setEditingProject(prev => ({ ...prev, deliverables: items }));
                        }}
                        placeholder="e.g. Responsive Web Architecture, 3D Canvas, Identity Guidelines"
                        className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1">Client Challenge</label>
                        <textarea
                          rows={2}
                          value={editingProject.clientChallenge || ''}
                          onChange={e => setEditingProject(prev => ({ ...prev, clientChallenge: e.target.value }))}
                          placeholder="e.g. Modernizing legacy aesthetic to appeal to international enterprise clients."
                          className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-400 mb-1">Creative Strategy</label>
                        <textarea
                          rows={2}
                          value={editingProject.creativeStrategy || ''}
                          onChange={e => setEditingProject(prev => ({ ...prev, creativeStrategy: e.target.value }))}
                          placeholder="e.g. Dark minimalist visual language paired with fluid spring micro-interactions."
                          className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">Key Outcome & Results</label>
                      <input
                        type="text"
                        value={editingProject.outcome || ''}
                        onChange={e => setEditingProject(prev => ({ ...prev, outcome: e.target.value }))}
                        placeholder="e.g. 140% increase in inbound qualified inquiries within 60 days."
                        className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description / Summary with On-Demand AI Generator */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-neutral-300 text-xs font-semibold flex items-center gap-2">
                    <span>Description / Summary</span>
                    <span className="text-[10px] text-neutral-500 font-normal">
                      (Displayed on project cards)
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingProject.title?.trim()) {
                        alert('Please fill in the Project Title first so AI can analyze it.');
                        return;
                      }
                      setIsGeneratingAiSummary(true);
                      setAiSummarySuccess(false);
                      try {
                        const generated = await generateProjectDescription(editingProject);
                        setEditingProject(prev => prev ? { ...prev, summary: generated } : null);
                        setAiSummarySuccess(true);
                        setTimeout(() => setAiSummarySuccess(false), 4000);
                      } catch (err) {
                        console.error('Failed to generate summary:', err);
                      } finally {
                        setIsGeneratingAiSummary(false);
                      }
                    }}
                    disabled={isGeneratingAiSummary}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-medium bg-[#FF6E17]/15 hover:bg-[#FF6E17]/25 text-[#FF6E17] border border-[#FF6E17]/35 transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                    title="Analyze all filled project fields and generate an agency case-study description"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAiSummary ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAiSummary ? 'AI Analyzing...' : 'Generate with AI'}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={editingProject.summary || ''}
                    onChange={e => setEditingProject(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Leave empty and click 'Save Project' to auto-generate a beautiful description analyzed from your project fields, or write custom copy here..."
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-[#FF6E17] focus:outline-none transition-colors"
                  />
                  {isGeneratingAiSummary && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs rounded-lg flex items-center justify-center gap-2 text-xs text-[#FF6E17] font-mono">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Gemini AI is analyzing project data & crafting description...</span>
                    </div>
                  )}
                </div>

                {aiSummarySuccess && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AI generated a custom description based on your project fields!</span>
                  </div>
                )}
                {!editingProject.summary?.trim() && !isGeneratingAiSummary && (
                  <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1.5">
                    <span className="text-[#FF6E17] font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#FF6E17]/10 border border-[#FF6E17]/20">AUTO-AI</span>
                    <span>If you leave this blank, saving will automatically analyze your project and write a description for you.</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.featured ?? false}
                    onChange={e => setEditingProject(prev => ({ ...prev, featured: e.target.checked }))}
                    className="accent-[#FF6E17]"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.isDemo ?? false}
                    onChange={e => setEditingProject(prev => ({ ...prev, isDemo: e.target.checked }))}
                    className="accent-[#FF6E17]"
                  />
                  <span>Demonstration Project Tag</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="text-[11px] text-neutral-400 font-mono">
                  {isGeneratingAiSummary ? (
                    <span className="text-[#FF6E17] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-spin" /> Analyzing project fields...
                    </span>
                  ) : !editingProject.summary?.trim() ? (
                    <span className="text-neutral-400">Description will be auto-generated upon saving</span>
                  ) : (
                    <span className="text-neutral-500">Ready to save</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isGeneratingAiSummary}
                    onClick={() => setEditingProject(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <GlassButton
                    size="sm"
                    disabled={isGeneratingAiSummary}
                    onClick={async () => {
                      if (!editingProject.title || !editingProject.slug) {
                        alert('Project Title and Slug are required.');
                        return;
                      }

                      const finalProject = { ...(editingProject as Project) };

                      // Auto-generate if summary is missing
                      if (!finalProject.summary || !finalProject.summary.trim()) {
                        setIsGeneratingAiSummary(true);
                        try {
                          const autoSummary = await generateProjectDescription(finalProject);
                          finalProject.summary = autoSummary;
                        } catch (err) {
                          console.error('Error generating summary:', err);
                        } finally {
                          setIsGeneratingAiSummary(false);
                        }
                      }

                      await saveProject(finalProject);
                      await onRefreshData();
                      setEditingProject(null);
                    }}
                  >
                    {isGeneratingAiSummary ? (
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#FF6E17]" />
                        Generating & Saving...
                      </span>
                    ) : (
                      'Save Project'
                    )}
                  </GlassButton>
                </div>
              </div>
            </LiquidGlass>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(proj => (
              <div
                key={proj.id}
                className="p-4 rounded-xl glass-subtle border border-white/10 flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 bg-neutral-900">
                    <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[#FF6E17] text-[10px] uppercase font-bold">{proj.category}</span>
                    {proj.isDemo && <span className="text-[10px] text-neutral-500 font-mono">(Demo)</span>}
                  </div>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{proj.title}</h4>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
                  <button
                    onClick={() => setEditingProject(proj)}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(proj)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Project Deletion In-App Modal (Never blocked by iframe sandbox restrictions) */}
          {projectToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <LiquidGlass variant="elevated" className="max-w-md w-full p-6 space-y-4 border border-red-500/40 shadow-2xl shadow-red-950/60">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-white">Delete Portfolio Project?</h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Are you sure you want to permanently delete <strong className="text-white">"{projectToDelete.title}"</strong>?
                    </p>
                    <div className="mt-3 p-2.5 rounded-lg bg-black/50 border border-white/10 flex items-center gap-3">
                      <img
                        src={projectToDelete.coverImage}
                        alt={projectToDelete.title}
                        className="w-12 h-10 rounded object-cover shrink-0 bg-neutral-900 border border-white/10"
                      />
                      <div className="text-[11px] min-w-0">
                        <span className="font-mono text-[#FF6E17] uppercase block text-[9px] font-bold">
                          {projectToDelete.category}
                        </span>
                        <span className="text-white font-medium truncate block">
                          {projectToDelete.title}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-2.5">
                      This will instantly remove it from the public portfolio, case studies, and server storage.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isDeletingProject}
                    onClick={() => setProjectToDelete(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingProject}
                    onClick={async () => {
                      try {
                        setIsDeletingProject(true);
                        const deletedTitle = projectToDelete.title;
                        const idToDelete = projectToDelete.id;
                        await deleteProject(idToDelete);
                        await onRefreshData();
                        setProjectToDelete(null);
                        setProjectDeleteSuccess(`Successfully deleted project "${deletedTitle}"`);
                        setTimeout(() => setProjectDeleteSuccess(null), 4000);
                      } catch (err) {
                        console.error('Failed to delete project:', err);
                      } finally {
                        setIsDeletingProject(false);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-red-900/30 active:scale-95 disabled:opacity-50"
                  >
                    {isDeletingProject ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              </LiquidGlass>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 4: SERVICES MANAGEMENT
      ======================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Services & Disciplines ({services.length})</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(srv => (
              <div key={srv.id} className="p-5 rounded-xl glass-subtle border border-white/10 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{srv.title}</span>
                  <span className="font-mono text-[#FF6E17]">{srv.startingPrice}</span>
                </div>
                <p className="text-neutral-400">{srv.shortDescription}</p>

                <div className="space-y-1 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono uppercase text-neutral-500">Deliverables</span>
                  {srv.deliverables.slice(0, 3).map((d, i) => (
                    <div key={i} className="text-neutral-300">• {d}</div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${srv.visibility ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {srv.visibility ? 'Published' : 'Hidden'}
                  </span>
                  <button
                    onClick={async () => {
                      const updated = { ...srv, visibility: !srv.visibility };
                      await saveService(updated);
                      await onRefreshData();
                    }}
                    className="text-xs text-[#FF6E17] font-semibold hover:underline"
                  >
                    Toggle Visibility
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: FLEXIBLE SERVICE PACKAGES MANAGEMENT
      ======================================================== */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Flexible Service Packages & Pricing</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FF6E17]/15 text-[#FF6E17] border border-[#FF6E17]/30">
                  {packages.length} Packages
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Customize sprint pricing packages, inclusions/deliverables, revisions, and turnaround times displayed in the "Flexible Service Packages" section on the homepage.
              </p>
            </div>
            <GlassButton
              size="sm"
              onClick={() => {
                setEditingPackage({
                  id: 'pkg-' + Date.now(),
                  title: '',
                  slug: '',
                  price: '$1,200',
                  currency: 'USD',
                  billingModel: 'per project / custom scope',
                  tagline: 'High-impact creative sprint designed to accelerate brand growth.',
                  deliverables: [
                    'Custom Web or Brand Strategy Sprint',
                    'High-Fidelity Liquid Glass UI Design',
                    'Interactive Micro-Animations & Motion Design',
                    'Conversion Optimization & Analytics Setup',
                  ],
                  revisions: '2 Rounds Included',
                  estimatedDelivery: '10–14 Business Days',
                  featured: false,
                  sortOrder: packages.length + 1,
                  visibility: true,
                });
                setPackageDeliverableInput('');
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add New Package
            </GlassButton>
          </div>

          {editingPackage && (
            <LiquidGlass variant="elevated" className="p-6 space-y-5 border border-[#FF6E17]/40 mb-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">
                    {packages.some(p => p.id === editingPackage.id) ? 'Edit Service Package' : 'Create New Service Package'}
                  </h4>
                  {editingPackage.featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FF6E17] text-white">
                      Featured / Most Popular
                    </span>
                  )}
                  {editingPackage.visibility === false && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-neutral-400 bg-neutral-800 border border-white/10">
                      Hidden Draft
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditingPackage(null)}
                  className="text-neutral-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Package Title *</label>
                  <input
                    type="text"
                    value={editingPackage.title || ''}
                    onChange={e => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setEditingPackage(prev => ({ ...prev, title, slug }));
                    }}
                    placeholder="e.g. Scale & Accelerate"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Slug *</label>
                  <input
                    type="text"
                    value={editingPackage.slug || ''}
                    onChange={e => setEditingPackage(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. scale-accelerate"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white font-mono focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Price Display *</label>
                  <input
                    type="text"
                    value={editingPackage.price || ''}
                    onChange={e => setEditingPackage(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. $1,650 or ৳120,000 or Custom Quote"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white font-mono font-bold focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Currency</label>
                  <input
                    type="text"
                    value={editingPackage.currency || 'USD'}
                    onChange={e => setEditingPackage(prev => ({ ...prev, currency: e.target.value }))}
                    placeholder="USD, BDT, EUR..."
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white font-mono focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Billing Model / Schedule</label>
                  <input
                    type="text"
                    value={editingPackage.billingModel || ''}
                    onChange={e => setEditingPackage(prev => ({ ...prev, billingModel: e.target.value }))}
                    placeholder="e.g. per project / custom scope, monthly retainer"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Sort Order</label>
                  <input
                    type="number"
                    value={editingPackage.sortOrder ?? 1}
                    onChange={e => setEditingPackage(prev => ({ ...prev, sortOrder: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white font-mono focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Revisions Policy</label>
                  <input
                    type="text"
                    value={editingPackage.revisions || ''}
                    onChange={e => setEditingPackage(prev => ({ ...prev, revisions: e.target.value }))}
                    placeholder="e.g. 2 Rounds Included, Unlimited in Sprint"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 mb-1 font-medium">Estimated Delivery / Turnaround</label>
                  <input
                    type="text"
                    value={editingPackage.estimatedDelivery || ''}
                    onChange={e => setEditingPackage(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                    placeholder="e.g. 14–20 Business Days, Ongoing Monthly Retainer"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tagline / Value Proposition */}
              <div>
                <label className="block text-neutral-400 text-xs mb-1 font-medium">
                  Tagline / Brief Value Proposition
                </label>
                <textarea
                  rows={2}
                  value={editingPackage.tagline || ''}
                  onChange={e => setEditingPackage(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. Our flagship full-stack creative package designed for established brands ready to scale."
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white focus:border-[#FF6E17] focus:outline-none"
                />
              </div>

              {/* Deliverables / Package Inclusions Builder */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-300 text-xs font-semibold flex items-center gap-1.5">
                    <span>Package Inclusions & Deliverables ({editingPackage.deliverables?.length || 0})</span>
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">Displayed as checklist on the card</span>
                </div>

                {/* Existing deliverables list */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(editingPackage.deliverables || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
                      <div className="flex items-center gap-2 text-neutral-200">
                        <Check className="w-3.5 h-3.5 text-[#FF6E17] shrink-0" />
                        <span>{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingPackage.deliverables || []).filter((_, i) => i !== idx);
                          setEditingPackage(prev => ({ ...prev, deliverables: updated }));
                        }}
                        className="text-neutral-500 hover:text-red-400 p-0.5 cursor-pointer"
                        title="Remove item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!editingPackage.deliverables || editingPackage.deliverables.length === 0) && (
                    <p className="text-xs text-neutral-500 italic py-1">No inclusions added yet. Add items below.</p>
                  )}
                </div>

                {/* Add new deliverable input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={packageDeliverableInput}
                    onChange={e => setPackageDeliverableInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (packageDeliverableInput.trim()) {
                          const current = editingPackage.deliverables || [];
                          setEditingPackage(prev => ({ ...prev, deliverables: [...current, packageDeliverableInput.trim()] }));
                          setPackageDeliverableInput('');
                        }
                      }
                    }}
                    placeholder="Type an inclusion item (e.g. 'Unlimited Revisions during Sprint') and click Add or press Enter"
                    className="flex-1 rounded-lg bg-black/60 border border-white/15 px-3 py-1.5 text-xs text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (packageDeliverableInput.trim()) {
                        const current = editingPackage.deliverables || [];
                        setEditingPackage(prev => ({ ...prev, deliverables: [...current, packageDeliverableInput.trim()] }));
                        setPackageDeliverableInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF6E17] text-white hover:bg-[#e05d0e] transition-colors cursor-pointer shrink-0"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {/* Toggles: Featured & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPackage.featured ?? false}
                    onChange={e => setEditingPackage(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#FF6E17] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Featured ("Most Popular Sprint")</span>
                    <span className="text-[11px] text-neutral-400">Highlights this card on the homepage with radiant glow and top badge.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPackage.visibility ?? true}
                    onChange={e => setEditingPackage(prev => ({ ...prev, visibility: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#FF6E17] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Publish Live on Homepage</span>
                    <span className="text-[11px] text-neutral-400">If unchecked, this package will be saved as hidden draft.</span>
                  </div>
                </label>
              </div>

              {/* Form Action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-[11px] font-mono text-neutral-400">
                  {editingPackage.title ? `Ready to save "${editingPackage.title}"` : 'Fill required fields to save'}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPackage(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <GlassButton
                    size="sm"
                    onClick={async () => {
                      if (!editingPackage.title?.trim() || !editingPackage.slug?.trim() || !editingPackage.price?.trim()) {
                        alert('Package Title, Slug, and Price are required.');
                        return;
                      }
                      await savePackage(editingPackage as PricingPackage);
                      await onRefreshData();
                      setEditingPackage(null);
                    }}
                  >
                    Save Package
                  </GlassButton>
                </div>
              </div>
            </LiquidGlass>
          )}

          {/* Packages List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <LiquidGlass
                key={pkg.id}
                variant={pkg.featured ? 'elevated' : 'standard'}
                withOrangeGlow={pkg.featured}
                className={`p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  pkg.featured ? 'border-[#FF6E17] ring-1 ring-[#FF6E17]/40' : 'border-white/10'
                } ${!pkg.visibility ? 'opacity-60 bg-black/40' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                      Order #{pkg.sortOrder}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {pkg.featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FF6E17] text-white">
                          Featured
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        pkg.visibility ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400 border border-white/10'
                      }`}>
                        {pkg.visibility ? '● Live' : '○ Hidden'}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-white tracking-tight mb-1">{pkg.title}</h4>
                  <p className="text-xs text-neutral-300 line-clamp-2 mb-4 leading-relaxed">{pkg.tagline}</p>

                  <div className="mb-4 pb-4 border-b border-white/10">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{pkg.price}</span>
                    <span className="text-xs text-neutral-400 block mt-0.5 font-mono">{pkg.billingModel}</span>
                  </div>

                  <div className="space-y-1.5 mb-6">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                      Inclusions ({pkg.deliverables.length})
                    </span>
                    {pkg.deliverables.slice(0, 4).map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                        <Check className="w-3 h-3 text-[#FF6E17] shrink-0" />
                        <span className="line-clamp-1">{d}</span>
                      </div>
                    ))}
                    {pkg.deliverables.length > 4 && (
                      <span className="text-[10px] text-neutral-500 font-mono block pl-5">
                        +{pkg.deliverables.length - 4} more inclusions
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex justify-between text-xs text-neutral-400 font-mono">
                    <span>Revisions:</span>
                    <span className="text-white">{pkg.revisions}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400 font-mono">
                    <span>Timeline:</span>
                    <span className="text-white">{pkg.estimatedDelivery}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <button
                      onClick={async () => {
                        await savePackage({ ...pkg, visibility: !pkg.visibility });
                        await onRefreshData();
                      }}
                      className="text-neutral-400 hover:text-white font-mono text-[11px] underline cursor-pointer"
                    >
                      {pkg.visibility ? 'Hide Package' : 'Show Live'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPackage(pkg);
                          setPackageDeliverableInput('');
                        }}
                        className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPackageToDelete(pkg)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </LiquidGlass>
            ))}
          </div>

          {/* Package Deletion In-App Modal */}
          {packageToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <LiquidGlass variant="elevated" className="max-w-md w-full p-6 space-y-4 border border-red-500/40 shadow-2xl shadow-red-950/60">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-white">Delete Service Package?</h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Are you sure you want to delete <strong className="text-white">"{packageToDelete.title}"</strong> ({packageToDelete.price})?
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-2">
                      This will remove this pricing sprint from the homepage package comparison.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isDeletingPackage}
                    onClick={() => setPackageToDelete(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingPackage}
                    onClick={async () => {
                      try {
                        setIsDeletingPackage(true);
                        await deletePackage(packageToDelete.id);
                        await onRefreshData();
                        setPackageToDelete(null);
                      } catch (err) {
                        console.error('Failed to delete package:', err);
                      } finally {
                        setIsDeletingPackage(false);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isDeletingPackage ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              </LiquidGlass>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 6: COLLABORATORS & TESTIMONIALS MANAGEMENT
      ======================================================== */}
      {activeTab === 'collaborators' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Collaborator Endorsements & Client Voices</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FF6E17]/15 text-[#FF6E17] border border-[#FF6E17]/30">
                  {testimonials.length} Total
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Customize client quotes, communication channels (Fiverr, WhatsApp, Instagram, Facebook, Discord), and Trusted Customer verification badges. Changes stream live to the homepage ticker.
              </p>
            </div>
            <GlassButton
              size="sm"
              onClick={() => {
                setEditingTestimonial({
                  id: 't-' + Date.now(),
                  clientName: '',
                  position: 'Founder & CEO',
                  company: '',
                  quote: '',
                  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                  status: 'approved',
                  sortOrder: testimonials.length + 1,
                  sourcePlatform: 'fiverr',
                  isTrustedClient: true,
                  rating: 5,
                  projectTitle: '',
                  date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                });
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Collaborator
            </GlassButton>
          </div>

          {editingTestimonial && (
            <LiquidGlass variant="elevated" className="p-6 space-y-4 border border-[#FF6E17]/40 mb-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">
                    {testimonials.some(t => t.id === editingTestimonial.id)
                      ? 'Edit Collaborator Endorsement'
                      : 'Add New Collaborator Endorsement'}
                  </h4>
                  {editingTestimonial.sourcePlatform && (
                    <PlatformBadge platform={editingTestimonial.sourcePlatform} />
                  )}
                  {editingTestimonial.isTrustedClient && (
                    <TrustedCustomerBadge />
                  )}
                </div>
                <button
                  onClick={() => setEditingTestimonial(null)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    value={editingTestimonial.clientName || ''}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="e.g. Farhan Rahman"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Position / Role</label>
                  <input
                    type="text"
                    value={editingTestimonial.position || ''}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g. Chief Growth Officer"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Company / Brand</label>
                  <input
                    type="text"
                    value={editingTestimonial.company || ''}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Apex Logistics Global"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Origin / Source Platform *</label>
                  <select
                    value={editingTestimonial.sourcePlatform || 'fiverr'}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, sourcePlatform: e.target.value as CollaboratorPlatform }))}
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none font-medium"
                  >
                    <option value="fiverr">Fiverr Pro (Green badge)</option>
                    <option value="whatsapp">WhatsApp Direct (Emerald badge)</option>
                    <option value="instagram">Instagram DM (Pink/Purple badge)</option>
                    <option value="facebook">Facebook Ads/Page (Blue badge)</option>
                    <option value="discord">Discord Community (Indigo badge)</option>
                    <option value="upwork">Upwork Enterprise (Teal badge)</option>
                    <option value="direct">Direct Studio Client (Amber badge)</option>
                    <option value="other">Other / Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={editingTestimonial.rating ?? 5}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, rating: parseInt(e.target.value, 10) }))}
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  >
                    <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                    <option value={4}>★★★★☆ (4 Stars - Great)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Status on Home Page</label>
                  <select
                    value={editingTestimonial.status || 'approved'}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  >
                    <option value="approved">Approved & Streaming Live</option>
                    <option value="pending">Pending / Hidden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={editingTestimonial.avatarUrl || ''}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Project Tag (Optional)</label>
                  <input
                    type="text"
                    value={editingTestimonial.projectTitle || ''}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, projectTitle: e.target.value }))}
                    placeholder="e.g. FinTech Interface & 3D Motion"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Date Tag (Optional)</label>
                  <input
                    type="text"
                    value={editingTestimonial.date || ''}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="e.g. February 2026"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>
              </div>

              {/* Trusted Customer Toggle */}
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-200">
                  <input
                    type="checkbox"
                    checked={editingTestimonial.isTrustedClient ?? false}
                    onChange={e => setEditingTestimonial(prev => ({ ...prev, isTrustedClient: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#FF6E17] cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-white block">Award "Trusted Customer" Badge</span>
                    <span className="text-[11px] text-neutral-400">
                      Displays a golden verified badge on the card to instill supreme visitor confidence.
                    </span>
                  </div>
                </label>
                {editingTestimonial.isTrustedClient && (
                  <div className="shrink-0">
                    <TrustedCustomerBadge />
                  </div>
                )}
              </div>

              {/* Quote Text */}
              <div>
                <label className="block text-neutral-400 text-xs mb-1 font-semibold">
                  Client Quote / Testimonial Statement *
                </label>
                <textarea
                  rows={3}
                  value={editingTestimonial.quote || ''}
                  onChange={e => setEditingTestimonial(prev => ({ ...prev, quote: e.target.value }))}
                  placeholder="e.g. Boostify completely redefined how our brand presents itself online. The speed and luxury aesthetic blew our team away..."
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white focus:border-[#FF6E17] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <span>Preview:</span>
                  <PlatformBadge platform={editingTestimonial.sourcePlatform || 'direct'} />
                  {editingTestimonial.isTrustedClient && <TrustedCustomerBadge />}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTestimonial(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <GlassButton
                    size="sm"
                    onClick={async () => {
                      if (!editingTestimonial.clientName?.trim() || !editingTestimonial.quote?.trim()) {
                        alert('Client Name and Quote statement are required.');
                        return;
                      }
                      await saveTestimonial(editingTestimonial as Testimonial);
                      await onRefreshData();
                      setEditingTestimonial(null);
                    }}
                  >
                    Save Endorsement
                  </GlassButton>
                </div>
              </div>
            </LiquidGlass>
          )}

          {/* Collaborator Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map(item => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl glass-subtle border transition-all duration-300 flex flex-col justify-between text-xs relative ${
                  item.status === 'approved'
                    ? 'border-white/15 hover:border-[#FF6E17]/40 bg-black/40'
                    : 'border-white/5 opacity-60 bg-black/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <PlatformBadge platform={item.sourcePlatform || 'direct'} />
                      {item.isTrustedClient && <TrustedCustomerBadge />}
                    </div>
                  </div>

                  <p className="text-neutral-200 italic mb-4 leading-relaxed line-clamp-3">
                    "{item.quote}"
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 pt-3 border-t border-white/10 mb-3">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={item.clientName}
                        className="w-9 h-9 rounded-full object-cover border border-[#FF6E17]/40"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#FF6E17]/20 border border-[#FF6E17]/40 flex items-center justify-center text-white font-bold text-xs">
                        {item.clientName.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-white text-xs truncate">{item.clientName}</h4>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {item.position}{item.company ? ` • ${item.company}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <button
                      onClick={async () => {
                        const newStatus = item.status === 'approved' ? 'pending' : 'approved';
                        await saveTestimonial({ ...item, status: newStatus });
                        await onRefreshData();
                      }}
                      className={`px-2 py-0.5 rounded-full font-mono font-medium transition-colors cursor-pointer ${
                        item.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400 border border-white/10'
                      }`}
                    >
                      {item.status === 'approved' ? '● Live on Ticker' : '○ Hidden'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingTestimonial(item)}
                        className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setTestimonialToDelete(item)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete Endorsement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Deletion In-App Modal */}
          {testimonialToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <LiquidGlass variant="elevated" className="max-w-md w-full p-6 space-y-4 border border-red-500/40 shadow-2xl shadow-red-950/60">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-white">Delete Collaborator Endorsement?</h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Are you sure you want to remove the endorsement from <strong className="text-white">"{testimonialToDelete.clientName}"</strong>{testimonialToDelete.company ? ` (${testimonialToDelete.company})` : ''}?
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-2">
                      This will remove the endorsement from the homepage collaborator reviews.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isDeletingTestimonial}
                    onClick={() => setTestimonialToDelete(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingTestimonial}
                    onClick={async () => {
                      try {
                        setIsDeletingTestimonial(true);
                        await deleteTestimonial(testimonialToDelete.id);
                        await onRefreshData();
                        setTestimonialToDelete(null);
                      } catch (err) {
                        console.error('Failed to delete testimonial:', err);
                      } finally {
                        setIsDeletingTestimonial(false);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isDeletingTestimonial ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              </LiquidGlass>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 6: BLOG ARTICLES MANAGEMENT
      ======================================================== */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Blog & Insights Articles ({blogPosts.length})</h3>
            <GlassButton
              size="sm"
              onClick={() => {
                setEditingBlogPost({
                  id: 'blog-' + Date.now(),
                  title: '',
                  slug: '',
                  excerpt: '',
                  content: '',
                  category: 'Design Systems',
                  tags: ['Design', 'Growth'],
                  author: {
                    name: 'Saify Samit',
                    role: 'Creative Director at Boostify',
                  },
                  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                  readTime: '4 min read',
                  publishedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  status: 'published',
                  isDemo: false,
                });
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Article
            </GlassButton>
          </div>

          {editingBlogPost && (
            <LiquidGlass variant="elevated" className="p-6 space-y-4 border border-[#FF6E17]/40 mb-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white">Create / Edit Article</h4>
                <button onClick={() => setEditingBlogPost(null)} className="text-neutral-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingBlogPost.title || ''}
                    onChange={e => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setEditingBlogPost(prev => ({ ...prev, title, slug }));
                    }}
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingBlogPost.slug || ''}
                    onChange={e => setEditingBlogPost(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 text-xs mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  value={editingBlogPost.excerpt || ''}
                  onChange={e => setEditingBlogPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 text-xs mb-1">Full Content (Markdown format supported)</label>
                <textarea
                  rows={6}
                  value={editingBlogPost.content || ''}
                  onChange={e => setEditingBlogPost(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBlogPost(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <GlassButton
                  size="sm"
                  onClick={async () => {
                    if (editingBlogPost.title && editingBlogPost.slug) {
                      await saveBlogPost(editingBlogPost as BlogPost);
                      await onRefreshData();
                      setEditingBlogPost(null);
                    }
                  }}
                >
                  Publish Article
                </GlassButton>
              </div>
            </LiquidGlass>
          )}

          <div className="space-y-3">
            {blogPosts.map(post => (
              <div
                key={post.id}
                className="p-4 rounded-xl glass-subtle border border-white/10 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[#FF6E17] text-[10px] uppercase font-bold">{post.category}</span>
                    <span className="text-neutral-500">• {post.publishedDate}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{post.title}</h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setEditingBlogPost(post)}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlogToDelete(post)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium"
                    title="Delete Article"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Blog Post Deletion In-App Modal */}
          {blogToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <LiquidGlass variant="elevated" className="max-w-md w-full p-6 space-y-4 border border-red-500/40 shadow-2xl shadow-red-950/60">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-white">Delete Blog Article?</h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Are you sure you want to permanently delete <strong className="text-white">"{blogToDelete.title}"</strong>?
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-2">
                      This will remove the insight article from the Insights &amp; Perspectives archive.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isDeletingBlog}
                    onClick={() => setBlogToDelete(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingBlog}
                    onClick={async () => {
                      try {
                        setIsDeletingBlog(true);
                        await deleteBlogPost(blogToDelete.id);
                        await onRefreshData();
                        setBlogToDelete(null);
                      } catch (err) {
                        console.error('Failed to delete blog post:', err);
                      } finally {
                        setIsDeletingBlog(false);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isDeletingBlog ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              </LiquidGlass>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 6: SEO SETTINGS & SOCIAL SHARE METADATA
      ======================================================== */}
      {activeTab === 'seo' && (
        <div className="space-y-6 max-w-4xl">
          {/* Header & Quick Save */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#FF6E17]" />
                <span>Search Engine Optimization (SEO) & Social Sharing</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Customize site title, search meta description, OpenGraph social share card banner, and keyword indexing directly from the admin panel.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {settingsSaved && (
                <span className="text-emerald-400 text-xs flex items-center gap-1.5 font-medium animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SEO Updated Live!</span>
                </span>
              )}
              <GlassButton
                size="sm"
                onClick={() => handleSaveSettings()}
                disabled={isSavingSettings}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>{isSavingSettings ? 'Saving...' : 'Save SEO Settings'}</span>
              </GlassButton>
            </div>
          </div>

          {/* Section 1: Core Search Metadata (Title & Description) */}
          <LiquidGlass variant="standard" className="p-6 space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#FF6E17]" />
                  <span>Core Search Metadata (Google SERP)</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Controls the primary headline and snippet that search engines display to prospective clients.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditSettings(prev => ({
                      ...prev,
                      seo: {
                        ...(prev.seo || {}),
                        title: `${prev.brandName || 'Boostify'} — Creative Digital Growth & Technology Agency | Dhaka`,
                        keywords: prev.seo?.keywords || [],
                        description: prev.seo?.description || '',
                      }
                    }));
                  }}
                  className="text-[11px] text-[#FF6E17] hover:underline cursor-pointer font-medium"
                >
                  Set Recommended Title
                </button>
                <span className="text-neutral-600">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditSettings(prev => ({
                      ...prev,
                      seo: {
                        ...(prev.seo || {}),
                        description: 'Boostify is a premier digital agency in Gulshan 1, Dhaka, delivering bespoke Web Development, UI/UX Design, Motion Graphics, Video Production, and High-Performance Digital Marketing.',
                        keywords: prev.seo?.keywords || [],
                        title: prev.seo?.title || '',
                      }
                    }));
                  }}
                  className="text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                >
                  Set Recommended Description
                </button>
              </div>
            </div>

            {/* Site Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span>Site Title (`&lt;title&gt;` &amp; `og:title`) *</span>
                </label>
                <div className="flex items-center gap-2">
                  {(() => {
                    const len = (editSettings.seo?.title || '').length;
                    if (len >= 30 && len <= 60) {
                      return (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {len}/60 chars • Optimal for Google SERP
                        </span>
                      );
                    } else if (len > 60) {
                      return (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {len}/60 chars • May truncate in Google
                        </span>
                      );
                    } else {
                      return (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-white/10">
                          {len}/60 chars • Recommend 30–60 chars
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>

              <input
                type="text"
                value={editSettings.seo?.title || ''}
                onChange={e => {
                  const val = e.target.value;
                  setEditSettings(prev => ({
                    ...prev,
                    seo: {
                      ...(prev.seo || { description: '', keywords: [] }),
                      title: val,
                    }
                  }));
                }}
                placeholder="e.g. Boostify — Creative Digital Growth & Technology Agency | Dhaka"
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white focus:border-[#FF6E17] focus:outline-none"
              />
              <p className="text-[11px] text-neutral-400">
                Shown in Google search results, browser tab title, bookmark name, and social post previews.
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span>Meta Description (`&lt;meta name="description"&gt;`) *</span>
                </label>
                <div className="flex items-center gap-2">
                  {(() => {
                    const len = (editSettings.seo?.description || '').length;
                    if (len >= 120 && len <= 160) {
                      return (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {len}/160 chars • Optimal snippet length
                        </span>
                      );
                    } else if (len > 160) {
                      return (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {len}/160 chars • May truncate after ~160 chars
                        </span>
                      );
                    } else {
                      return (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-white/10">
                          {len}/160 chars • Recommend 120–160 chars
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>

              <textarea
                rows={3}
                value={editSettings.seo?.description || ''}
                onChange={e => {
                  const val = e.target.value;
                  setEditSettings(prev => ({
                    ...prev,
                    seo: {
                      ...(prev.seo || { title: '', keywords: [] }),
                      description: val,
                    }
                  }));
                }}
                placeholder="Brief, persuasive 1–2 sentence summary explaining your creative services, location, and unique value proposition..."
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white focus:border-[#FF6E17] focus:outline-none"
              />
              <p className="text-[11px] text-neutral-400">
                A compelling summary that appears below your title in Google search results and when the URL is shared.
              </p>
            </div>

            {/* Canonical URL */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>Canonical Website URL</span>
              </label>
              <input
                type="text"
                value={editSettings.seo?.canonicalUrl || ''}
                onChange={e => {
                  const val = e.target.value;
                  setEditSettings(prev => ({
                    ...prev,
                    seo: {
                      ...(prev.seo || { title: '', description: '', keywords: [] }),
                      canonicalUrl: val,
                    }
                  }));
                }}
                placeholder="https://boostifybd.com"
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white font-mono focus:border-[#FF6E17] focus:outline-none"
              />
              <p className="text-[11px] text-neutral-400">
                Tells search engine crawlers which master URL to index, preventing duplicate content penalties.
              </p>
            </div>
          </LiquidGlass>

          {/* Section 2: OpenGraph & Social Share Asset (OG Image URL) */}
          <LiquidGlass variant="standard" className="p-6 space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#FF6E17]" />
                  <span>OpenGraph &amp; Social Share Image (OG Image)</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  The visual hero card that renders when your website link is shared across social messaging platforms.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditSettings(prev => ({
                      ...prev,
                      seo: {
                        ...(prev.seo || { title: '', description: '', keywords: [] }),
                        ogImageUrl: prev.logoUrl || 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png',
                      }
                    }));
                  }}
                  className="text-[11px] text-[#FF6E17] hover:underline cursor-pointer font-medium"
                >
                  Use Agency Logo
                </button>
                <span className="text-neutral-600">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditSettings(prev => ({
                      ...prev,
                      seo: {
                        ...(prev.seo || { title: '', description: '', keywords: [] }),
                        ogImageUrl: 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png',
                      }
                    }));
                  }}
                  className="text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Image Controls & URL */}
              <div className="lg:col-span-7 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    OpenGraph Image Asset URL (`og:image` &amp; `twitter:image`)
                  </label>
                  <input
                    type="text"
                    value={editSettings.seo?.ogImageUrl || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditSettings(prev => ({
                        ...prev,
                        seo: {
                          ...(prev.seo || { title: '', description: '', keywords: [] }),
                          ogImageUrl: val,
                        }
                      }));
                    }}
                    placeholder="https://... direct image link (.png, .jpg, .webp)"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white font-mono focus:border-[#FF6E17] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF6E17]/15 hover:bg-[#FF6E17]/25 border border-[#FF6E17]/40 text-xs text-[#FF6E17] font-semibold transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New OG Share Banner</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleOgImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Recommended: 1200×630px (1.91:1)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 space-y-1">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6E17]" />
                    <span>Supported Sharing Networks:</span>
                  </span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Facebook, WhatsApp, LinkedIn, X / Twitter (<code className="text-neutral-300">summary_large_image</code>), Discord, Slack, iMessage, and Telegram.
                  </p>
                </div>
              </div>

              {/* Right Column: OG Image Visual Thumbnail */}
              <div className="lg:col-span-5 p-3 rounded-xl bg-black/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Current Share Banner
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                    1.91:1 Ratio
                  </span>
                </div>

                <div className="relative aspect-[1.91/1] w-full rounded-lg overflow-hidden bg-black/90 border border-white/15 flex items-center justify-center">
                  {editSettings.seo?.ogImageUrl ? (
                    <img
                      src={editSettings.seo.ogImageUrl}
                      alt="OG Share Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png';
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto mb-1" />
                      <span className="text-xs text-neutral-500 font-mono">No OG Image Set</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </LiquidGlass>

          {/* Section 3: Interactive Live Previews */}
          <LiquidGlass variant="standard" className="p-6 space-y-5">
            <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#FF6E17]" />
                  <span>Real-Time Visual Previews</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  See precisely how your website presents itself in Google Search results and on social platforms.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
                <button
                  type="button"
                  onClick={() => setSerpPreviewMode('desktop')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    serpPreviewMode === 'desktop'
                      ? 'bg-[#FF6E17] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Google Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSerpPreviewMode('mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    serpPreviewMode === 'mobile'
                      ? 'bg-[#FF6E17] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Google Mobile</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Google Search Result Card */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  1. Google Search Snippet Preview ({serpPreviewMode})
                </span>

                <div className={`p-4 rounded-xl bg-[#202124] border border-white/10 space-y-2 font-sans ${
                  serpPreviewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
                }`}>
                  {/* Google Breadcrumb / Favicon header */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#303134] flex items-center justify-center overflow-hidden shrink-0">
                      {editSettings.faviconUrl ? (
                        <img
                          src={editSettings.faviconUrl}
                          alt="favicon"
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png';
                          }}
                        />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>
                    <div className="text-xs leading-none">
                      <span className="text-[#dadce0] font-medium block">
                        {editSettings.brandName || 'Boostify'}
                      </span>
                      <span className="text-[#bdc1c6] text-[11px] font-mono">
                        {editSettings.seo?.canonicalUrl || 'https://boostifybd.com'}
                      </span>
                    </div>
                  </div>

                  {/* Title Link */}
                  <h5 className="text-[#8ab4f8] hover:underline text-base font-normal leading-snug cursor-pointer line-clamp-2">
                    {editSettings.seo?.title || `${editSettings.brandName || 'Boostify'} — Creative Digital Growth & Technology Agency`}
                  </h5>

                  {/* Description snippet */}
                  <p className="text-[#bdc1c6] text-xs leading-relaxed line-clamp-3">
                    {editSettings.seo?.description || 'Boostify is a premier digital agency in Gulshan 1, Dhaka, delivering bespoke Web Development, UI/UX Design, Motion Graphics, Video Production, and Digital Marketing.'}
                  </p>
                </div>
              </div>

              {/* Social Media Share Preview (Facebook / LinkedIn / Twitter) */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  2. Social Share Card (WhatsApp, Facebook, Twitter, LinkedIn)
                </span>

                <div className="rounded-xl overflow-hidden bg-[#18181b] border border-white/15 shadow-xl max-w-sm mx-auto lg:max-w-none">
                  {/* Image Top */}
                  <div className="relative aspect-[1.91/1] w-full bg-black/80 flex items-center justify-center overflow-hidden">
                    {editSettings.seo?.ogImageUrl ? (
                      <img
                        src={editSettings.seo.ogImageUrl}
                        alt="Social Share Asset"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-neutral-600" />
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 backdrop-blur-sm text-neutral-300 border border-white/10">
                      og:image
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 space-y-1 bg-[#121214]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                      {new URL(editSettings.seo?.canonicalUrl || 'https://boostifybd.com').hostname.toUpperCase()}
                    </span>
                    <h5 className="text-sm font-bold text-white line-clamp-1">
                      {editSettings.seo?.title || editSettings.brandName || 'Boostify'}
                    </h5>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {editSettings.seo?.description || 'World-class digital growth and creative agency in Dhaka, Bangladesh.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlass>

          {/* Section 4: Target SEO Keywords */}
          <LiquidGlass variant="standard" className="p-6 space-y-4">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#FF6E17]" />
                  <span>Target SEO Keywords &amp; Search Tags ({(editSettings.seo?.keywords || []).length})</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Embedded in document meta tags and structured JSON-LD schema for search indexing.
                </p>
              </div>
            </div>

            {/* Keyword Chips */}
            <div className="flex flex-wrap gap-2">
              {(editSettings.seo?.keywords || []).map((kw, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-200"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (editSettings.seo?.keywords || []).filter((_, i) => i !== idx);
                      setEditSettings(prev => ({
                        ...prev,
                        seo: {
                          ...(prev.seo || { title: '', description: '' }),
                          keywords: updated,
                        }
                      }));
                    }}
                    className="text-neutral-500 hover:text-red-400 p-0.5 cursor-pointer"
                    title="Remove keyword"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(!editSettings.seo?.keywords || editSettings.seo.keywords.length === 0) && (
                <p className="text-xs text-neutral-500 italic">No keywords added yet. Add custom keywords below.</p>
              )}
            </div>

            {/* Add Keyword Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newKeywordInput}
                onChange={e => setNewKeywordInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newKeywordInput.trim()) {
                      const current = editSettings.seo?.keywords || [];
                      setEditSettings(prev => ({
                        ...prev,
                        seo: {
                          ...(prev.seo || { title: '', description: '' }),
                          keywords: [...current, newKeywordInput.trim()],
                        }
                      }));
                      setNewKeywordInput('');
                    }
                  }
                }}
                placeholder="Type a new keyword (e.g. 'Web development company in Dhaka') and click Add"
                className="flex-1 rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white focus:border-[#FF6E17] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (newKeywordInput.trim()) {
                    const current = editSettings.seo?.keywords || [];
                    setEditSettings(prev => ({
                      ...prev,
                      seo: {
                        ...(prev.seo || { title: '', description: '' }),
                        keywords: [...current, newKeywordInput.trim()],
                      }
                    }));
                    setNewKeywordInput('');
                  }
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#FF6E17] hover:bg-[#e05d0e] text-white transition-colors cursor-pointer shrink-0"
              >
                Add Keyword
              </button>
            </div>
          </LiquidGlass>

          {/* Bottom Action Footer */}
          <div className="p-4 rounded-xl glass-subtle border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-white block">Ready to deploy SEO changes?</span>
              <p className="text-[11px] text-neutral-400">
                Saving updates the site title, meta tags, OpenGraph sharing cards, and server persistent storage across all devices.
              </p>
            </div>

            <GlassButton
              size="md"
              onClick={() => handleSaveSettings()}
              disabled={isSavingSettings}
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>{isSavingSettings ? 'Saving All Settings...' : 'Save All SEO Settings'}</span>
            </GlassButton>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 7: SITE SETTINGS & BRANDING
      ======================================================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
          <LiquidGlass variant="standard" className="p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Brand Identity & Contact Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Agency Name</label>
                <input
                  type="text"
                  value={editSettings.brandName}
                  onChange={e => setEditSettings({ ...editSettings, brandName: e.target.value })}
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Official Logo Asset URL</label>
                <input
                  type="text"
                  value={editSettings.logoUrl}
                  onChange={e => setEditSettings({ ...editSettings, logoUrl: e.target.value })}
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={editSettings.contact.email}
                  onChange={e => setEditSettings({
                    ...editSettings,
                    contact: { ...editSettings.contact, email: e.target.value }
                  })}
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={editSettings.contact.whatsapp}
                  onChange={e => setEditSettings({
                    ...editSettings,
                    contact: { ...editSettings.contact, whatsapp: e.target.value }
                  })}
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 text-xs mb-1">Studio Headquarters Address</label>
              <input
                type="text"
                value={editSettings.contact.headquarters}
                onChange={e => setEditSettings({
                  ...editSettings,
                  contact: { ...editSettings.contact, headquarters: e.target.value }
                })}
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Browser Favicon Configuration */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="block text-white font-bold text-xs flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#FF6E17]" />
                    <span>Browser Tab Favicon</span>
                  </label>
                  <p className="text-[11px] text-neutral-400">
                    The icon that appears in the browser tab and bookmarks (.png, .ico, or .svg).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditSettings(prev => ({ ...prev, faviconUrl: prev.logoUrl }))}
                    className="text-[11px] text-[#FF6E17] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    Use Agency Logo
                  </button>
                  <span className="text-neutral-600">•</span>
                  <button
                    type="button"
                    onClick={() => setEditSettings(prev => ({ 
                      ...prev, 
                      faviconUrl: 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png' 
                    }))}
                    className="text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Reset Default
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-8 space-y-2">
                  <input
                    type="text"
                    value={editSettings.faviconUrl || ''}
                    onChange={e => setEditSettings({ ...editSettings, faviconUrl: e.target.value })}
                    placeholder="https://... image URL or click upload below"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white font-mono"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] text-neutral-200 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#FF6E17]" />
                      <span>Upload Favicon Image</span>
                      <input
                        type="file"
                        accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp"
                        onChange={handleFaviconFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Recommended: 32×32 or 64×64 PNG/ICO/SVG
                    </span>
                  </div>
                </div>

                {/* Tab Preview Box */}
                <div className="md:col-span-4 p-2.5 rounded-xl bg-black/80 border border-white/10 space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 block">
                    Browser Tab Preview
                  </span>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#18181b] border border-white/10 text-[11px] text-neutral-200 shadow-inner">
                    <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                      {editSettings.faviconUrl ? (
                        <img
                          src={editSettings.faviconUrl}
                          alt="Favicon preview"
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png';
                          }}
                        />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                    </div>
                    <span className="truncate text-[11px] font-medium text-neutral-300">
                      {editSettings.brandName || 'Boostify'}
                    </span>
                    <span className="ml-auto text-[10px] text-neutral-500 font-mono">×</span>
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass variant="standard" className="p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Hero Copy & Availability Indicator
            </h3>

            <div>
              <label className="block text-neutral-400 text-xs mb-1">Availability Message</label>
              <input
                type="text"
                value={editSettings.availability.statusText}
                onChange={e => setEditSettings({
                  ...editSettings,
                  availability: { ...editSettings.availability, statusText: e.target.value }
                })}
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs mb-1">Hero Main Headline</label>
              <textarea
                rows={2}
                value={editSettings.hero.headline}
                onChange={e => setEditSettings({
                  ...editSettings,
                  hero: { ...editSettings.hero, headline: e.target.value }
                })}
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs mb-1">Supporting Copy</label>
              <textarea
                rows={2}
                value={editSettings.hero.supportingCopy}
                onChange={e => setEditSettings({
                  ...editSettings,
                  hero: { ...editSettings.hero, supportingCopy: e.target.value }
                })}
                className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white"
              />
            </div>
          </LiquidGlass>

          {/* ========================================================
              HERO VIDEO BACKGROUND & BLURRINESS CONTROLS
              Configures the video and blur intensity for "WE MAKE DIGITAL FEEL DIFFERENT"
          ======================================================== */}
          <LiquidGlass variant="standard" className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#FF6E17]" />
                  <span>"WE MAKE DIGITAL FEEL DIFFERENT" Video Background</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Change the Hero section background video and control its blurriness and visual opacity in real time.
                </p>
              </div>

              {/* Video Toggle Switch */}
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={editSettings.hero.videoEnabled ?? true}
                  onChange={e => setEditSettings({
                    ...editSettings,
                    hero: {
                      ...editSettings.hero,
                      videoEnabled: e.target.checked,
                    }
                  })}
                  className="w-4 h-4 rounded accent-[#FF6E17] cursor-pointer"
                />
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  (editSettings.hero.videoEnabled ?? true)
                    ? 'bg-[#FF6E17]/20 text-[#FF6E17] border border-[#FF6E17]/30'
                    : 'bg-white/5 text-neutral-400 border border-white/10'
                }`}>
                  {(editSettings.hero.videoEnabled ?? true) ? 'Video Active' : 'Video Disabled'}
                </span>
              </label>
            </div>

            {/* Video Source URL & File Upload */}
            <div className="space-y-3">
              <label className="block text-neutral-300 font-semibold text-xs">
                Background Video Source URL (.mp4 or .webm)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editSettings.hero.videoUrl || ''}
                  onChange={e => setEditSettings({
                    ...editSettings,
                    hero: {
                      ...editSettings.hero,
                      videoUrl: e.target.value,
                    }
                  })}
                  placeholder="https://... direct link to MP4 or WebM video"
                  className="flex-1 rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF6E17]"
                />
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-neutral-200 transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5 text-[#FF6E17]" />
                  <span>Upload Video</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleHeroVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Curated Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-neutral-400 block font-mono">
                  Curated Agency Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {curatedVideoPresets.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setEditSettings({
                        ...editSettings,
                        hero: {
                          ...editSettings.hero,
                          videoUrl: preset.url,
                          videoEnabled: true,
                        }
                      })}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                        editSettings.hero.videoUrl === preset.url
                          ? 'bg-[#FF6E17]/20 border-[#FF6E17] text-white font-medium shadow-sm'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <Play className="w-3 h-3 text-[#FF6E17]" />
                      <span>{preset.name}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">({preset.badge})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Blurriness Controller */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#FF6E17]" />
                    <span>Background Blurriness Control</span>
                  </label>
                  <p className="text-[11px] text-neutral-400">
                    Controls the depth of blur on the video (0px is sharp; higher values create a luxurious frosted glass ambiance).
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#FF6E17]/20 border border-[#FF6E17]/30 text-[#FF6E17] font-mono text-xs font-bold">
                  {editSettings.hero.videoBlur ?? 10}px
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[11px] font-mono text-neutral-500">0px</span>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={editSettings.hero.videoBlur ?? 10}
                  onChange={e => setEditSettings({
                    ...editSettings,
                    hero: {
                      ...editSettings.hero,
                      videoBlur: parseInt(e.target.value, 10),
                    }
                  })}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FF6E17]"
                />
                <span className="text-[11px] font-mono text-neutral-500">30px</span>
              </div>

              {/* Blur Quick Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                {blurPresets.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setEditSettings({
                      ...editSettings,
                      hero: {
                        ...editSettings.hero,
                        videoBlur: preset.value,
                      }
                    })}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                      (editSettings.hero.videoBlur ?? 10) === preset.value
                        ? 'bg-[#FF6E17] text-white border-[#FF6E17] font-bold shadow-md shadow-[#FF6E17]/20'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Opacity / Darkness Overlay Controller */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#FF6E17]" />
                    <span>Video Visibility / Opacity</span>
                  </label>
                  <p className="text-[11px] text-neutral-400">
                    Controls video intensity relative to the dark backdrop (10% to 90%).
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-white font-mono text-xs font-bold">
                  {editSettings.hero.videoOpacity ?? 40}%
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[11px] font-mono text-neutral-500">10%</span>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={editSettings.hero.videoOpacity ?? 40}
                  onChange={e => setEditSettings({
                    ...editSettings,
                    hero: {
                      ...editSettings.hero,
                      videoOpacity: parseInt(e.target.value, 10),
                    }
                  })}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FF6E17]"
                />
                <span className="text-[11px] font-mono text-neutral-500">90%</span>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block font-mono">
                Live Preview (Section Appearance)
              </span>
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/15 flex items-center justify-center text-center p-4 bg-black">
                {editSettings.hero.videoUrl && (editSettings.hero.videoEnabled ?? true) ? (
                  <>
                    <video
                      key={editSettings.hero.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        filter: `blur(${editSettings.hero.videoBlur ?? 10}px)`,
                        opacity: (editSettings.hero.videoOpacity ?? 40) / 100,
                      }}
                      className="absolute inset-0 w-full h-full object-cover scale-110 pointer-events-none transition-all duration-300"
                    >
                      <source src={editSettings.hero.videoUrl} type="video/mp4" />
                      <source src={editSettings.hero.videoUrl} type="video/webm" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 pointer-events-none" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-neutral-900/80 flex items-center justify-center text-neutral-500 text-xs">
                    Video background is currently disabled
                  </div>
                )}

                {/* Simulated Floating Headline */}
                <div className="relative z-10 space-y-1 max-w-sm">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF6E17] font-bold block">
                    Hero Section Preview
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-display">
                    WE MAKE DIGITAL<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FF6E17] to-[#F4511E]">
                      FEEL DIFFERENT.
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-300 font-medium">
                    Current Blur: <strong className="text-[#FF6E17]">{editSettings.hero.videoBlur ?? 10}px</strong> • Opacity: <strong className="text-white">{editSettings.hero.videoOpacity ?? 40}%</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Save Action for Video & Blur */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={isSavingSettings}
                className="px-4 py-2.5 rounded-xl bg-[#FF6E17] hover:bg-[#FF6E17]/90 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSavingSettings ? 'Saving Settings...' : 'Save Video & Blur Settings'}</span>
              </button>
              {settingsSaved && (
                <span className="text-emerald-400 text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Video and blur settings saved successfully!</span>
                </span>
              )}
            </div>
          </LiquidGlass>

          {/* Top Announcement Bar Manager */}
          <LiquidGlass variant="standard" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Top Announcement Bar
                </h3>
                <p className="text-xs text-neutral-400">
                  Control the notification banner at the very top of the website.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editSettings.announcement?.enabled ?? true}
                  onChange={e => setEditSettings({
                    ...editSettings,
                    announcement: {
                      ...editSettings.announcement,
                      enabled: e.target.checked,
                    }
                  })}
                  className="w-4 h-4 rounded accent-[#FF6E17] cursor-pointer"
                />
                <span className="text-xs font-bold text-white">
                  {editSettings.announcement?.enabled ? 'Active / Visible' : 'Hidden'}
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-neutral-400 text-xs mb-1">
                  Announcement Headline / Message
                </label>
                <input
                  type="text"
                  value={editSettings.announcement?.text || ''}
                  onChange={e => setEditSettings({
                    ...editSettings,
                    announcement: {
                      ...editSettings.announcement,
                      text: e.target.value,
                    }
                  })}
                  placeholder="e.g. 🚀 Boostify Dhaka: New case studies published for Q4."
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">
                    Link / CTA Label
                  </label>
                  <input
                    type="text"
                    value={editSettings.announcement?.linkText || ''}
                    onChange={e => setEditSettings({
                      ...editSettings,
                      announcement: {
                        ...editSettings.announcement,
                        linkText: e.target.value,
                      }
                    })}
                    placeholder="e.g. Book Discovery Call"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">
                    Destination URL or Section Anchor
                  </label>
                  <input
                    type="text"
                    value={editSettings.announcement?.url || ''}
                    onChange={e => setEditSettings({
                      ...editSettings,
                      announcement: {
                        ...editSettings.announcement,
                        url: e.target.value,
                      }
                    })}
                    placeholder="e.g. #contact or https://..."
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </LiquidGlass>

          {/* Case Studies & Craft Categories Visibility in Site Settings */}
          <LiquidGlass variant="standard" className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6E17]" />
                  <span>"Case Studies &amp; Craft" Category Visibility</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Control the visibility of individual category tabs (Web Design, Branding, Social Media, Motion, Video, Marketing) on the Homepage and Work Archive.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSetAllCategoriesVisibility(true)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30 transition-colors cursor-pointer"
                >
                  Show All 6
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllCategoriesVisibility(false)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
                >
                  Hide All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CASE_STUDY_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isVisible = (editSettings.projectCategoryVisibility?.[cat.name] ?? true);
                const categoryProjectsCount = projects.filter(p => p.category === cat.name).length;

                return (
                  <div
                    key={cat.name}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isVisible
                        ? 'bg-white/5 border-white/15'
                        : 'bg-black/40 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg border shrink-0 ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          {categoryProjectsCount} {categoryProjectsCount === 1 ? 'proj' : 'projs'} • {isVisible ? 'Live' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCategoryVisibility(cat.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                        isVisible
                          ? 'bg-white/10 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 border border-white/10 hover:border-red-500/30'
                          : 'bg-[#FF6E17] hover:bg-[#e05d0e] text-white shadow-sm'
                      }`}
                    >
                      {isVisible ? 'Hide' : 'Make Live'}
                    </button>
                  </div>
                );
              })}
            </div>
          </LiquidGlass>

          {settingsSaved && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings successfully persisted to storage and site metadata.</span>
            </div>
          )}

          <GlassButton type="submit" size="md">
            Save All Settings
          </GlassButton>
        </form>
      )}

      {/* ========================================================
          TAB 7: FIREBASE ARCHITECTURE & SETUP GUIDE
      ======================================================== */}
      {activeTab === 'firebase' && (
        <div className="space-y-6 max-w-3xl">
          <LiquidGlass variant="elevated" className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#FF6E17]/20 border border-[#FF6E17]/40 text-[#FF6E17]">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Firebase Cloud Architecture</h3>
                <p className="text-xs text-neutral-400">Spark Free Plan Compatible Setup</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Boostify is architected with a modular Firebase SDK and dual-mode data layer. When valid Firebase credentials are provided in <code className="text-[#FF6E17]">.env</code>, the application automatically uses live Cloud Firestore collections and Firebase Authentication.
            </p>

            {/* Cloud Firestore Instant Sync Action */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Synchronize Database Collections</h4>
                  <p className="text-xs text-neutral-400">Push all current website settings, services, projects, and insights to Cloud Firestore.</p>
                </div>
                <GlassButton
                  type="button"
                  size="sm"
                  onClick={handleSyncFirestore}
                  disabled={isSyncingFirestore}
                >
                  {isSyncingFirestore ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-[#FF6E17]" /> Syncing to Firestore...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Sync All to Firestore
                    </span>
                  )}
                </GlassButton>
              </div>

              {firestoreSyncStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                  firestoreSyncStatus.success 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {firestoreSyncStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{firestoreSyncStatus.message}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 text-xs">
              <span className="font-bold text-white block">Configured Firestore Collections:</span>
              <ul className="grid grid-cols-2 gap-2 text-neutral-300">
                <li>• <code className="text-[#FF6E17]">siteSettings</code> (Branding & Hero)</li>
                <li>• <code className="text-[#FF6E17]">services</code> (8 Core Disciplines)</li>
                <li>• <code className="text-[#FF6E17]">projects</code> (Portfolio & Case Studies)</li>
                <li>• <code className="text-[#FF6E17]">packages</code> (Pricing & Deliverables)</li>
                <li>• <code className="text-[#FF6E17]">blogPosts</code> (Editorial Insights)</li>
                <li>• <code className="text-[#FF6E17]">testimonials</code> (Client Feedback)</li>
                <li>• <code className="text-[#FF6E17]">faqs</code> (Accordion Q&A)</li>
                <li>• <code className="text-[#FF6E17]">inquiries</code> (Private Leads)</li>
                <li>• <code className="text-[#FF6E17]">subscribers</code> (Newsletter Opt-ins)</li>
                <li>• <code className="text-[#FF6E17]">adminUsers</code> (Role-based access)</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-white block">Environment Variable Template (.env):</span>
              <pre className="p-4 rounded-xl bg-black/80 border border-white/10 text-neutral-300 font-mono text-[11px] overflow-x-auto">
{`VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"`}
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-neutral-300">
              <span className="font-bold text-white block">Security Rules Deployed:</span>
              <p className="text-[11px] text-neutral-400">
                Firestore rules are defined in <code className="text-[#FF6E17]">firestore.rules</code> with strict role-based access. Public visitors have read-only access to published projects/articles and create-only permission for inquiries and newsletter opt-ins with schema validation. Private inquiries, subscribers, and admin accounts cannot be read by public visitors.
              </p>
            </div>
          </LiquidGlass>
        </div>
      )}
    </div>
  );
};
