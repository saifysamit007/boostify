import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initialSiteSettings,
  initialServices,
  initialProjects,
  initialPackages,
  initialBlogPosts,
  initialTestimonials,
  initialFAQs
} from '../src/data/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const STORE_FILE = path.resolve(DATA_DIR, 'boostify-store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let existing: Record<string, any> = {};
if (fs.existsSync(STORE_FILE)) {
  try {
    existing = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch {}
}

const store = {
  settings: existing.settings || initialSiteSettings,
  services: existing.services || initialServices,
  projects: existing.projects || initialProjects,
  packages: existing.packages || initialPackages,
  blogPosts: existing.blogPosts || initialBlogPosts,
  testimonials: existing.testimonials || initialTestimonials,
  faqs: existing.faqs || initialFAQs,
  inquiries: existing.inquiries || [],
  subscribers: existing.subscribers || [],
  lastUpdated: new Date().toISOString()
};

fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
console.log('Seeded /data/boostify-store.json successfully!');
