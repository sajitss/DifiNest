export type CategoryId = 'all' | 'ui-components' | 'games-canvas' | 'dashboards' | 'utilities' | 'css-art' | string;

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string;
  isCustom?: boolean;
}

export interface WebApp {
  id: string;
  slug?: string;
  name: string;
  description: string;
  category: CategoryId;
  tags: string[];
  html: string;
  css: string;
  js: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  viewCount?: number;
  thumbnailColor?: string;
  customThumbnailUrl?: string;
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

export interface AppFilter {
  searchQuery: string;
  category: CategoryId;
  tag?: string;
  sortBy: 'recent' | 'name' | 'views';
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile' | 'fullscreen';
export type CodeTab = 'html' | 'css' | 'js';
