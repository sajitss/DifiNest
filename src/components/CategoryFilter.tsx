import React from 'react';
import type { Category, CategoryId } from '../types/app';
import {
  Grid,
  Layout,
  Gamepad2,
  Kanban,
  Wrench,
  Sparkles,
  Folder,
  ArrowUpDown,
  Star,
  GraduationCap,
  CheckSquare,
  Building2
} from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  sortBy: 'recent' | 'name' | 'views';
  onSortChange: (sort: 'recent' | 'name' | 'views') => void;
  appCountsByCategory: Record<string, number>;
  favoritesCount: number;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  theme: 'dark' | 'light';
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  appCountsByCategory,
  favoritesCount,
  onlyFavorites,
  onToggleOnlyFavorites,
  theme
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap size={15} />;
      case 'CheckSquare': return <CheckSquare size={15} />;
      case 'Sparkles': return <Sparkles size={15} />;
      case 'Building2': return <Building2 size={15} />;
      case 'Layout': return <Layout size={15} />;
      case 'Gamepad2': return <Gamepad2 size={15} />;
      case 'Kanban': return <Kanban size={15} />;
      case 'Wrench': return <Wrench size={15} />;
      case 'Grid': return <Grid size={15} />;
      default: return <Folder size={15} />;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b ${theme === 'light' ? 'border-slate-200' : 'border-gray-800'}`}>
      {/* Category Pills and Favorites Toggle */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        {/* Favorites Filter Toggle Pill */}
        <button
          onClick={onToggleOnlyFavorites}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
            onlyFavorites
              ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20 font-bold'
              : (theme === 'light' 
                  ? 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-700 shadow-sm' 
                  : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-amber-500/50 hover:text-amber-300')
          }`}
          title="Toggle view to only show starred favorite apps"
        >
          <Star size={14} className={onlyFavorites ? 'fill-black text-black' : (favoritesCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-gray-400')} />
          <span>Favorites</span>
          <span
            className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
              onlyFavorites
                ? 'bg-amber-700 text-amber-100 font-bold'
                : (theme === 'light' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-amber-950 text-amber-300 border border-amber-800/60')
            }`}
          >
            {favoritesCount}
          </span>
        </button>

        <div className={`h-6 w-[1px] ${theme === 'light' ? 'bg-slate-300' : 'bg-gray-800'} mx-1 shrink-0`}></div>

        {categories.map(cat => {
          const count = cat.id === 'all' 
            ? Object.values(appCountsByCategory).reduce((a, b) => a + b, 0)
            : (appCountsByCategory[cat.id] || 0);

          const isSelected = selectedCategory === cat.id && !onlyFavorites;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                  : (theme === 'light' ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800')
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-blue-500'}>
                {getCategoryIcon(cat.iconName)}
              </span>
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                  isSelected 
                    ? 'bg-blue-800 text-blue-100' 
                    : (theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-gray-800 text-gray-400')
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort By Selector */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <ArrowUpDown size={14} className={theme === 'light' ? 'text-slate-500' : 'text-gray-400'} />
        <span className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'} font-semibold`}>Sort by:</span>
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value as any)}
          className={`${theme === 'light' ? 'bg-white border-slate-200 text-slate-800 focus:border-blue-500' : 'bg-gray-900 border-gray-800 text-white focus:border-blue-500'} border rounded-xl px-3 py-1.5 text-xs outline-none`}
        >
          <option value="recent">Recently Added</option>
          <option value="name">Name (A-Z)</option>
          <option value="views">Most Views</option>
        </select>
      </div>
    </div>
  );
};
