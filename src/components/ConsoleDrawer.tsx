import React, { useState } from 'react';
import type { ConsoleLog } from '../types/app';
import { Terminal, Trash2, X, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';

interface ConsoleDrawerProps {
  logs: ConsoleLog[];
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ConsoleDrawer: React.FC<ConsoleDrawerProps> = ({
  logs,
  onClear,
  isOpen,
  onToggle
}) => {
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter(l => {
    if (filter !== 'all' && l.type !== filter) return false;
    if (search.trim() && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogStyle = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return 'text-rose-400 bg-rose-950/40 border-rose-900/50';
      case 'warn':
        return 'text-amber-300 bg-amber-950/40 border-amber-900/50';
      case 'info':
        return 'text-cyan-300 bg-cyan-950/40 border-cyan-900/50';
      default:
        return 'text-gray-300 bg-gray-900/40 border-gray-800/50';
    }
  };

  const errorCount = logs.filter(l => l.type === 'error').length;
  const warnCount = logs.filter(l => l.type === 'warn').length;

  return (
    <div className={`transition-all duration-300 border-t border-gray-800 bg-[#0c101a] ${isOpen ? 'h-52' : 'h-10'} flex flex-col`}>
      {/* Header bar */}
      <div 
        onClick={onToggle}
        className="px-4 h-10 flex items-center justify-between bg-gray-900/90 border-b border-gray-800 cursor-pointer select-none text-xs text-gray-300 hover:bg-gray-800/80 transition-colors"
      >
        <div className="flex items-center gap-2 font-mono font-medium">
          <Terminal size={14} className="text-blue-400" />
          <span>Console Terminal</span>
          <span className="bg-gray-800 px-2 py-0.5 rounded-full text-[10px] text-gray-400">
            {logs.length} entries
          </span>

          {errorCount > 0 && (
            <span className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full text-[10px] border border-rose-800">
              {errorCount} errors
            </span>
          )}
          {warnCount > 0 && (
            <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full text-[10px] border border-amber-800">
              {warnCount} warnings
            </span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {isOpen && (
            <>
              {/* Filter pills */}
              <div className="flex bg-gray-950 p-0.5 rounded-md border border-gray-800 font-sans">
                {(['all', 'log', 'warn', 'error'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold transition-colors ${
                      filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <button
                onClick={handleCopy}
                title="Copy all logs"
                className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-gray-200 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <button
                onClick={onClear}
                title="Clear console"
                className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}

          <button onClick={onToggle} className="p-1 hover:bg-gray-800 rounded text-gray-400">
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Console output body */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 bg-[#090d16]">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600 text-xs italic">
              Console output clean. No messages captured.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className={`p-1.5 rounded border text-[11px] flex items-start gap-2 font-mono leading-relaxed ${getLogStyle(log.type)}`}
              >
                <span className="opacity-50 select-none text-[10px] shrink-0 font-sans">
                  [{log.timestamp}]
                </span>
                <span className="uppercase text-[9px] font-bold px-1 rounded bg-black/40 border border-current shrink-0">
                  {log.type}
                </span>
                <pre className="whitespace-pre-wrap break-all flex-1 font-mono">{log.message}</pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
