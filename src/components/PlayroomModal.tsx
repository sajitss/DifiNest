import React, { useState } from 'react';
import type { WebApp, ViewportMode, ConsoleLog, Category } from '../types/app';
import { SandboxRunner } from './SandboxRunner';
import { CodeEditorWorkbench } from './CodeEditorWorkbench';
import { ConsoleDrawer } from './ConsoleDrawer';
import { StorageService } from '../services/storageService';
import { ZipService } from '../services/zipService';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  Copy,
  Code2,
  Eye,
  Columns,
  Edit,
  Maximize2,
  Minimize2,
  Layers,
  Share2
} from 'lucide-react';

interface PlayroomModalProps {
  app: WebApp;
  categories: Category[];
  isAdmin: boolean;
  theme: 'dark' | 'light';
  onClose: () => void;
  onAppUpdated: (app: WebApp) => void;
  onAppDeleted?: (id: string) => void;
}

export const PlayroomModal: React.FC<PlayroomModalProps> = ({
  app,
  categories,
  isAdmin,
  theme,
  onClose,
  onAppUpdated,
}) => {
  const [html, setHtml] = useState(app.html);
  const [css, setCss] = useState(app.css);
  const [js, setJs] = useState(app.js);

  // If not admin, force full preview mode only
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [layoutMode, setLayoutMode] = useState<'split' | 'code' | 'preview'>('preview');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Edit metadata modal state inside playroom
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editName, setEditName] = useState(app.name);
  const [editCategory, setEditCategory] = useState(app.category);
  const [editDesc, setEditDesc] = useState(app.description);
  const [editTags, setEditTags] = useState(app.tags.join(', '));

  const handleConsoleLog = (log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev, log]);
  };

  const handleClearConsole = () => {
    setConsoleLogs([]);
  };

  const handleSaveChanges = () => {
    if (!isAdmin) return;
    const updated = StorageService.saveApp({
      id: app.id,
      name: app.name,
      slug: app.slug,
      description: app.description,
      category: app.category,
      tags: app.tags,
      author: app.author,
      html,
      css,
      js,
      thumbnailColor: app.thumbnailColor
    });
    onAppUpdated(updated);
  };

  const handleForkApp = () => {
    if (!isAdmin) return;
    const forked = StorageService.duplicateApp(app.id);
    if (forked) {
      onAppUpdated(forked);
    }
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const updated = StorageService.saveApp({
      id: app.id,
      name: editName,
      slug: app.slug,
      description: editDesc,
      category: editCategory,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      author: app.author,
      html,
      css,
      js
    });
    onAppUpdated(updated);
    setIsEditingMeta(false);
  };

  const handleExportZip = () => {
    if (!isAdmin) return;
    ZipService.exportAppAsZip({ ...app, html, css, js });
  };

  const handleExportHtml = () => {
    if (!isAdmin) return;
    ZipService.exportAppAsSingleHtml({ ...app, html, css, js });
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'tablet':
        return '768px';
      case 'mobile':
        return '375px';
      default:
        return '100%';
    }
  };

  const categoryObj = categories.find(c => c.id === app.category);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#050811] text-gray-100'} overflow-hidden animate-fade-in`}>
      {/* Compact Top Header - Always visible across entire top */}
      <header className={`h-11 px-4 ${theme === 'light' ? 'bg-slate-100/95 border-slate-200 text-slate-800' : 'bg-gray-950/95 border-gray-800 text-gray-200'} border-b flex items-center justify-between gap-3 select-none shrink-0 shadow-sm z-20`}>
        {/* Left: Branding & App Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 text-blue-500 font-bold text-xs tracking-tight">
            <Layers size={16} />
            <span className="hidden sm:inline">DifiNest</span>
          </div>

          <span className="text-gray-400 text-xs">/</span>

          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-semibold text-xs truncate max-w-[200px] md:max-w-xs" title={app.name}>
              {app.name}
            </h2>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono uppercase font-bold ${theme === 'light' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-blue-950 text-blue-400 border border-blue-800/80'}`}>
              {categoryObj ? categoryObj.name : app.category}
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsEditingMeta(true)}
              className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
              title="Edit Title & Category"
            >
              <Edit size={13} />
            </button>
          )}
        </div>

        {/* Center: Viewport & Layout Modes (Visible to Admin or Viewport Sizing for All) */}
        <div className="flex items-center gap-2">
          {/* Viewport Sizing */}
          <div className={`flex items-center p-0.5 rounded-lg border ${theme === 'light' ? 'bg-white border-slate-300' : 'bg-gray-900 border-gray-800'}`}>
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1 rounded transition-colors ${
                viewportMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
              title="Full Desktop 100%"
            >
              <Monitor size={13} />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1 rounded transition-colors ${
                viewportMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
              title="Tablet 768px"
            >
              <Tablet size={13} />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1 rounded transition-colors ${
                viewportMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
              title="Mobile 375px"
            >
              <Smartphone size={13} />
            </button>
          </div>

          {/* Code Layout Split Toggles - ONLY FOR ADMIN */}
          {isAdmin && (
            <div className={`flex items-center p-0.5 rounded-lg border ${theme === 'light' ? 'bg-white border-slate-300' : 'bg-gray-900 border-gray-800'}`}>
              <button
                onClick={() => setLayoutMode('preview')}
                className={`p-1 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                  layoutMode === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
                title="Full Preview Only"
              >
                <Eye size={13} />
                <span className="hidden md:inline text-[11px]">Run App</span>
              </button>
              <button
                onClick={() => setLayoutMode('split')}
                className={`p-1 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                  layoutMode === 'split' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
                title="Split View"
              >
                <Columns size={13} />
                <span className="hidden md:inline text-[11px]">Split</span>
              </button>
              <button
                onClick={() => setLayoutMode('code')}
                className={`p-1 rounded text-xs flex items-center gap-1 font-medium transition-colors ${
                  layoutMode === 'code' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
                title="Code Editor Only"
              >
                <Code2 size={13} />
                <span className="hidden md:inline text-[11px]">Code</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Admin Save, Fork & Download Actions */}
          {isAdmin && (
            <>
              <button
                onClick={handleSaveChanges}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                title="Save updated code"
              >
                <span>Save Code</span>
              </button>

              <button
                onClick={handleForkApp}
                className={`px-2 py-1 ${theme === 'light' ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300' : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800'} rounded-lg text-xs font-medium transition-colors flex items-center gap-1`}
                title="Fork / Duplicate app"
              >
                <Copy size={12} />
                <span className="hidden lg:inline">Fork</span>
              </button>

              <button
                onClick={handleExportZip}
                className={`px-2 py-1 ${theme === 'light' ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300' : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800'} rounded-lg text-xs font-medium transition-colors flex items-center gap-1`}
                title="Download application ZIP"
              >
                <Download size={12} />
                <span className="hidden lg:inline">ZIP</span>
              </button>

              <button
                onClick={handleExportHtml}
                className={`px-2 py-1 ${theme === 'light' ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300' : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800'} rounded-lg text-xs font-medium transition-colors flex items-center gap-1`}
                title="Download single HTML file"
              >
                <FileCodeIcon size={12} />
                <span className="hidden lg:inline">HTML</span>
              </button>
            </>
          )}

          {/* Copy Share URL Link button */}
          <button
            onClick={() => {
              const slug = app.slug || app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || app.id;
              const shareUrl = `${window.location.origin}/${slug}`;
              navigator.clipboard.writeText(shareUrl);
              alert(`Direct URL copied to clipboard:\n${shareUrl}`);
            }}
            className={`px-2 py-1 ${theme === 'light' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'} rounded-lg text-xs font-medium transition-colors flex items-center gap-1`}
            title="Copy Direct Shareable URL Link"
          >
            <Share2 size={12} />
            <span className="hidden sm:inline">Share Link</span>
          </button>

          {/* Close Header Button */}
          <button
            onClick={onClose}
            className={`p-1 ${theme === 'light' ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-gray-800 text-gray-400 hover:text-white'} rounded-lg transition-colors`}
            title="Exit Fullscreen App"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Main App Canvas / Split View Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Code Workbench (ONLY FOR ADMIN) */}
        {isAdmin && (layoutMode === 'split' || layoutMode === 'code') && (
          <div className={`${layoutMode === 'split' ? 'w-1/2' : 'w-full'} h-full border-r ${theme === 'light' ? 'border-slate-200' : 'border-gray-800'}`}>
            <CodeEditorWorkbench
              html={html}
              css={css}
              js={js}
              onChangeHtml={setHtml}
              onChangeCss={setCss}
              onChangeJs={setJs}
              onReset={() => {
                setHtml(app.html);
                setCss(app.css);
                setJs(app.js);
              }}
            />
          </div>
        )}

        {/* Right Side / Full Page: Sandbox Preview */}
        {(layoutMode === 'split' || layoutMode === 'preview' || !isAdmin) && (
          <div className={`${isAdmin && layoutMode === 'split' ? 'w-1/2' : 'w-full'} h-full flex flex-col ${theme === 'light' ? 'bg-slate-50' : 'bg-black'} overflow-hidden relative`}>
            {/* Viewport Box Wrapper */}
            <div className={`flex-1 flex justify-center items-center ${theme === 'light' ? 'bg-slate-100' : 'bg-[#050811]'} ${viewportMode !== 'desktop' ? 'p-3' : 'p-0'} overflow-hidden relative`}>
              <div
                style={{
                  width: getViewportWidth(),
                  height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className={`${viewportMode !== 'desktop' ? (theme === 'light' ? 'shadow-xl rounded-xl border border-slate-300' : 'shadow-2xl rounded-xl border border-gray-800') : 'rounded-none border-none'} overflow-hidden relative ${theme === 'light' ? 'bg-white' : 'bg-black'}`}
              >
                <SandboxRunner
                  html={html}
                  css={css}
                  js={js}
                  theme={theme}
                  title={app.name}
                  onConsoleLog={handleConsoleLog}
                  onClearConsole={handleClearConsole}
                />
              </div>
            </div>

            {/* Bottom Console Panel (Admin Only) */}
            {isAdmin && (
              <ConsoleDrawer
                logs={consoleLogs}
                onClear={handleClearConsole}
                isOpen={isConsoleOpen}
                onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
              />
            )}
          </div>
        )}
      </div>

      {/* Edit Metadata Modal Overlay (Admin Only) */}
      {isAdmin && isEditingMeta && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit size={18} className="text-blue-400" />
                Edit Application Details
              </h3>
              <button onClick={() => setIsEditingMeta(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Application Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingMeta(false)}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-semibold"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FileCodeIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
    <path d="M14 2v4a1 1 0 0 0 1 1h4"/>
    <path d="m10 13-2 2 2 2"/>
    <path d="m14 13 2 2-2 2"/>
  </svg>
);
