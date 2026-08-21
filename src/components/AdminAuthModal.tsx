import React, { useState } from 'react';
import { ShieldCheck, Lock, X, KeyRound } from 'lucide-react';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin pin check (or press Enter with default 1234)
    if (pin === '1234' || pin === 'admin' || pin.trim() === '') {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <KeyRound size={22} />
        </div>

        <h3 className="text-center text-lg font-bold text-white mb-1">Unlock Admin Permissions</h3>
        <p className="text-center text-xs text-gray-400 mb-6">
          Enter Admin Security PIN to enable file uploads, application edits, and deletions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(false); }}
                placeholder="Enter PIN (Default: 1234)"
                autoFocus
                className={`w-full bg-gray-950 border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors ${
                  error ? 'border-rose-500 bg-rose-950/20' : 'border-gray-800 focus:border-amber-500'
                }`}
              />
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 mt-1 font-semibold text-center">
                Incorrect PIN. Use default "1234" or leave empty.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-600/20 transition-colors"
          >
            Authenticate Admin Mode
          </button>
        </form>
      </div>
    </div>
  );
};
