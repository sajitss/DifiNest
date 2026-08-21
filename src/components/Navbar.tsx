import React, { useState, useRef } from 'react';
import { StorageService } from '../services/storageService';
import {
  Shield,
  ShieldAlert,
  Plus,
  Search,
  Sun,
  Moon,
  Download,
  Upload,
  RotateCcw,
  Layers,
  Database
} from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenCreateModal: () => void;
  onDataReset: () => void;
  totalAppsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onToggleAdmin,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  onOpenCreateModal,
  onDataReset
}) => {
  const [showDbMenu, setShowDbMenu] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const handleExportDb = () => {
    const jsonStr = StorageService.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `difinest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setShowDbMenu(false);
  };

  const handleImportDb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (StorageService.importDatabaseJSON(content)) {
        onDataReset();
        alert('Database backup imported successfully!');
      } else {
        alert('Failed to import JSON backup. Invalid format.');
      }
    };
    reader.readAsText(file);
    setShowDbMenu(false);
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset DifiNest to default seed applications? Custom uploaded apps will be cleared.')) {
      StorageService.resetToDefaults();
      onDataReset();
      setShowDbMenu(false);
    }
  };

  return (
    <header className={`sticky top-0 z-40 ${theme === 'light' ? 'bg-white/90 border-slate-200 shadow-sm text-slate-900' : 'bg-gray-950/80 border-gray-800/80 text-gray-100'} backdrop-blur-xl border-b transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
            <div className={`w-full h-full ${theme === 'light' ? 'bg-white' : 'bg-gray-950'} rounded-[11px] flex items-center justify-center`}>
              <Layers className="text-blue-500" size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-base tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'} font-sans`}>
                Difi<span className="text-blue-500">Nest</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${theme === 'light' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950 text-blue-400 border-blue-800/60'}`}>
                Private Portal
              </span>
            </div>
            <p className={`text-[10px] font-sans hidden sm:block ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
              Web Application & Code Showcase
            </p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'}`} size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search applications, tags, author..."
            className={`w-full ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500' : 'bg-gray-900/90 border-gray-800 text-white placeholder-gray-500 focus:bg-gray-900 focus:border-blue-500'} border rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none transition-all`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${theme === 'light' ? 'text-slate-400 hover:text-slate-700' : 'text-gray-500 hover:text-white'}`}
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Actions & Admin Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Admin Publish App Button */}
          {isAdmin && (
            <button
              onClick={onOpenCreateModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Upload App</span>
            </button>
          )}

          {/* Database Backup & Restore Menu (Admin Only) */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowDbMenu(!showDbMenu)}
                className={`p-2 ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200' : 'bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-200 border-gray-800'} border rounded-xl text-xs transition-colors`}
                title="Database Backup & Settings"
              >
                <Database size={16} />
              </button>

              {showDbMenu && (
                <div className={`absolute right-0 mt-2 w-52 ${theme === 'light' ? 'bg-white border-slate-200 shadow-xl' : 'bg-gray-900 border-gray-800 shadow-2xl'} border rounded-xl p-1.5 z-50 text-xs space-y-1 animate-fade-in`}>
                  <button
                    onClick={handleExportDb}
                    className={`w-full px-3 py-2 text-left ${theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-gray-800 text-gray-300'} rounded-lg flex items-center gap-2`}
                  >
                    <Download size={14} className="text-blue-500" />
                    <span>Export DB (JSON)</span>
                  </button>

                  <button
                    onClick={() => jsonFileInputRef.current?.click()}
                    className={`w-full px-3 py-2 text-left ${theme === 'light' ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-gray-800 text-gray-300'} rounded-lg flex items-center gap-2`}
                  >
                    <Upload size={14} className="text-emerald-500" />
                    <span>Import DB (JSON)</span>
                  </button>
                  <input
                    type="file"
                    ref={jsonFileInputRef}
                    onChange={handleImportDb}
                    accept=".json"
                    className="hidden"
                  />

                  <div className={`border-t ${theme === 'light' ? 'border-slate-200' : 'border-gray-800'} my-1`}></div>

                  <button
                    onClick={handleResetDefaults}
                    className="w-full px-3 py-2 text-left hover:bg-rose-500/10 text-rose-500 rounded-lg flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Seed Data</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle (Dark & Day Theme) */}
          <button
            onClick={onToggleTheme}
            className={`p-2 ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200' : 'bg-gray-900 hover:bg-gray-800 text-amber-400 border-gray-800'} border rounded-xl text-xs transition-colors`}
            title={`Switch to ${theme === 'dark' ? 'Day / Light Theme' : 'Dark Theme'}`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Admin Mode Toggle */}
          <button
            onClick={onToggleAdmin}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isAdmin
                ? (theme === 'light' ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-sm' : 'bg-amber-950/70 border-amber-500/80 text-amber-300 shadow-lg shadow-amber-500/10')
                : (theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-800')
            }`}
          >
            {isAdmin ? <ShieldAlert size={15} className="text-amber-500" /> : <Shield size={15} />}
            <span>{isAdmin ? 'Admin Mode' : 'Viewer Mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
