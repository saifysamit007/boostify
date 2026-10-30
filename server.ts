import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '30mb' }));

// Persistent server-side storage file on disk
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'boostify-store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getStoreData(): Record<string, any> {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[Boostify Store] Error reading server store:', err);
  }
  return {};
}

function saveStoreData(data: Record<string, any>): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Boostify Store] Error writing server store:', err);
    throw err;
  }
}

// In-memory rate limiting map for security
const ipAttempts = new Map<string, { count: number; lockoutUntil: number }>();

// 1. POST /api/auth/bootstrap
app.post('/api/auth/bootstrap', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const attemptRecord = ipAttempts.get(ip) || { count: 0, lockoutUntil: 0 };

  if (attemptRecord.lockoutUntil > now) {
    const secondsRemaining = Math.ceil((attemptRecord.lockoutUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many attempts. Cooldown active for ${secondsRemaining} seconds.`,
    });
  }

  const { code } = req.body;
  const validCode = process.env.ADMIN_BOOTSTRAP_CODE || 'saify2026';

  if (code && typeof code === 'string' && code.trim() === validCode) {
    ipAttempts.delete(ip);
    const token = 'boostify_srv_' + Buffer.from(Date.now() + ':' + Math.random()).toString('base64');
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

    console.log(`[Boostify Auth] Admin authenticated successfully from IP: ${ip}`);
    return res.json({
      success: true,
      token,
      role: 'superadmin',
      expiresAt,
    });
  } else {
    attemptRecord.count += 1;
    if (attemptRecord.count >= 5) {
      attemptRecord.lockoutUntil = now + 3 * 60 * 1000; // 3 minute cooldown
    }
    ipAttempts.set(ip, attemptRecord);

    console.warn(`[Boostify Auth] Failed access attempt ${attemptRecord.count} from IP: ${ip}`);
    return res.status(401).json({
      success: false,
      message: attemptRecord.count >= 5
        ? 'Too many failed attempts. Gateway locked for 3 minutes.'
        : `Invalid authorization credential. Attempt ${attemptRecord.count} of 5.`,
    });
  }
});

// 2. GET /api/content
app.get('/api/content', (_req, res) => {
  const store = getStoreData();
  res.json({ success: true, data: store });
});

// 3. POST /api/content/:collection
app.post('/api/content/:collection', (req, res) => {
  const { collection } = req.params;
  const payload = req.body;

  if (!collection) {
    return res.status(400).json({ success: false, message: 'Collection name is required.' });
  }

  // Ensure settings always has explicit fresh numeric updatedAt timestamp
  if (collection === 'settings' && payload && typeof payload === 'object') {
    payload.updatedAt = Date.now();
  }

  try {
    const store = getStoreData();
    store[collection] = payload;
    store.lastUpdated = new Date().toISOString();
    saveStoreData(store);

    console.log(`[Boostify Store] Collection '${collection}' persisted to server disk store.`);
    return res.json({ success: true, message: `Collection ${collection} updated successfully.`, data: payload });
  } catch (err: any) {
    console.error(`[Boostify Store] Failed to save collection '${collection}':`, err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error: Failed to persist data to server disk store.',
    });
  }
});

// 3.5. GET /api/images/optimize - High Performance Image Transformation & WebP Serving
app.get('/api/images/optimize', async (req, res) => {
  const imageUrl = req.query.url as string;
  const width = parseInt(req.query.w as string, 10) || 1200;
  const quality = parseInt(req.query.q as string, 10) || 80;
  const format = (req.query.fmt as string) || 'webp';

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    // 1. Direct CDN Redirections with native optimization flags
    if (imageUrl.includes('images.unsplash.com') || imageUrl.includes('unsplash.com')) {
      const u = new URL(imageUrl);
      u.searchParams.set('fm', format);
      u.searchParams.set('auto', 'format,compress');
      u.searchParams.set('w', width.toString());
      u.searchParams.set('q', quality.toString());
      u.searchParams.set('fit', 'crop');
      return res.redirect(302, u.toString());
    }

    if (imageUrl.includes('ik.imagekit.io')) {
      const u = new URL(imageUrl);
      u.searchParams.set('tr', `f-${format},w-${width},q-${quality}`);
      return res.redirect(302, u.toString());
    }

    // 2. Fetch external image and serve with long-term immutable cache
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch source image');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const buffer = await response.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.warn('[Boostify Image Optimizer] Proxy error for:', imageUrl, err);
    return res.redirect(302, imageUrl);
  }
});

// 4. GET /api/inquiries
app.get('/api/inquiries', (_req, res) => {
  const store = getStoreData();
  res.json({ success: true, data: store.inquiries || [] });
});

// 5. POST /api/inquiries
app.post('/api/inquiries', (req, res) => {
  const { name, email, company, services, brief, budgetRange, timeline, contactPreference, phone } = req.body;

  if (!name || !email || !brief || !services || !Array.isArray(services)) {
    return res.status(400).json({ success: false, message: 'Missing required inquiry parameters.' });
  }

  const store = getStoreData();
  const inquiries = store.inquiries || [];
  const inquiryId = 'inq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const newInquiry = {
    id: inquiryId,
    name,
    email,
    company: company || '',
    services,
    brief,
    budgetRange: budgetRange || '$1k - $3k',
    timeline: timeline || '2-4 weeks',
    contactPreference: contactPreference || 'email',
    phone: phone || '',
    status: 'new',
    adminNotes: '',
    createdAt: new Date().toISOString(),
  };

  inquiries.unshift(newInquiry);
  store.inquiries = inquiries;
  saveStoreData(store);

  console.log(`[Boostify Lead] New inquiry ${inquiryId} saved from ${name} (${email}) for: ${services.join(', ')}`);

  return res.json({
    success: true,
    id: inquiryId,
    inquiry: newInquiry,
    message: 'Inquiry processed and logged successfully.',
  });
});

// 6. PATCH /api/inquiries/:id
app.patch('/api/inquiries/:id', (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  const store = getStoreData();
  const inquiries = store.inquiries || [];
  const idx = inquiries.findIndex((inq: any) => inq.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  if (status) inquiries[idx].status = status;
  if (adminNotes !== undefined) inquiries[idx].adminNotes = adminNotes;
  store.inquiries = inquiries;
  saveStoreData(store);

  res.json({ success: true, data: inquiries[idx] });
});

// 7. GET /api/subscribers
app.get('/api/subscribers', (_req, res) => {
  const store = getStoreData();
  res.json({ success: true, data: store.subscribers || [] });
});

// 8. POST /api/subscribers
app.post('/api/subscribers', (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email required.' });
  }

  const store = getStoreData();
  const subscribers = store.subscribers || [];
  const normalized = email.toLowerCase().trim();

  if (subscribers.some((s: any) => s.email === normalized)) {
    return res.json({ success: true, message: 'You are already subscribed to Boostify Dispatches!' });
  }

  const newSub = {
    id: 'sub-' + Date.now(),
    email: normalized,
    subscribedAt: new Date().toISOString(),
  };
  subscribers.unshift(newSub);
  store.subscribers = subscribers;
  saveStoreData(store);

  res.json({ success: true, message: 'Welcome to Boostify Dispatches! You have been successfully subscribed.' });
});

// 9. Heuristic fallback for project description
function generateFallbackDescription(data: {
  title: string;
  category: string;
  deliverables?: string;
  clientChallenge?: string;
  outcome?: string;
}): string {
  const { title, category } = data;
  if (category === 'Web Design') {
    return `An immersive digital platform engineered for ${title}, fusing dark luxury aesthetics with high-performance responsive architecture. Built to amplify brand prestige and convert high-intent traffic into enduring client partnerships.`;
  }
  if (category === 'Branding') {
    return `A comprehensive brand identity system crafted for ${title}, articulating refined typography, distinctive visual assets, and cohesive design standards that position the business as an undeniable category leader.`;
  }
  if (category === 'Motion' || category === 'Video') {
    return `Cinematic visual storytelling and bespoke motion design developed for ${title}, capturing immediate audience engagement through fluid 3D pacing and seamless brand choreography.`;
  }
  if (category === 'Social Media' || category === 'Marketing') {
    return `A strategic growth ecosystem engineered for ${title}, harmonizing bold creative direction with conversion-optimized campaigns to expand market reach and accelerate client acquisition.`;
  }
  return `A tailor-made digital solution engineered for ${title}, integrating strategic design precision with fluid execution to elevate brand authority and deliver measurable commercial results.`;
}

// 10. POST /api/ai/generate-project-description
app.post('/api/ai/generate-project-description', async (req, res) => {
  const {
    title,
    category,
    year,
    clientChallenge,
    creativeStrategy,
    deliverables,
    outcome,
    metrics,
    liveUrl,
  } = req.body || {};

  const projectTitle = (title && typeof title === 'string' && title.trim()) ? title.trim() : 'Digital Showcase';
  const projectCategory = (category && typeof category === 'string' && category.trim()) ? category.trim() : 'Web Design';
  const delivList = Array.isArray(deliverables)
    ? deliverables.join(', ')
    : typeof deliverables === 'string'
    ? deliverables
    : '';

  // Prompt composition
  const details: string[] = [
    `Project Title: ${projectTitle}`,
    `Category: ${projectCategory}`,
  ];
  if (year) details.push(`Year: ${year}`);
  if (delivList) details.push(`Deliverables: ${delivList}`);
  if (clientChallenge) details.push(`Client Challenge: ${clientChallenge}`);
  if (creativeStrategy) details.push(`Creative Strategy: ${creativeStrategy}`);
  if (outcome) details.push(`Outcome: ${outcome}`);
  if (Array.isArray(metrics) && metrics.length > 0) {
    const metricsStr = metrics.map((m: any) => `${m.label || ''}: ${m.value || ''}`).filter((s: string) => s.length > 2).join(' | ');
    if (metricsStr) details.push(`Key Results / Metrics: ${metricsStr}`);
  }
  if (liveUrl) details.push(`Live Project Link: ${liveUrl}`);

  const prompt = `Analyze the following creative project details and write a high-impact, refined, and cinematic 2-sentence case-study summary (40 to 65 words) for the project card on Boostify's website:
${details.join('\n')}

Guidelines:
- Emphasize craft, digital excellence, and business transformation.
- Match Boostify's sleek, dark luxury aesthetic and confident tone.
- Output ONLY the 2-sentence description paragraph. Do not include quotes, markdown headers, or conversational intros.`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are the executive creative director and brand copywriter at Boostify, a premier digital growth agency in Dhaka. You write evocative, punchy, high-converting case-study summaries for creative projects. Return only the 2-sentence description.',
          temperature: 0.7,
        },
      });

      const generated = aiResponse.text?.trim();
      if (generated && generated.length > 20) {
        const cleaned = generated.replace(/^["']|["']$/g, '').trim();
        console.log(`[Boostify AI] Generated project description for "${projectTitle}" using gemini-3.8-flash`);
        return res.json({ success: true, description: cleaned, source: 'gemini' });
      }
    } else {
      console.warn('[Boostify AI] GEMINI_API_KEY not configured, using creative fallback generator.');
    }
  } catch (err: any) {
    console.warn('[Boostify AI] Gemini generation error, using fallback:', err?.message || err);
  }

  const fallback = generateFallbackDescription({
    title: projectTitle,
    category: projectCategory,
    deliverables: delivList,
    clientChallenge,
    outcome,
  });

  return res.json({ success: true, description: fallback, source: 'heuristic' });
});

// 11. GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agency: 'Boostify',
    location: '132, Gulshan 1, Dhaka 1212, Bangladesh',
  });
});

// Mount Vite in development or static dist in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Boostify Engine] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Boostify Engine] Fatal startup error:', err);
  process.exit(1);
});
