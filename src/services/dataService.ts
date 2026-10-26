import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Firestore 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

import firebaseAppletConfig from '../../firebase-applet-config.json';

import {
  SiteSettings,
  Service,
  Project,
  PricingPackage,
  BlogPost,
  Testimonial,
  FAQ,
  Inquiry,
  Subscriber
} from '../types';

import {
  initialSiteSettings,
  initialServices,
  initialProjects,
  initialPackages,
  initialBlogPosts,
  initialTestimonials,
  initialFAQs
} from '../data/initialData';

// Local Storage Keys for fast caching & offline availability
const STORAGE_KEYS = {
  SETTINGS: 'boostify_site_settings',
  SERVICES: 'boostify_services',
  PROJECTS: 'boostify_projects',
  PACKAGES: 'boostify_packages',
  BLOG_POSTS: 'boostify_blog_posts',
  TESTIMONIALS: 'boostify_testimonials',
  FAQS: 'boostify_faqs',
  INQUIRIES: 'boostify_inquiries',
  SUBSCRIBERS: 'boostify_subscribers',
  ADMIN_SESSION: 'boostify_admin_session',
  DELETED_PROJECTS: 'boostify_deleted_project_ids',
};

// Merged Active Firebase Configuration
const activeFirebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: firebaseAppletConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: firebaseAppletConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: firebaseAppletConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: firebaseAppletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseAppletConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId || '',
};

export const isFirebaseConfigured = Boolean(
  activeFirebaseConfig.apiKey && 
  activeFirebaseConfig.projectId && 
  activeFirebaseConfig.apiKey !== ''
);

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(activeFirebaseConfig);
    db = activeFirebaseConfig.firestoreDatabaseId
      ? getFirestore(firebaseApp, activeFirebaseConfig.firestoreDatabaseId)
      : getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    console.log('[Boostify] Cloud Firestore connected successfully with Database:', activeFirebaseConfig.firestoreDatabaseId || 'default');
  } catch (err) {
    console.warn('[Boostify] Firebase initialization failed, falling back to server API:', err);
  }
}

export { firebaseApp, db, auth };

// Helper to read local storage with fallback
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('[Boostify] Error saving to localStorage:', err);
  }
}

// Synchronize changes to server disk store
async function syncToServer(collection: string, payload: any): Promise<void> {
  try {
    await fetch(`/api/content/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn('[Boostify] Server sync warning for', collection, e);
  }
}

// Fetch from server disk store
async function fetchFromServer<T>(collection: string): Promise<T | null> {
  try {
    const res = await fetch('/api/content');
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data[collection] !== undefined) {
        return json.data[collection] as T;
      }
    }
  } catch {
    // fallback
  }
  return null;
}

// ---------------- SITE SETTINGS ----------------
export async function fetchSiteSettings(): Promise<SiteSettings> {
  // 1. Check cached local storage item
  const localItem = getLocalItem<SiteSettings | null>(STORAGE_KEYS.SETTINGS, null);

  // 2. Check server disk store
  const serverItem = await fetchFromServer<SiteSettings>('settings');

  let newestLocalOrServer: SiteSettings | null = null;
  if (localItem && serverItem) {
    const localTime = localItem.updatedAt || 0;
    const serverTime = serverItem.updatedAt || 0;
    newestLocalOrServer = localTime >= serverTime ? localItem : serverItem;
  } else {
    newestLocalOrServer = localItem || serverItem;
  }

  // 3. Check Cloud Firestore
  let firestoreData: SiteSettings | null = null;
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'siteSettings', 'main'));
      if (snap.exists()) {
        firestoreData = snap.data() as SiteSettings;
      }
    } catch {
      // Quietly fall back
    }
  }

  // Pick freshest version based on updatedAt timestamps
  // If local or server was recently modified and Firestore is unversioned or older,
  // we strictly preserve local/server so admin changes never reset!
  let chosen: SiteSettings = initialSiteSettings;
  if (newestLocalOrServer && firestoreData) {
    const localTime = newestLocalOrServer.updatedAt || 0;
    const firestoreTime = firestoreData.updatedAt || 0;
    chosen = localTime >= firestoreTime ? newestLocalOrServer : firestoreData;
  } else if (newestLocalOrServer) {
    chosen = newestLocalOrServer;
  } else if (firestoreData) {
    chosen = firestoreData;
  }

  const finalMerged: SiteSettings = {
    ...initialSiteSettings,
    ...chosen,
    hero: {
      ...initialSiteSettings.hero,
      ...(chosen.hero || {})
    },
    seo: {
      ...initialSiteSettings.seo,
      ...(chosen.seo || {})
    },
    projectCategoryVisibility: {
      ...initialSiteSettings.projectCategoryVisibility,
      ...(chosen.projectCategoryVisibility || {})
    }
  };

  setLocalItem(STORAGE_KEYS.SETTINGS, finalMerged);
  return finalMerged;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const withTimestamp: SiteSettings = {
    ...settings,
    updatedAt: settings.updatedAt || Date.now(),
  };

  // 1. Update local cache immediately
  setLocalItem(STORAGE_KEYS.SETTINGS, withTimestamp);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('boostify_settings_updated', { detail: withTimestamp }));
  }

  // 2. Sync to server disk store (persists across all devices worldwide)
  await syncToServer('settings', withTimestamp);

  // 3. Save to Cloud Firestore if authenticated
  if (db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'siteSettings', 'main'), withTimestamp);
    } catch {
      // Server disk store and local cache already updated
    }
  }
}

// ---------------- SERVICES ----------------
export async function fetchServices(): Promise<Service[]> {
  // 1. Try Cloud Firestore (Read-only)
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'services'));
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service))
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setLocalItem(STORAGE_KEYS.SERVICES, data);
        return data;
      }
    } catch {
      // Quietly fall back if collection is empty or not yet populated
    }
  }

  // 2. Try Server Disk Store
  const serverData = await fetchFromServer<Service[]>('services');
  if (serverData && Array.isArray(serverData) && serverData.length > 0) {
    setLocalItem(STORAGE_KEYS.SERVICES, serverData);
    return serverData.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  // 3. Fallback to localStorage / initial defaults
  const local = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  return local.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveService(service: Service): Promise<void> {
  const current = await fetchServices();
  const exists = current.some(s => s.id === service.id);
  const updated = exists ? current.map(s => s.id === service.id ? service : s) : [...current, service];

  setLocalItem(STORAGE_KEYS.SERVICES, updated);
  await syncToServer('services', updated);

  if (db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'services', service.id), service);
    } catch {
      // Handled
    }
  }
}

export async function deleteService(serviceId: string): Promise<void> {
  const current = await fetchServices();
  const updated = current.filter(s => s.id !== serviceId);

  setLocalItem(STORAGE_KEYS.SERVICES, updated);
  await syncToServer('services', updated);

  if (db && auth?.currentUser) {
    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch {
      // Handled
    }
  }
}

// ---------------- PROJECTS / WORK ----------------
export function getDeletedProjectIds(): string[] {
  return getLocalItem<string[]>(STORAGE_KEYS.DELETED_PROJECTS, []);
}

function filterOutDeletedProjects(projectsList: Project[]): Project[] {
  const deletedIds = getDeletedProjectIds();
  if (!deletedIds || deletedIds.length === 0) return projectsList;
  return projectsList.filter(p => !deletedIds.includes(p.id));
}

export async function fetchProjects(): Promise<Project[]> {
  // 1. Try Server Disk Store first (Authoritative source for dashboard and public views)
  const serverData = await fetchFromServer<Project[]>('projects');
  if (serverData && Array.isArray(serverData)) {
    const validProjects = filterOutDeletedProjects(serverData);
    setLocalItem(STORAGE_KEYS.PROJECTS, validProjects);
    return validProjects;
  }

  // 2. Try Cloud Firestore (Read-only)
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'projects'));
      if (!snap.empty) {
        const firestoreData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        const validProjects = filterOutDeletedProjects(firestoreData);
        setLocalItem(STORAGE_KEYS.PROJECTS, validProjects);
        return validProjects;
      }
    } catch {
      // Quietly fall back
    }
  }

  // 3. Fallback to localStorage / initial
  const stored = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  const validProjects = filterOutDeletedProjects(stored);
  return validProjects;
}

export async function generateProjectDescription(project: Partial<Project>): Promise<string> {
  try {
    const res = await fetch('/api/ai/generate-project-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.description) {
        return data.description.trim();
      }
    }
  } catch (err) {
    console.warn('[Boostify] Error generating AI project description:', err);
  }

  const title = project.title || 'Digital Initiative';
  const category = project.category || 'Web Design';
  if (category === 'Web Design') {
    return `An immersive digital platform engineered for ${title}, fusing dark luxury aesthetics with high-performance responsive architecture to amplify brand prestige.`;
  }
  if (category === 'Branding') {
    return `A comprehensive brand identity system crafted for ${title}, articulating refined typography, distinctive visual assets, and cohesive design standards.`;
  }
  if (category === 'Motion' || category === 'Video') {
    return `Cinematic visual storytelling and bespoke motion design developed for ${title}, capturing immediate audience engagement through fluid pacing.`;
  }
  return `A tailor-made digital solution engineered for ${title}, integrating strategic design precision with fluid execution to elevate brand authority.`;
}

export async function saveProject(project: Project): Promise<void> {
  // If summary is empty or whitespace, automatically analyze fields & generate with AI
  if (!project.summary || !project.summary.trim()) {
    try {
      project.summary = await generateProjectDescription(project);
    } catch {
      // Fallback ensured inside generateProjectDescription
    }
  }

  // If this project was previously deleted, revive it by removing from deleted IDs
  const deletedIds = getDeletedProjectIds();
  if (deletedIds.includes(project.id)) {
    const updatedDeleted = deletedIds.filter(id => id !== project.id);
    setLocalItem(STORAGE_KEYS.DELETED_PROJECTS, updatedDeleted);
    await syncToServer('deleted_project_ids', updatedDeleted);
  }

  const current = await fetchProjects();
  const exists = current.some(p => p.id === project.id);
  const updated = exists ? current.map(p => p.id === project.id ? project : p) : [...current, project];

  setLocalItem(STORAGE_KEYS.PROJECTS, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('boostify_projects_updated', { detail: updated }));
  }
  await syncToServer('projects', updated);

  if (db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'projects', project.id), project);
    } catch {
      // Handled
    }
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  // 1. Permanently register in deleted IDs so it is never revived from cache or default lists
  const deletedIds = getDeletedProjectIds();
  if (!deletedIds.includes(projectId)) {
    const updatedDeleted = [...deletedIds, projectId];
    setLocalItem(STORAGE_KEYS.DELETED_PROJECTS, updatedDeleted);
    await syncToServer('deleted_project_ids', updatedDeleted);
  }

  // 2. Fetch and filter current projects
  const current = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  const updated = current.filter(p => p.id !== projectId);

  // 3. Update localStorage cache immediately
  setLocalItem(STORAGE_KEYS.PROJECTS, updated);

  // 4. Dispatch instant reactive event across the entire app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('boostify_projects_updated', { detail: updated }));
  }

  // 5. Persist to server disk store
  await syncToServer('projects', updated);

  // 6. Delete from Cloud Firestore if available
  if (db) {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (err) {
      console.warn('[Boostify] Firestore project deletion handled silently:', err);
    }
  }
}

// ---------------- PRICING PACKAGES ----------------
export async function fetchPackages(): Promise<PricingPackage[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'pricingPackages'));
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PricingPackage))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setLocalItem(STORAGE_KEYS.PACKAGES, data);
        return data;
      }
    } catch {
      // Quietly fall back
    }
  }

  const serverData = await fetchFromServer<PricingPackage[]>('packages');
  if (serverData && Array.isArray(serverData) && serverData.length > 0) {
    setLocalItem(STORAGE_KEYS.PACKAGES, serverData);
    return serverData.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return getLocalItem<PricingPackage[]>(STORAGE_KEYS.PACKAGES, initialPackages)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function savePackage(pkg: PricingPackage): Promise<void> {
  const current = await fetchPackages();
  const exists = current.some(p => p.id === pkg.id);
  const updated = exists ? current.map(p => p.id === pkg.id ? pkg : p) : [...current, pkg];

  setLocalItem(STORAGE_KEYS.PACKAGES, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('boostify_packages_updated', { detail: updated }));
  }
  await syncToServer('packages', updated);

  if (db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'pricingPackages', pkg.id), pkg);
    } catch {
      // Handled
    }
  }
}

export async function deletePackage(packageId: string): Promise<void> {
  const current = await fetchPackages();
  const updated = current.filter(p => p.id !== packageId);

  setLocalItem(STORAGE_KEYS.PACKAGES, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('boostify_packages_updated', { detail: updated }));
  }
  await syncToServer('packages', updated);

  if (db && auth?.currentUser) {
    try {
      await deleteDoc(doc(db, 'pricingPackages', packageId));
    } catch {
      // Handled
    }
  }
}

// ---------------- BLOG POSTS / ARTICLES ----------------
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'blogPosts'));
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
        setLocalItem(STORAGE_KEYS.BLOG_POSTS, data);
        return data;
      }
    } catch {
      // Quietly fall back
    }
  }

  const serverData = await fetchFromServer<BlogPost[]>('blogPosts');
  if (serverData && Array.isArray(serverData) && serverData.length > 0) {
    setLocalItem(STORAGE_KEYS.BLOG_POSTS, serverData);
    return serverData;
  }

  return getLocalItem<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, initialBlogPosts);
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
  const current = await fetchBlogPosts();
  const exists = current.some(p => p.id === post.id);
  const updated = exists ? current.map(p => p.id === post.id ? post : p) : [...current, post];

  setLocalItem(STORAGE_KEYS.BLOG_POSTS, updated);
  await syncToServer('blogPosts', updated);

  if (db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'blogPosts', post.id), post);
    } catch {
      // Handled
    }
  }
}

export async function deleteBlogPost(postId: string): Promise<void> {
  const current = await fetchBlogPosts();
  const updated = current.filter(p => p.id !== postId);

  setLocalItem(STORAGE_KEYS.BLOG_POSTS, updated);
  await syncToServer('blogPosts', updated);

  if (db && auth?.currentUser) {
    try {
      await deleteDoc(doc(db, 'blogPosts', postId));
    } catch {
      // Handled
    }
  }
}

// ---------------- TESTIMONIALS ----------------
export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'testimonials'));
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial));
        setLocalItem(STORAGE_KEYS.TESTIMONIALS, data);
        return data;
      }
    } catch {
      // Quietly fall back
    }
  }

  const serverData = await fetchFromServer<Testimonial[]>('testimonials');
  if (serverData && Array.isArray(serverData)) {
    setLocalItem(STORAGE_KEYS.TESTIMONIALS, serverData);
    return serverData;
  }

  const stored = getLocalItem<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, initialTestimonials);
  return stored;
}

export async function saveTestimonial(testimonial: Testimonial): Promise<void> {
  const current = await fetchTestimonials();
  const exists = current.some(t => t.id === testimonial.id);
  const updated = exists ? current.map(t => t.id === testimonial.id ? testimonial : t) : [testimonial, ...current];

  setLocalItem(STORAGE_KEYS.TESTIMONIALS, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('boostify_testimonials_updated', { detail: updated }));
  }
  await syncToServer('testimonials', updated);

  if (db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'testimonials', testimonial.id), testimonial);
    } catch {
      // Handled
    }
  }
}

export async function deleteTestimonial(testimonialId: string): Promise<void> {
  const current = await fetchTestimonials();
  const updated = current.filter(t => t.id !== testimonialId);

  setLocalItem(STORAGE_KEYS.TESTIMONIALS, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('boostify_testimonials_updated', { detail: updated }));
  }
  await syncToServer('testimonials', updated);

  if (db && auth?.currentUser) {
    try {
      await deleteDoc(doc(db, 'testimonials', testimonialId));
    } catch {
      // Handled
    }
  }
}

// ---------------- FAQS ----------------
export async function fetchFAQs(): Promise<FAQ[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'faqs'));
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as FAQ));
        setLocalItem(STORAGE_KEYS.FAQS, data);
        return data;
      }
    } catch {
      // Quietly fall back
    }
  }

  const serverData = await fetchFromServer<FAQ[]>('faqs');
  if (serverData && Array.isArray(serverData) && serverData.length > 0) {
    setLocalItem(STORAGE_KEYS.FAQS, serverData);
    return serverData;
  }

  return getLocalItem<FAQ[]>(STORAGE_KEYS.FAQS, initialFAQs);
}

export async function saveFAQ(faq: FAQ): Promise<void> {
  const current = await fetchFAQs();
  const exists = current.some(f => f.id === faq.id);
  const updated = exists ? current.map(f => f.id === faq.id ? faq : f) : [...current, faq];

  setLocalItem(STORAGE_KEYS.FAQS, updated);
  await syncToServer('faqs', updated);

  if (db && auth?.currentUser) {
    try {
      await setDoc(doc(db, 'faqs', faq.id), faq);
    } catch {
      // Handled
    }
  }
}

// ---------------- INQUIRIES (SUBMISSIONS & MANAGEMENT) ----------------
export async function submitInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const id = 'inq-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const newInquiry: Inquiry = {
      ...inquiryData,
      id,
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    // Save to local storage
    const current = getLocalItem<Inquiry[]>(STORAGE_KEYS.INQUIRIES, []);
    setLocalItem(STORAGE_KEYS.INQUIRIES, [newInquiry, ...current]);

    // Save to server database API
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryData),
      });
    } catch (err) {
      console.warn('[Boostify] Server inquiry sync warning:', err);
    }

    // Save to Cloud Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'inquiries', id), newInquiry);
      } catch {
        // Silently handled; server store & local cache are already committed
      }
    }

    return { success: true, id };
  } catch (err) {
    return { success: false, id: '', error: (err as Error).message };
  }
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  // 1. Try Cloud Firestore if user is authenticated in Firebase
  if (db && auth?.currentUser) {
    try {
      const snap = await getDocs(collection(db, 'inquiries'));
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Inquiry))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLocalItem(STORAGE_KEYS.INQUIRIES, data);
        return data;
      }
    } catch {
      // Quietly fall back to server API
    }
  }

  // 2. Try Server API
  try {
    const res = await fetch('/api/inquiries');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        setLocalItem(STORAGE_KEYS.INQUIRIES, json.data);
        return json.data;
      }
    }
  } catch {
    // fallback
  }

  return getLocalItem<Inquiry[]>(STORAGE_KEYS.INQUIRIES, []);
}

export async function updateInquiryStatus(
  inquiryId: string, 
  status: Inquiry['status'], 
  adminNotes?: string
): Promise<void> {
  const current = await fetchInquiries();
  const updated = current.map(item => {
    if (item.id === inquiryId) {
      return {
        ...item,
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {})
      };
    }
    return item;
  });
  setLocalItem(STORAGE_KEYS.INQUIRIES, updated);

  try {
    await fetch(`/api/inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
  } catch {
    // Quiet fallback
  }

  if (db && auth?.currentUser) {
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {})
      });
    } catch {
      // Handled
    }
  }
}

// ---------------- NEWSLETTER SUBSCRIBERS ----------------
export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const normalized = email.trim().toLowerCase();
  const current = getLocalItem<Subscriber[]>(STORAGE_KEYS.SUBSCRIBERS, []);
  
  if (current.some(s => s.email === normalized)) {
    return { success: true, message: 'You are already subscribed to Boostify updates.' };
  }

  const subId = 'sub-' + Date.now();
  const newSub: Subscriber = {
    id: subId,
    email: normalized,
    createdAt: new Date().toISOString(),
    source: 'website_footer',
    status: 'active',
    consent: true,
  };

  setLocalItem(STORAGE_KEYS.SUBSCRIBERS, [...current, newSub]);

  try {
    await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized }),
    });
  } catch {
    // Handled
  }

  if (db) {
    try {
      await setDoc(doc(db, 'subscribers', subId), {
        id: subId,
        email: normalized,
        subscribedAt: newSub.createdAt,
        createdAt: newSub.createdAt,
        source: 'website_footer',
        status: 'active',
        consent: true,
      });
    } catch {
      // Silently handled; server store & local cache are already committed
    }
  }

  return { success: true, message: 'Thank you for subscribing to Boostify insights.' };
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  // 1. Try Cloud Firestore if user is authenticated in Firebase
  if (db && auth?.currentUser) {
    try {
      const snap = await getDocs(collection(db, 'subscribers'));
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscriber));
        setLocalItem(STORAGE_KEYS.SUBSCRIBERS, data);
        return data;
      }
    } catch {
      // Quietly fall back to server API
    }
  }

  // 2. Try Server API
  try {
    const res = await fetch('/api/subscribers');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        setLocalItem(STORAGE_KEYS.SUBSCRIBERS, json.data);
        return json.data;
      }
    }
  } catch {
    // fallback
  }

  return getLocalItem<Subscriber[]>(STORAGE_KEYS.SUBSCRIBERS, []);
}

// ---------------- ADMIN FIRESTORE CLOUD SYNC ----------------
export async function syncAllToFirestore(): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: 'Cloud Firestore is not initialized.' };
  }
  if (!auth?.currentUser) {
    return {
      success: false,
      message: 'Please sign in with your authorized Google Admin account before synchronizing data to Cloud Firestore.',
    };
  }
  try {
    const settings = await fetchSiteSettings();
    await setDoc(doc(db, 'siteSettings', 'main'), settings);

    const services = await fetchServices();
    for (const s of services) {
      await setDoc(doc(db, 'services', s.id), s);
    }

    const projects = await fetchProjects();
    for (const p of projects) {
      await setDoc(doc(db, 'projects', p.id), p);
    }

    const packages = await fetchPackages();
    for (const pkg of packages) {
      await setDoc(doc(db, 'pricingPackages', pkg.id), pkg);
    }

    const posts = await fetchBlogPosts();
    for (const post of posts) {
      await setDoc(doc(db, 'blogPosts', post.id), post);
    }

    const testimonials = await fetchTestimonials();
    for (const t of testimonials) {
      await setDoc(doc(db, 'testimonials', t.id), t);
    }

    const faqs = await fetchFAQs();
    for (const f of faqs) {
      await setDoc(doc(db, 'faqs', f.id), f);
    }

    return { success: true, message: 'All collections successfully synchronized with Cloud Firestore.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to sync to Cloud Firestore.' };
  }
}

