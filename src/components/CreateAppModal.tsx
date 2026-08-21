import React, { useState, useRef } from 'react';
import type { WebApp, Category } from '../types/app';
import { StorageService } from '../services/storageService';
import { ZipService } from '../services/zipService';
import {
  X,
  Upload,
  FileArchive,
  FileCode,
  FolderPlus,
  Sparkles,
  Plus,
  Check,
  Code2,
  FileText
} from 'lucide-react';

interface CreateAppModalProps {
  categories: Category[];
  initialApp?: WebApp | null;
  onClose: () => void;
  onAppCreated: (app: WebApp) => void;
  onCategoryCreated: (category: Category) => void;
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({
  categories,
  initialApp,
  onClose,
  onAppCreated,
  onCategoryCreated
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'starter' | 'code'>('upload');
  
  // App Form State
  const [name, setName] = useState(initialApp?.name || '');
  const [category, setCategory] = useState<string>(initialApp?.category || categories[1]?.id || 'ui-components');
  const [description, setDescription] = useState(initialApp?.description || '');
  const [tags, setTags] = useState<string>(initialApp?.tags ? initialApp.tags.join(', ') : 'custom, web-app');
  const [author, setAuthor] = useState(initialApp?.author || 'Admin');
  
  // Source Code State
  const [html, setHtml] = useState(initialApp?.html || '<div class="card">\n  <h1>Hello DifiNest</h1>\n  <p>Your custom app is live!</p>\n</div>');
  const [css, setCss] = useState(initialApp?.css || 'body { font-family: system-ui; background: #0b0f19; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; }\n.card { padding: 24px; background: rgba(255,255,255,0.08); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }');
  const [js, setJs] = useState(initialApp?.js || '// Add interactive JS logic here\nconsole.log("App initialized successfully!");');
  
  // Drag and drop feedback
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // New Category inline creation
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    if (files.length === 1 && files[0].name.endsWith('.zip')) {
      // Zip import
      try {
        const parsed = await ZipService.parseUploadedZip(files[0]);
        if (parsed.html) setHtml(parsed.html);
        if (parsed.css) setCss(parsed.css);
        if (parsed.js) setJs(parsed.js);
        if (parsed.name && !name) setName(parsed.name);
        setUploadedFileName(files[0].name);
        setActiveTab('code');
      } catch (err) {
        alert('Could not parse ZIP file. Please ensure it contains standard web app files.');
      }
    } else {
      // Multiple HTML/CSS/JS files
      const parsed = await ZipService.readMultipleFiles(files);
      if (parsed.html) setHtml(parsed.html);
      if (parsed.css) setCss(parsed.css);
      if (parsed.js) setJs(parsed.js);
      if (parsed.suggestedName && !name) setName(parsed.suggestedName);
      setUploadedFileName(`${files.length} source file(s) imported`);
      setActiveTab('code');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cat = StorageService.addCategory(newCategoryName.trim(), `Custom category for ${newCategoryName.trim()}`);
    onCategoryCreated(cat);
    setCategory(cat.id);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please provide an application name.');
      return;
    }

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    const saved = StorageService.saveApp({
      id: initialApp?.id,
      name: name.trim(),
      category,
      description: description.trim() || 'Custom private web application.',
      tags: tagList.length ? tagList : ['web-app'],
      author: author.trim() || 'Admin',
      html,
      css,
      js
    });

    onAppCreated(saved);
  };

  const applyTemplate = (type: 'blank' | 'canvas' | 'ui' | 'tool') => {
    if (type === 'blank') {
      setHtml('<div class="app-root">\n  <h2>New Application</h2>\n</div>');
      setCss('body { background: #0d1117; color: #fff; margin: 0; padding: 20px; font-family: sans-serif; }');
      setJs('console.log("App ready!");');
    } else if (type === 'canvas') {
      setHtml('<canvas id="myCanvas"></canvas>');
      setCss('body { margin: 0; overflow: hidden; background: #000; }\n#myCanvas { width: 100vw; height: 100vh; display: block; }');
      setJs('const c = document.getElementById("myCanvas");\nconst ctx = c.getContext("2d");\nc.width = window.innerWidth;\nc.height = window.innerHeight;\n\nfunction loop() {\n  ctx.fillStyle = "rgba(0,0,0,0.1)";\n  ctx.fillRect(0,0,c.width,c.height);\n  ctx.fillStyle = "#3b82f6";\n  ctx.beginPath();\n  ctx.arc(c.width/2 + Math.cos(Date.now()/500)*100, c.height/2 + Math.sin(Date.now()/500)*100, 20, 0, Math.PI*2);\n  ctx.fill();\n  requestAnimationFrame(loop);\n}\nloop();');
    } else if (type === 'ui') {
      setHtml('<div class="card">\n  <h3>Interactive Widget</h3>\n  <button id="counterBtn">Clicked: <span id="count">0</span> times</button>\n</div>');
      setCss('body { background: #0f172a; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n.card { background: #1e293b; padding: 24px; border-radius: 14px; border: 1px solid #334155; text-align: center; }\nbutton { background: #3b82f6; border: none; color: #fff; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 12px; }');
      setJs('let count = 0;\ndocument.getElementById("counterBtn").addEventListener("click", () => {\n  count++;\n  document.getElementById("count").textContent = count;\n});');
    }
    setActiveTab('code');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Upload size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialApp ? 'Edit Application' : 'Publish New Application'}
              </h2>
              <p className="text-xs text-gray-400">
                Upload HTML/CSS/JS source files or pick a starter template
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Application Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Interactive 3D Audio Visualizer"
                required
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-300">Category</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus size={12} /> Add Custom
                </button>
              </div>

              {!isAddingCategory ? (
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 bg-gray-950 border border-blue-500/80 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tags (Comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g. canvas, 3d, dark-mode, audio"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Author / Admin</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="e.g. Systems Team"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of application purpose and interaction controls..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Import Method Tabs */}
          <div>
            <div className="flex border-b border-gray-800 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Upload size={14} />
                <span>Upload Source Files</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('starter')}
                className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'starter'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Sparkles size={14} />
                <span>Starter Templates</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'code'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Code2 size={14} />
                <span>Code Editor</span>
              </button>
            </div>

            {/* Tab 1: Upload Drag & Drop */}
            {activeTab === 'upload' && (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-950/30 scale-[0.99]'
                    : 'border-gray-800 bg-gray-950/60 hover:border-gray-700'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center mx-auto mb-3">
                  <FileArchive size={24} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Drag & Drop HTML, CSS, JS or ZIP files here
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Upload individual <code className="text-blue-300">.html</code>, <code className="text-blue-300">.css</code>, <code className="text-blue-300">.js</code> files or a single <code className="text-blue-300">.zip</code> package
                </p>

                <div className="flex justify-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={e => e.target.files && handleFileUpload(e.target.files)}
                    multiple
                    accept=".html,.css,.js,.zip"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md"
                  >
                    Select Files
                  </button>
                </div>

                {uploadedFileName && (
                  <div className="mt-4 p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg inline-flex items-center gap-1.5">
                    <Check size={14} />
                    <span>{uploadedFileName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Starters */}
            {activeTab === 'starter' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => applyTemplate('blank')}
                  className="p-4 bg-gray-950 border border-gray-800 hover:border-blue-500 rounded-xl cursor-pointer transition-all"
                >
                  <h4 className="text-xs font-bold text-white mb-1">Blank Canvas</h4>
                  <p className="text-[11px] text-gray-400">Clean starter with basic HTML skeleton.</p>
                </div>
                <div
                  onClick={() => applyTemplate('canvas')}
                  className="p-4 bg-gray-950 border border-gray-800 hover:border-blue-500 rounded-xl cursor-pointer transition-all"
                >
                  <h4 className="text-xs font-bold text-white mb-1">HTML5 2D Canvas</h4>
                  <p className="text-[11px] text-gray-400">Pre-configured requestAnimationFrame loop.</p>
                </div>
                <div
                  onClick={() => applyTemplate('ui')}
                  className="p-4 bg-gray-950 border border-gray-800 hover:border-blue-500 rounded-xl cursor-pointer transition-all"
                >
                  <h4 className="text-xs font-bold text-white mb-1">Interactive UI Card</h4>
                  <p className="text-[11px] text-gray-400">Widget template with state button handler.</p>
                </div>
              </div>
            )}

            {/* Tab 3: Quick Code Editors */}
            {activeTab === 'code' && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-[11px] font-sans text-rose-400 font-semibold mb-1">HTML Body Content</label>
                  <textarea
                    value={html}
                    onChange={e => setHtml(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-gray-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans text-blue-400 font-semibold mb-1">CSS Stylesheet</label>
                  <textarea
                    value={css}
                    onChange={e => setCss(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-gray-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans text-amber-400 font-semibold mb-1">JavaScript Script</label>
                  <textarea
                    value={js}
                    onChange={e => setJs(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-gray-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-semibold shadow-lg shadow-blue-600/30 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>{initialApp ? 'Save Changes' : 'Publish to Catalogue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
