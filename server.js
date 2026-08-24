import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// Data directory for persistent static files and apps database
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const APPS_DIR = path.join(DATA_DIR, 'apps');
const DB_FILE = path.join(DATA_DIR, 'apps.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

// Ensure data folders exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(APPS_DIR)) fs.mkdirSync(APPS_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. Serve individual static files of each uploaded app directly at /apps/:appId/
app.use('/apps', express.static(APPS_DIR));

// Helper: Read apps from disk
function getStoredApps() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading apps.json:', err);
  }
  return [];
}

// Helper: Save apps to disk and write out their static index.html, style.css, script.js
function saveStoredApps(apps) {
  fs.writeFileSync(DB_FILE, JSON.stringify(apps, null, 2), 'utf-8');
}

// Helper: Write out physical static files for an app
function writeStaticAppFiles(appData) {
  const appFolder = path.join(APPS_DIR, appData.id);
  if (!fs.existsSync(appFolder)) {
    fs.mkdirSync(appFolder, { recursive: true });
  }

  // 1. Write standalone HTML bundle
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appData.name} - DifiNest</title>
  <style>
${appData.css || ''}
  </style>
</head>
<body>
${appData.html || ''}
  <script>
${appData.js || ''}
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(appFolder, 'index.html'), fullHtml, 'utf-8');
  fs.writeFileSync(path.join(appFolder, 'app.html'), appData.html || '', 'utf-8');
  fs.writeFileSync(path.join(appFolder, 'style.css'), appData.css || '', 'utf-8');
  fs.writeFileSync(path.join(appFolder, 'script.js'), appData.js || '', 'utf-8');
  fs.writeFileSync(path.join(appFolder, 'metadata.json'), JSON.stringify(appData, null, 2), 'utf-8');
}

// Helper: Delete physical static files of an app
function deleteStaticAppFiles(appId) {
  const appFolder = path.join(APPS_DIR, appId);
  if (fs.existsSync(appFolder)) {
    fs.rmSync(appFolder, { recursive: true, force: true });
  }
}

// --- REST APIs for Apps and Static Catalog ---

// GET all apps
app.get('/api/apps', (req, res) => {
  const apps = getStoredApps();
  res.json(apps);
});

// GET specific app by id or slug
app.get('/api/apps/:identifier', (req, res) => {
  const { identifier } = req.params;
  const clean = identifier.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
  const apps = getStoredApps();

  const found = apps.find(a => 
    (a.slug && a.slug.toLowerCase() === clean) ||
    (a.id && a.id.toLowerCase() === clean) ||
    (a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === clean)
  );

  if (found) {
    res.json(found);
  } else {
    res.status(404).json({ error: 'App not found' });
  }
});

// POST save / update app and generate static files on disk
app.post('/api/apps', (req, res) => {
  const appData = req.body;
  if (!appData.name) {
    return res.status(400).json({ error: 'Application name is required.' });
  }

  const apps = getStoredApps();
  const now = new Date().toISOString();

  let slug = appData.slug ? appData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') : undefined;
  if (!slug) {
    slug = appData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  let savedApp;
  if (appData.id) {
    // Update
    const idx = apps.findIndex(a => a.id === appData.id);
    if (idx !== -1) {
      savedApp = {
        ...apps[idx],
        ...appData,
        slug,
        id: appData.id,
        updatedAt: now
      };
      apps[idx] = savedApp;
    } else {
      savedApp = {
        ...appData,
        slug,
        id: appData.id,
        createdAt: now,
        updatedAt: now,
        viewCount: 0
      };
      apps.unshift(savedApp);
    }
  } else {
    // Create new
    const newId = 'app-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    savedApp = {
      ...appData,
      slug,
      id: newId,
      createdAt: now,
      updatedAt: now,
      viewCount: 0
    };
    apps.unshift(savedApp);
  }

  // 1. Write static files to /data/apps/<id>/ (index.html, style.css, script.js)
  writeStaticAppFiles(savedApp);

  // 2. Persist to apps.json
  saveStoredApps(apps);

  res.json({ success: true, app: savedApp });
});

// DELETE app and remove its physical static files
app.delete('/api/apps/:id', (req, res) => {
  const { id } = req.params;
  let apps = getStoredApps();
  const initialLen = apps.length;
  apps = apps.filter(a => a.id !== id);

  if (apps.length !== initialLen) {
    saveStoredApps(apps);
    deleteStaticAppFiles(id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'App not found' });
  }
});

// GET categories
app.get('/api/categories', (req, res) => {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      return res.json(JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8')));
    }
  } catch (err) {
    console.error('Error reading categories.json:', err);
  }
  res.json([]);
});

// POST save categories
app.post('/api/categories', (req, res) => {
  const categories = req.body;
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  res.json({ success: true, categories });
});

// Serve frontend UI build from /dist
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));

  // SPA fallback routing for deep links (e.g. /dailyweather)
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[DifiNest Server] Production server running on port ${PORT}`);
  console.log(`[DifiNest Server] Static apps directory: ${APPS_DIR}`);
});
