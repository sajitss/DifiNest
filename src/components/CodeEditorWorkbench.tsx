import React, { useState } from 'react';
import type { CodeTab } from '../types/app';
import { FileCode, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';

interface CodeEditorWorkbenchProps {
  html: string;
  css: string;
  js: string;
  onChangeHtml: (val: string) => void;
  onChangeCss: (val: string) => void;
  onChangeJs: (val: string) => void;
  onReset?: () => void;
  readOnly?: boolean;
}

export const CodeEditorWorkbench: React.FC<CodeEditorWorkbenchProps> = ({
  html,
  css,
  js,
  onChangeHtml,
  onChangeCss,
  onChangeJs,
  onReset,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState<CodeTab>('html');
  const [copied, setCopied] = useState(false);

  const activeContent = activeTab === 'html' ? html : (activeTab === 'css' ? css : js);

  const getLineNumbers = (text: string) => {
    const count = text.split('\n').length;
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (tab: CodeTab) => {
    setActiveTab(tab);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (activeTab === 'html') onChangeHtml(val);
    else if (activeTab === 'css') onChangeCss(val);
    else onChangeJs(val);
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] border-r border-gray-800">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3 h-10 bg-gray-900 border-b border-gray-800 select-none">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleTabChange('html')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'html'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>HTML</span>
            <span className="text-[10px] text-gray-500 font-sans">({html.split('\n').length})</span>
          </button>

          <button
            onClick={() => handleTabChange('css')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'css'
                ? 'bg-blue-950/80 text-blue-300 border border-blue-800/80 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>CSS</span>
            <span className="text-[10px] text-gray-500 font-sans">({css.split('\n').length})</span>
          </button>

          <button
            onClick={() => handleTabChange('js')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
              activeTab === 'js'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>JS</span>
            <span className="text-[10px] text-gray-500 font-sans">({js.split('\n').length})</span>
          </button>
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center gap-1">
          {onReset && !readOnly && (
            <button
              onClick={onReset}
              title="Reset code to default"
              className="p-1 hover:bg-gray-800 text-gray-400 hover:text-amber-400 rounded transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          )}

          <button
            onClick={handleCopy}
            title={`Copy ${activeTab.toUpperCase()} code`}
            className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-xs leading-relaxed bg-[#060911]">
        {/* Line Numbers column */}
        <div className="py-3 px-2 select-none text-right text-gray-600 bg-gray-950/80 border-r border-gray-800/60 min-w-[36px]">
          {getLineNumbers(activeContent).map(num => (
            <div key={num} className="h-5">
              {num}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          value={activeContent}
          onChange={handleTextChange}
          readOnly={readOnly}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-gray-200 resize-none outline-none font-mono text-xs leading-5 border-none whitespace-pre overflow-auto focus:ring-0"
          placeholder={`Enter ${activeTab.toUpperCase()} code here...`}
        />
      </div>
    </div>
  );
};
