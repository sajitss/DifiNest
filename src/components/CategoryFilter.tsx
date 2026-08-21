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
  ArrowUpDown
} from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  sortBy: 'recent' | 'name' | 'views';
  onSortChange: (sort: 'recent' | 'name' | 'views') => void;
  appCountsByCategory: Record<string, number>;
  theme: 'dark' | 'light';
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  appCountsByCategory,
  theme
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout': return <Layout size={15} />;
      case 'Gamepad2': return <Gamepad2 size={15} />;
      case 'Kanban': return <Kanban size={15} />;
      case 'Wrench': return <Wrench size={15} />;
      case 'Sparkles': return <Sparkles size={15} />;
      case 'Grid': return <Grid size={15} />;
      default: return <Folder size={15} />;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b ${theme === 'light' ? 'border-slate-200' : 'border-gray-800'}`}>
      {/* Category Pills horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        {categories.map(cat => {
          const count = cat.id === 'all' 
            ? Object.values(appCountsByCategory).reduce((a, b) => a + b, 0)
            : (appCountsByCategory[cat.id] || 0);

          const isSelected = selectedCategory === cat.id;

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
