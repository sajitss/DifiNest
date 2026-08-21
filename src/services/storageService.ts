import type { Category, WebApp, AppFilter } from '../types/app';
import { INITIAL_CATEGORIES, INITIAL_APPS } from './seedData';

const APPS_STORAGE_KEY = 'difinest_web_apps_v1';
const CATEGORIES_STORAGE_KEY = 'difinest_categories_v1';

export class StorageService {
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
    return newCategory;
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

  public static getFilteredApps(filter: AppFilter): WebApp[] {
    let apps = this.getApps();

    // Category filter
    if (filter.category && filter.category !== 'all') {
      apps = apps.filter(app => app.category === filter.category);
    }

    // Search query filter (matches title, description, tags, author, category)
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase().trim();
      apps = apps.filter(app => 
        app.name.toLowerCase().includes(query) ||
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

    if (appData.id) {
      // Updating existing app
      const index = apps.findIndex(a => a.id === appData.id);
      if (index !== -1) {
        const updatedApp: WebApp = {
          ...apps[index],
          ...appData,
          id: appData.id,
          updatedAt: now
        };
        apps[index] = updatedApp;
        localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
        return updatedApp;
      }
    }

    // Creating new app
    const newId = 'app-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const newApp: WebApp = {
      ...appData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      viewCount: 0
    };

    apps.unshift(newApp);
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
    return newApp;
  }

  public static duplicateApp(id: string): WebApp | undefined {
    const original = this.getAppById(id);
    if (!original) return undefined;

    const copyData = {
      name: `${original.name} (Copy)`,
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
      return true;
    }
    return false;
  }

  public static resetToDefaults(): void {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(INITIAL_APPS));
  }

  public static exportDatabaseJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories: this.getCategories(),
      apps: this.getApps()
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
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
