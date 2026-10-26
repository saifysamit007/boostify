import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CookieConsent } from './components/ui/CookieConsent';
import { AdminAccessModal } from './components/ui/AdminAccessModal';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollProgressBar } from './components/ui/ScrollReveal';

// Pages
import { HomePage } from './pages/HomePage';
import { WorkPage, ProjectDetailPage } from './pages/WorkPage';
import { ServicesPage, ServiceDetailPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ProcessPage } from './pages/ProcessPage';
import { InsightsPage, ArticleDetailPage } from './pages/InsightsPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage, TermsPage, CookiePolicyPage } from './pages/LegalPages';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginCard } from './components/ui/AdminLoginCard';

// Data services & initial state
import {
  fetchSiteSettings,
  fetchServices,
  fetchProjects,
  fetchPackages,
  fetchBlogPosts,
  fetchTestimonials,
  fetchFAQs,
} from './services/dataService';
import {
  initialSiteSettings,
  initialServices,
  initialProjects,
  initialPackages,
  initialBlogPosts,
  initialTestimonials,
  initialFAQs,
} from './data/initialData';
import {
  SiteSettings,
  Service,
  Project,
  PricingPackage,
  BlogPost,
  Testimonial,
  FAQ,
} from './types';

const AppContent: React.FC = () => {
  const { isAdmin, openAccessModal } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  });

  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [packages, setPackages] = useState<PricingPackage[]>(initialPackages);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [faqs, setFaqs] = useState<FAQ[]>(initialFAQs);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentRoute(hash || '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load live data from Firestore / local persistence
  const loadAllData = async () => {
    try {
      setIsLoadingData(true);
      const [
        fetchedSettings,
        fetchedServices,
        fetchedProjects,
        fetchedPackages,
        fetchedBlogPosts,
        fetchedTestimonials,
        fetchedFaqs,
      ] = await Promise.all([
        fetchSiteSettings(),
        fetchServices(),
        fetchProjects(),
        fetchPackages(),
        fetchBlogPosts(),
        fetchTestimonials(),
        fetchFAQs(),
      ]);

      setSettings(fetchedSettings);
      setServices(fetchedServices);
      setProjects(fetchedProjects);
      setPackages(fetchedPackages);
      setBlogPosts(fetchedBlogPosts);
      setTestimonials(fetchedTestimonials);
      setFaqs(fetchedFaqs);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleProjectsUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProjects(e.detail);
      }
    };
    const handleTestimonialsUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTestimonials(e.detail);
      }
    };
    const handlePackagesUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setPackages(e.detail);
      }
    };
    const handleSettingsUpdated = (e: any) => {
      if (e.detail && typeof e.detail === 'object') {
        setSettings(e.detail);
      }
    };
    window.addEventListener('boostify_projects_updated', handleProjectsUpdated);
    window.addEventListener('boostify_testimonials_updated', handleTestimonialsUpdated);
    window.addEventListener('boostify_packages_updated', handlePackagesUpdated);
    window.addEventListener('boostify_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('boostify_projects_updated', handleProjectsUpdated);
      window.removeEventListener('boostify_testimonials_updated', handleTestimonialsUpdated);
      window.removeEventListener('boostify_packages_updated', handlePackagesUpdated);
      window.removeEventListener('boostify_settings_updated', handleSettingsUpdated);
    };
  }, []);

  // Dynamically update document title, meta tags, and open graph when settings change
  useEffect(() => {
    if (!settings) return;

    const seoTitle = settings.seo?.title || settings.brandName || 'Boostify — Creative Digital Agency';
    const seoDescription = settings.seo?.description || 'World-class digital growth and creative agency in Dhaka, Bangladesh specializing in Website Design, UI/UX, Motion Graphics, Video Production, and Digital Marketing.';
    const ogImage = settings.seo?.ogImageUrl || settings.logoUrl || 'https://ik.imagekit.io/pc5amjyab/boostify-logo-02.png';

    // 1. Document Title
    document.title = seoTitle;

    // 2. Helper to set or create meta tags
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}='${attrVal}']`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Standard meta tags
    setMetaTag('name', 'description', seoDescription);
    if (settings.seo?.keywords && settings.seo.keywords.length > 0) {
      setMetaTag('name', 'keywords', settings.seo.keywords.join(', '));
    }

    // OpenGraph tags
    setMetaTag('property', 'og:title', seoTitle);
    setMetaTag('property', 'og:description', seoDescription);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', settings.brandName || 'Boostify');

    // Twitter Card tags
    setMetaTag('name', 'twitter:title', seoTitle);
    setMetaTag('name', 'twitter:description', seoDescription);
    setMetaTag('name', 'twitter:image', ogImage);

    // Dynamic canonical link
    if (settings.seo?.canonicalUrl) {
      let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = settings.seo.canonicalUrl;
    }
  }, [settings?.seo, settings?.brandName, settings?.logoUrl]);

  // Dynamically update document favicon when settings change
  useEffect(() => {
    if (settings?.faviconUrl) {
      // Standard favicon
      let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.faviconUrl;

      // Apple touch icon
      let appleIconLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
      if (!appleIconLink) {
        appleIconLink = document.createElement('link');
        appleIconLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleIconLink);
      }
      appleIconLink.href = settings.faviconUrl;
    }
  }, [settings?.faviconUrl]);

  const navigateTo = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
  };

  // Route Dispatcher
  const renderCurrentView = () => {
    // Clean normalized route
    const path = currentRoute.split('?')[0];

    // Admin Route Protection
    if (path === '/admin') {
      if (isAdmin) {
        return (
          <AdminDashboard
            settings={settings}
            services={services}
            projects={projects}
            packages={packages}
            blogPosts={blogPosts}
            testimonials={testimonials}
            onRefreshData={loadAllData}
            onNavigate={navigateTo}
          />
        );
      } else {
        // Direct password entry on /admin route
        return <AdminLoginCard onSuccess={() => navigateTo('/admin')} />;
      }
    }

    // Case Study Detail Route: /work/:slug
    if (path.startsWith('/work/')) {
      const slug = path.replace('/work/', '');
      return <ProjectDetailPage slug={slug} projects={projects} onNavigate={navigateTo} />;
    }

    // Service Detail Route: /services/:slug
    if (path.startsWith('/services/')) {
      const slug = path.replace('/services/', '');
      return <ServiceDetailPage slug={slug} services={services} onNavigate={navigateTo} />;
    }

    // Article Detail Route: /insights/:slug
    if (path.startsWith('/insights/')) {
      const slug = path.replace('/insights/', '');
      return <ArticleDetailPage slug={slug} posts={blogPosts} onNavigate={navigateTo} />;
    }

    // Root and Static Routes
    switch (path) {
      case '/':
        return (
          <HomePage
            settings={settings}
            services={services}
            projects={projects}
            packages={packages}
            blogPosts={blogPosts}
            testimonials={testimonials}
            faqs={faqs}
            isLoading={isLoadingData}
            onNavigate={navigateTo}
          />
        );
      case '/work':
        return <WorkPage projects={projects} settings={settings} isLoading={isLoadingData} onNavigate={navigateTo} />;
      case '/services':
        return <ServicesPage services={services} onNavigate={navigateTo} />;
      case '/about':
        return <AboutPage onNavigate={navigateTo} />;
      case '/process':
        return <ProcessPage onNavigate={navigateTo} />;
      case '/insights':
        return <InsightsPage posts={blogPosts} isLoading={isLoadingData} onNavigate={navigateTo} />;
      case '/contact':
        return <ContactPage />;
      case '/privacy':
        return <PrivacyPage onNavigate={navigateTo} />;
      case '/terms':
        return <TermsPage onNavigate={navigateTo} />;
      case '/cookie-policy':
        return <CookiePolicyPage onNavigate={navigateTo} />;
      default:
        return <NotFoundPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F7F7F7] relative selection:bg-[#FF6E17] selection:text-white">
      {/* Scroll Progress Bar at the very top */}
      <ScrollProgressBar />

      {/* Unified Navigation with Top Announcement Bar (zero overlap) */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        logoUrl={settings.logoUrl}
        announcement={settings.announcement}
      />

      {/* Main Page Content with Framer Motion Route Transition */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute.split('?')[0]}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full flex-1"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer on public views */}
      {currentRoute !== '/admin' && (
        <Footer onNavigate={navigateTo} logoUrl={settings.logoUrl} />
      )}

      {/* Cookie Consent Manager */}
      <CookieConsent />

      {/* Hidden Keyboard Shortcut Access Dialog (Ctrl+Shift+A then B) */}
      <AdminAccessModal onNavigateToAdmin={() => navigateTo('/admin')} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
