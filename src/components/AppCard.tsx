import React from 'react';
import type { WebApp, Category } from '../types/app';
import { SandboxRunner } from './SandboxRunner';
import {
  Play,
  Code2,
  Copy,
  Download,
  Trash2,
  Edit,
  User,
  Sparkles,
  Share2,
  Star
} from 'lucide-react';
import { ZipService } from '../services/zipService';

interface AppCardProps {
  app: WebApp;
  categories: Category[];
  isAdmin: boolean;
  isFavorite?: boolean;
  theme: 'dark' | 'light';
  onRunApp: (app: WebApp) => void;
  onToggleFavorite?: (appId: string) => void;
  onEditApp?: (app: WebApp) => void;
  onDeleteApp?: (id: string) => void;
  onForkApp?: (id: string) => void;
  onSelectTag?: (tag: string) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  categories,
  isAdmin,
  isFavorite = false,
  theme,
  onRunApp,
  onToggleFavorite,
  onEditApp,
  onDeleteApp,
  onForkApp,
  onSelectTag
}) => {
  const categoryObj = categories.find(c => c.id === app.category);

  return (
    <div className={`group relative ${theme === 'light' ? 'bg-white border-slate-200 shadow-md hover:shadow-xl hover:border-blue-400' : 'bg-gray-900/70 border-gray-800/80 shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/50'} backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full animate-fade-in`}>
      {/* Live Mini Preview Canvas Header */}
      <div 
        onClick={() => onRunApp(app)}
        className={`relative h-44 ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-black border-gray-800/60'} overflow-hidden cursor-pointer border-b group-hover:opacity-95 transition-opacity`}
      >
        {/* Render Sandbox Runner thumbnail */}
        <div className="absolute inset-0 pointer-events-none transform scale-100 origin-top-left">
          <SandboxRunner
            html={app.html}
            css={app.css}
            js={app.js}
            theme={theme}
            title={app.name}
            height="100%"
          />
        </div>

        {/* Gradient overlay for title contrast */}
        <div className={`absolute inset-0 ${theme === 'light' ? 'bg-gradient-to-t from-white/80 via-transparent to-transparent' : 'bg-gradient-to-t from-gray-900 via-transparent to-black/30'} pointer-events-none`}></div>

        {/* Top Badges & Favorite Star */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className={`${theme === 'light' ? 'bg-white/90 text-blue-600 border-blue-200' : 'bg-gray-950/80 text-blue-400 border-blue-800/60'} backdrop-blur-md border text-[10px] px-2.5 py-1 rounded-full font-mono uppercase font-bold tracking-wider`}>
            {categoryObj ? categoryObj.name : app.category}
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {app.isFeatured && (
              <span className={`${theme === 'light' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950/90 text-amber-300 border-amber-500/50'} border text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1`}>
                <Sparkles size={11} /> Featured
              </span>
            )}

            {/* Favorite Star Button */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(app.id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                  isFavorite
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-black/50 border-white/20 text-white/70 hover:text-amber-400 hover:border-amber-400'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star size={13} className={isFavorite ? 'fill-amber-400 text-amber-400' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Hover Launch Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 backdrop-blur-[2px] transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onRunApp(app); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xl transform group-hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Play size={14} className="fill-white" />
            <span>Launch App Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title & Description */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              onClick={() => onRunApp(app)}
              className={`text-base font-bold ${theme === 'light' ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'} transition-colors cursor-pointer line-clamp-1`}
              title={app.name}
            >
              {app.name}
            </h3>
          </div>

          <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'} line-clamp-2 leading-relaxed mb-3`}>
            {app.description || 'No description provided.'}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {app.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                onClick={() => onSelectTag && onSelectTag(tag)}
                className={`text-[10px] font-medium ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:text-slate-900' : 'bg-gray-950 hover:bg-gray-800 text-gray-400 hover:text-white border-gray-800'} border px-2 py-0.5 rounded-md cursor-pointer transition-colors`}
              >
                #{tag}
              </span>
            ))}
            {app.tags.length > 3 && (
              <span className={`text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-gray-500'} font-mono self-center`}>
                +{app.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer Meta & Actions */}
        <div className={`pt-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-gray-800/80'} flex items-center justify-between gap-2`}>
          {/* Author & Views */}
          <div className={`flex items-center gap-2 text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'} font-sans`}>
            <span className={`flex items-center gap-1 ${theme === 'light' ? 'text-slate-700' : 'text-gray-400'}`} title="Author">
              <User size={12} /> {app.author}
            </span>
            <span>•</span>
            <span title="Views">{app.viewCount || 0} views</span>
          </div>

          {/* Card Quick Actions */}
          <div className="flex items-center gap-1">
            {/* Run Button (Available for ALL users) */}
            <button
              onClick={() => onRunApp(app)}
              title="Launch Application"
              className={`px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors`}
            >
              <Play size={12} className="fill-white" />
              <span>Run</span>
            </button>

            {/* Share Link Button (Available for ALL users) */}
            <button
              onClick={() => {
                const slug = app.slug || app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || app.id;
                const shareUrl = `${window.location.origin}/${slug}`;
                navigator.clipboard.writeText(shareUrl);
                alert(`Direct application URL copied to clipboard:\n${shareUrl}`);
              }}
              title="Copy direct shareable link"
              className={`p-1.5 ${theme === 'light' ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-100' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'} rounded-lg transition-colors`}
            >
              <Share2 size={14} />
            </button>

            {/* ADMIN ONLY ACTIONS */}
            {isAdmin && (
              <>
                <button
                  onClick={() => onRunApp(app)}
                  title="Inspect / Edit Code"
                  className={`p-1.5 ${theme === 'light' ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-100' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-800'} rounded-lg transition-colors`}
                >
                  <Code2 size={14} />
                </button>

                <button
                  onClick={() => ZipService.exportAppAsZip(app)}
                  title="Download ZIP"
                  className={`p-1.5 ${theme === 'light' ? 'text-slate-600 hover:text-emerald-600 hover:bg-slate-100' : 'text-gray-400 hover:text-emerald-400 hover:bg-gray-800'} rounded-lg transition-colors`}
                >
                  <Download size={14} />
                </button>

                {onForkApp && (
                  <button
                    onClick={() => onForkApp(app.id)}
                    title="Fork / Duplicate"
                    className={`p-1.5 ${theme === 'light' ? 'text-slate-600 hover:text-purple-600 hover:bg-slate-100' : 'text-gray-400 hover:text-purple-400 hover:bg-gray-800'} rounded-lg transition-colors`}
                  >
                    <Copy size={14} />
                  </button>
                )}

                {onEditApp && (
                  <button
                    onClick={() => onEditApp(app)}
                    title="Admin Edit Details"
                    className={`p-1.5 ${theme === 'light' ? 'text-slate-600 hover:text-amber-600 hover:bg-slate-100' : 'text-gray-400 hover:text-amber-400 hover:bg-gray-800'} rounded-lg transition-colors`}
                  >
                    <Edit size={14} />
                  </button>
                )}

                {onDeleteApp && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete application "${app.name}"?`)) {
                        onDeleteApp(app.id);
                      }
                    }}
                    title="Delete Application"
                    className={`p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
