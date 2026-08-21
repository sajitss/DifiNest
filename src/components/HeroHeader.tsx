import React from 'react';
import { Layers, Code2 } from 'lucide-react';

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
  theme
}) => {
  const popularTags = ['canvas', 'glassmorphism', 'kanban', 'physics', 'audio-api', 'css-art', 'cyberpunk', 'utilities'];

  return (
    <div className={`border-b ${theme === 'light' ? 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200' : 'bg-gradient-to-r from-gray-950 via-[#0a0f1d] to-gray-950 border-gray-800/80'} py-4 px-4 transition-colors`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Compact Title & Filter Tag Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-800' : 'text-gray-200'} shrink-0`}>
            Explore Apps:
          </span>

          {selectedTag && (
            <button
              onClick={() => onSelectTag(undefined)}
              className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm"
            >
              <span>Tag: #{selectedTag}</span>
              <span>✕</span>
            </button>
          )}

          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => onSelectTag(selectedTag === tag ? undefined : tag)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : (theme === 'light' 
                      ? 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 shadow-sm' 
                      : 'bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800 hover:text-white')
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Right: Sleek mini stat pill */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${theme === 'light' ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'bg-gray-900/90 border-gray-800 text-gray-300'}`}>
            <Layers size={13} className="text-blue-500" />
            <strong className={`${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalApps}</strong> Apps
          </span>

          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${theme === 'light' ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'bg-gray-900/90 border-gray-800 text-gray-300'}`}>
            <Code2 size={13} className="text-purple-500" />
            <strong className={`${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalCategories}</strong> Categories
          </span>
        </div>
      </div>
    </div>
  );
};
