import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { WebApp, Category, AppFilter } from './types/app';
import { StorageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { CategoryFilter } from './components/CategoryFilter';
import { AppCard } from './components/AppCard';
import { PlayroomModal } from './components/PlayroomModal';
import { CreateAppModal } from './components/CreateAppModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Layers, Plus, Inbox, Star } from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [apps, setApps] = useState<WebApp[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [editingApp, setEditingApp] = useState<WebApp | null>(null);
  const [activePlayroomApp, setActivePlayroomApp] = useState<WebApp | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [filter, setFilter] = useState<AppFilter>({
    searchQuery: '',
    category: 'all',
    tag: undefined,
    sortBy: 'recent',
    onlyFavorites: false
  });

  // Load initial data and resolve URL route
  const checkUrlRoute = useCallback(() => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
    if (path) {
      const matched = StorageService.getAppBySlugOrId(path);
      if (matched) {
        StorageService.incrementViewCount(matched.id);
        setActivePlayroomApp(matched);
      }
    }
  }, []);

  const loadData = useCallback(() => {
    setCategories(StorageService.getCategories());
    const allApps = StorageService.getApps();
    setApps(allApps);
    setFavorites(StorageService.getFavorites());
  }, []);

  // Check saved admin status on mount
  useEffect(() => {
    const token = StorageService.getAdminToken();
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    loadData();
    checkUrlRoute();

    // Check if user previously saved a theme preference
    const savedTheme = localStorage.getItem('difinest_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light-theme', savedTheme === 'light');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
      if (path) {
        const matched = StorageService.getAppBySlugOrId(path);
        if (matched) {
          setActivePlayroomApp(matched);
        } else {
          setActivePlayroomApp(null);
        }
      } else {
        setActivePlayroomApp(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loadData, checkUrlRoute]);

  // Compute counts per category
  const appCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    apps.forEach(app => {
      counts[app.category] = (counts[app.category] || 0) + 1;
    });
    return counts;
  }, [apps]);

  // Compute filtered apps
  const filteredApps = useMemo(() => {
    let result = [...apps];

    // Filter only favorites
    if (filter.onlyFavorites) {
      result = result.filter(a => favorites.includes(a.id));
    }

    // Category filter (ignored if favorites only unless user explicitly filters)
    if (!filter.onlyFavorites && filter.category && filter.category !== 'all') {
      result = result.filter(a => a.category === filter.category);
    }

    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(q) ||
        (a.slug && a.slug.toLowerCase().includes(q)) ||
        a.description.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filter.tag) {
      result = result.filter(a => a.tags.includes(filter.tag!));
    }

    if (filter.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filter.sortBy === 'views') {
      result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return result;
  }, [apps, filter, favorites]);

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      StorageService.clearAdminToken();
    } else {
      setShowAdminAuth(true);
    }
  };

  const handleToggleFavorite = (appId: string) => {
    StorageService.toggleFavorite(appId);
    setFavorites(StorageService.getFavorites());
  };

  const handleRunApp = (app: WebApp) => {
    StorageService.incrementViewCount(app.id);
    setActivePlayroomApp(app);
    // Update browser URL so direct link can be copied or shared
    const appSlug = app.slug || app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || app.id;
    window.history.pushState({ appId: app.id }, '', `/${appSlug}`);
    loadData();
  };

  const handleClosePlayroom = () => {
    setActivePlayroomApp(null);
    window.history.pushState({}, '', '/');
  };

  const handleEditApp = (app: WebApp) => {
    if (!isAdmin) return;
    setEditingApp(app);
    setShowCreateModal(true);
  };

  const handleDeleteApp = (id: string) => {
    if (!isAdmin) return;
    StorageService.deleteApp(id);
    loadData();
  };

  const handleForkApp = (id: string) => {
    if (!isAdmin) return;
    const forked = StorageService.duplicateApp(id);
    if (forked) {
      loadData();
      handleRunApp(forked);
    }
  };

  const handleAppCreatedOrSaved = (_app: WebApp) => {
    loadData();
    setShowCreateModal(false);
    setEditingApp(null);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('difinest_theme', nextTheme);
    document.documentElement.classList.toggle('light-theme', nextTheme === 'light');
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${theme === 'light' ? 'light-theme bg-slate-50 text-slate-900' : 'bg-[#090d16] text-gray-100'}`}>
      {/* Navigation Header */}
      <Navbar
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        searchQuery={filter.searchQuery}
        onSearchChange={q => setFilter(prev => ({ ...prev, searchQuery: q }))}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCreateModal={() => { setEditingApp(null); setShowCreateModal(true); }}
        onDataReset={loadData}
        totalAppsCount={apps.length}
      />

      {/* Hero Banner Header */}
      <HeroHeader
        totalApps={apps.length}
        totalCategories={categories.filter(c => c.id !== 'all').length}
        selectedTag={filter.tag}
        onSelectTag={t => setFilter(prev => ({ ...prev, tag: t }))}
        isAdmin={isAdmin}
        theme={theme}
      />

      {/* Main Body Catalog Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pb-16 space-y-6">
        {/* Category Pill Filters, Favorites Toggle & Sorting */}
        <CategoryFilter
          categories={categories}
          selectedCategory={filter.category}
          onSelectCategory={catId => setFilter(prev => ({ ...prev, category: catId, onlyFavorites: false }))}
          sortBy={filter.sortBy}
          onSortChange={sort => setFilter(prev => ({ ...prev, sortBy: sort }))}
          appCountsByCategory={appCountsByCategory}
          favoritesCount={favorites.length}
          onlyFavorites={!!filter.onlyFavorites}
          onToggleOnlyFavorites={() => setFilter(prev => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))}
          theme={theme}
        />

        {/* Application Cards Grid */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map(app => (
              <AppCard
                key={app.id}
                app={app}
                categories={categories}
                isAdmin={isAdmin}
                isFavorite={favorites.includes(app.id)}
                theme={theme}
                onRunApp={handleRunApp}
                onToggleFavorite={handleToggleFavorite}
                onEditApp={handleEditApp}
                onDeleteApp={handleDeleteApp}
                onForkApp={handleForkApp}
                onSelectTag={tag => setFilter(prev => ({ ...prev, tag }))}
              />
            ))}
          </div>
        ) : (
          <div className={`py-20 text-center ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-gray-900/40 border-gray-800/80'} border rounded-2xl p-8 space-y-3`}>
            <div className={`w-12 h-12 rounded-full ${theme === 'light' ? 'bg-slate-100 text-slate-400' : 'bg-gray-800 text-gray-400'} flex items-center justify-center mx-auto`}>
              {filter.onlyFavorites ? <Star size={24} className="text-amber-400" /> : <Inbox size={24} />}
            </div>
            <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {filter.onlyFavorites ? 'No Favorite Apps Flagged' : 'No Applications Found'}
            </h3>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'} max-w-md mx-auto`}>
              {filter.onlyFavorites
                ? 'Click the star icon on any application card in the catalogue to save it to your favorites.'
                : (filter.searchQuery || filter.tag
                    ? `No matching applications found for query "${filter.searchQuery || filter.tag}". Try clearing your filters.`
                    : 'No applications uploaded yet in this category.')}
            </p>

            {filter.onlyFavorites && (
              <button
                onClick={() => setFilter(prev => ({ ...prev, onlyFavorites: false }))}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20"
              >
                View All Applications
              </button>
            )}

            {isAdmin && !filter.onlyFavorites && (
              <button
                onClick={() => { setEditingApp(null); setShowCreateModal(true); }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <Plus size={15} />
                <span>Upload First Application</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t ${theme === 'light' ? 'border-slate-200 bg-white text-slate-500' : 'border-gray-800/80 bg-gray-950 text-gray-500'} py-6 px-4 text-center text-xs`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Layers size={16} className="text-blue-500" />
          <span className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-gray-300'}`}>DifiNest</span>
          <span>— Community Web Application & Code Showcase Portal</span>
        </div>
      </footer>

      {/* Full Page Playroom Sandbox Modal with Top Persistent Header */}
      {activePlayroomApp && (
        <PlayroomModal
          app={activePlayroomApp}
          categories={categories}
          isAdmin={isAdmin}
          theme={theme}
          onClose={handleClosePlayroom}
          onAppUpdated={updated => {
            setActivePlayroomApp(updated);
            loadData();
          }}
          onAppDeleted={id => {
            handleDeleteApp(id);
            handleClosePlayroom();
          }}
        />
      )}

      {/* Admin Application Creator & Uploader Modal */}
      {isAdmin && showCreateModal && (
        <CreateAppModal
          categories={categories}
          initialApp={editingApp}
          onClose={() => { setShowCreateModal(false); setEditingApp(null); }}
          onAppCreated={handleAppCreatedOrSaved}
          onCategoryCreated={_cat => {
            setCategories(StorageService.getCategories());
          }}
        />
      )}

      {/* Admin Auth PIN Modal */}
      {showAdminAuth && (
        <AdminAuthModal
          onSuccess={() => {
            setIsAdmin(true);
            setShowAdminAuth(false);
          }}
          onClose={() => setShowAdminAuth(false)}
        />
      )}
    </div>
  );
}
