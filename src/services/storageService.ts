import type { Category, WebApp, AppFilter } from '../types/app';
import { INITIAL_CATEGORIES, INITIAL_APPS } from './seedData';

const APPS_STORAGE_KEY = 'difinest_web_apps_v2';
const CATEGORIES_STORAGE_KEY = 'difinest_categories_v2';
const FAVORITES_STORAGE_KEY = 'difinest_favorite_apps_v2';
const ADMIN_TOKEN_KEY = 'difinest_admin_token_v1';

export class StorageService {
  /**
   * Fetch categories from backend API if available, fallback to local storage / seed
   */
  public static async fetchCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // Backend not running or offline; fallback to local
    }
    return this.getCategories();
  }

  public static getCategories(): Category[] {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  public static addCategory(name: string, description: string): Category {
    const categories = this.getCategories();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    // Check if already exists
    const existing = categories.find(c => c.id === id);
    if (existing) return existing;

    const newCategory: Category = {
      id,
      name,
      description: description || `Custom category for ${name}`,
      iconName: 'Folder',
      isCustom: true
    };

    categories.push(newCategory);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));

    // Async sync to backend
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories)
    }).catch(() => {});

    return newCategory;
  }

  /**
   * Fetch apps from backend API if available, fallback to local storage / seed
   */
  public static async fetchApps(): Promise<WebApp[]> {
    try {
      const res = await fetch('/api/apps');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // Backend not running or offline; fallback to local
    }
    return this.getApps();
  }

  public static getApps(): WebApp[] {
    try {
      const stored = localStorage.getItem(APPS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(INITIAL_APPS));
        return INITIAL_APPS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_APPS;
    }
  }

  public static getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public static toggleFavorite(appId: string): boolean {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(appId);
    let isNowFavorite = false;

    if (index !== -1) {
      favorites.splice(index, 1);
      isNowFavorite = false;
    } else {
      favorites.push(appId);
      isNowFavorite = true;
    }

    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    return isNowFavorite;
  }

  public static isFavorite(appId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.includes(appId);
  }

  public static getAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  public static setAdminToken(token: string): void {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  public static clearAdminToken(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  public static getFilteredApps(filter: AppFilter): WebApp[] {
    let apps = this.getApps();
    const favorites = this.getFavorites();

    // Favorites only filter
    if (filter.onlyFavorites) {
      apps = apps.filter(app => favorites.includes(app.id));
    }

    // Category filter
    if (filter.category && filter.category !== 'all') {
      apps = apps.filter(app => app.category === filter.category);
    }

    // Search query filter (matches title, description, tags, author, category, slug)
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase().trim();
      apps = apps.filter(app => 
        app.name.toLowerCase().includes(query) ||
        (app.slug && app.slug.toLowerCase().includes(query)) ||
        app.description.toLowerCase().includes(query) ||
        app.author.toLowerCase().includes(query) ||
        app.tags.some(tag => tag.toLowerCase().includes(query)) ||
        app.category.toLowerCase().includes(query)
      );
    }

    // Specific tag filter
    if (filter.tag) {
      apps = apps.filter(app => app.tags.includes(filter.tag!));
    }

    // Sort by
    if (filter.sortBy === 'name') {
      apps.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filter.sortBy === 'views') {
      apps.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else {
      // default: recent (updatedAt descending)
      apps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return apps;
  }

  public static getAppById(id: string): WebApp | undefined {
    const apps = this.getApps();
    return apps.find(app => app.id === id);
  }

  public static getAppBySlugOrId(identifier: string): WebApp | undefined {
    if (!identifier) return undefined;
    const clean = identifier.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
    const apps = this.getApps();

    return apps.find(app => {
      if (app.slug && app.slug.toLowerCase() === clean) return true;
      if (app.id && app.id.toLowerCase() === clean) return true;
      
      // Also match normalized name (e.g. "dailyweather" matching "Daily Weather")
      const nameSlug = app.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanNoHyphen = clean.replace(/[^a-z0-9]/g, '');
      if (nameSlug && cleanNoHyphen && nameSlug === cleanNoHyphen) return true;

      const nameHyphenated = app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (nameHyphenated === clean) return true;

      return false;
    });
  }

  public static incrementViewCount(id: string): void {
    const apps = this.getApps();
    const app = apps.find(a => a.id === id);
    if (app) {
      app.viewCount = (app.viewCount || 0) + 1;
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
    }
  }

  public static saveApp(appData: Omit<WebApp, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): WebApp {
    const apps = this.getApps();
    const now = new Date().toISOString();

    // Generate clean slug if not specified or format it
    let slug = appData.slug ? appData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') : undefined;
    if (!slug) {
      slug = appData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    let updatedApp: WebApp;
    if (appData.id) {
      // Updating existing app
      const index = apps.findIndex(a => a.id === appData.id);
      if (index !== -1) {
        updatedApp = {
          ...apps[index],
          ...appData,
          slug,
          id: appData.id,
          updatedAt: now
        };
        apps[index] = updatedApp;
      } else {
        updatedApp = {
          ...appData,
          slug,
          id: appData.id,
          createdAt: now,
          updatedAt: now,
          viewCount: 0
        };
        apps.unshift(updatedApp);
      }
    } else {
      // Creating new app
      const newId = 'app-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
      updatedApp = {
        ...appData,
        slug,
        id: newId,
        createdAt: now,
        updatedAt: now,
        viewCount: 0
      };
      apps.unshift(updatedApp);
    }

    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));

    // Save to backend static files & disk database
    fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedApp)
    }).catch(() => {});

    return updatedApp;
  }

  public static duplicateApp(id: string): WebApp | undefined {
    const original = this.getAppById(id);
    if (!original) return undefined;

    const copyData = {
      name: `${original.name} (Copy)`,
      slug: `${original.slug || original.id}-copy`,
      description: original.description,
      category: original.category,
      tags: [...original.tags, 'cloned'],
      html: original.html,
      css: original.css,
      js: original.js,
      author: 'Admin (Fork)',
      thumbnailColor: original.thumbnailColor,
      customThumbnailUrl: original.customThumbnailUrl
    };

    return this.saveApp(copyData);
  }

  public static deleteApp(id: string): boolean {
    const apps = this.getApps();
    const filtered = apps.filter(a => a.id !== id);
    if (filtered.length !== apps.length) {
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(filtered));

      // Delete from backend disk storage
      fetch(`/api/apps/${id}`, {
        method: 'DELETE'
      }).catch(() => {});

      return true;
    }
    return false;
  }

  public static resetToDefaults(): void {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(INITIAL_APPS));
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  }

  public static exportDatabaseJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories: this.getCategories(),
      apps: this.getApps(),
      favorites: this.getFavorites()
    };
    return JSON.stringify(data, null, 2);
  }

  public static importDatabaseJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.apps)) {
        localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(parsed.apps));
        if (Array.isArray(parsed.categories)) {
          localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(parsed.categories));
        }
        if (Array.isArray(parsed.favorites)) {
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(parsed.favorites));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
