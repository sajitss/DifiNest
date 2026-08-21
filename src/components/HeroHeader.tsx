import React from 'react';
import { Sparkles, Code2, Layers, Cpu, CheckCircle } from 'lucide-react';

interface HeroHeaderProps {
  totalApps: number;
  totalCategories: number;
  selectedTag?: string;
  onSelectTag: (tag: string | undefined) => void;
  isAdmin: boolean;
  theme: 'dark' | 'light';
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  totalApps,
  totalCategories,
  selectedTag,
  onSelectTag,
  isAdmin,
  theme
}) => {
  const popularTags = ['canvas', 'glassmorphism', 'kanban', 'physics', 'audio-api', 'css-art', 'cyberpunk', 'utilities'];

  return (
    <div className={`relative overflow-hidden ${theme === 'light' ? 'bg-gradient-to-b from-slate-50 via-slate-100/60 to-white border-slate-200' : 'bg-gradient-to-b from-gray-950 via-[#0a0f1d] to-[#090d16] border-gray-800/80'} border-b py-10 px-4 transition-colors`}>
      {/* Glow ambient Orbs */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 ${theme === 'light' ? 'bg-blue-300/20' : 'bg-blue-600/10'} rounded-full blur-3xl pointer-events-none`}></div>
      <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${theme === 'light' ? 'bg-purple-300/20' : 'bg-purple-600/10'} rounded-full blur-3xl pointer-events-none`}></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
        {/* Left: Text & Badges */}
        <div className="space-y-3 max-w-2xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme === 'light' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-950/70 border-blue-800/60 text-blue-400'} border text-xs font-semibold`}>
            <Sparkles size={13} />
            <span>Private Web Application Showcase Portal</span>
          </div>

          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'} leading-tight`}>
            Explore, Launch & Administer Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-500">Web Applications</span>
          </h1>

          <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'} leading-relaxed`}>
            Cleanly categorized repository of HTML, CSS, and JavaScript micro-apps. Run applications in full-screen isolated sandboxes with seamless day and night mode switching.
          </p>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'} font-semibold mr-1`}>Popular Tags:</span>
            {selectedTag && (
              <button
                onClick={() => onSelectTag(undefined)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
              >
                <span>Tag: {selectedTag}</span>
                <span>✕</span>
              </button>
            )}
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => onSelectTag(selectedTag === tag ? undefined : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : (theme === 'light' ? 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200' : 'bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800 hover:text-white')
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Stats Card */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
          <div className={`p-4 rounded-2xl ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-gray-900/80 border-gray-800'} border backdrop-blur-md min-w-[130px]`}>
            <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'} font-semibold flex items-center gap-1.5 mb-1`}>
              <Layers size={14} className="text-blue-500" />
              <span>Total Apps</span>
            </div>
            <div className={`text-2xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalApps}</div>
          </div>

          <div className={`p-4 rounded-2xl ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-gray-900/80 border-gray-800'} border backdrop-blur-md min-w-[130px]`}>
            <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'} font-semibold flex items-center gap-1.5 mb-1`}>
              <Code2 size={14} className="text-purple-500" />
              <span>Categories</span>
            </div>
            <div className={`text-2xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalCategories}</div>
          </div>

          <div className={`p-4 rounded-2xl ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-gray-900/80 border-gray-800'} border backdrop-blur-md min-w-[130px]`}>
            <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'} font-semibold flex items-center gap-1.5 mb-1`}>
              <Cpu size={14} className="text-emerald-500" />
              <span>Sandbox</span>
            </div>
            <div className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Full Isolated
            </div>
          </div>

          <div className={`p-4 rounded-2xl ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-gray-900/80 border-gray-800'} border backdrop-blur-md min-w-[130px]`}>
            <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'} font-semibold flex items-center gap-1.5 mb-1`}>
              <CheckCircle size={14} className="text-amber-500" />
              <span>Access Role</span>
            </div>
            <div className="text-xs font-bold text-amber-500 mt-1">
              {isAdmin ? 'Admin Mode' : 'Public Viewer'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
