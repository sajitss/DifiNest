import React, { useState } from 'react';
import { Lock, X, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const parts = trimmedEmail.split('@');

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setErrorMsg('Invalid email address format.');
      return;
    }

    const username = parts[0];
    const asciiSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const expectedPassword = `${username}${asciiSum}`;

    if (password.trim() === expectedPassword) {
      StorageService.setAdminToken('difinest_authenticated_admin');
      onSuccess();
    } else {
      setErrorMsg('Invalid admin credentials. Access denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <ShieldCheck size={24} />
        </div>

        <h3 className="text-center text-lg font-bold text-white mb-1">Admin Authentication</h3>
        <p className="text-center text-xs text-gray-400 mb-6">
          Sign in with your organization email and password to access administrative controls.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg(null); }}
                placeholder="Enter email address"
                required
                autoFocus
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrorMsg(null); }}
                placeholder="Enter password"
                required
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
              <ShieldAlert size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-600/20 transition-colors flex items-center justify-center gap-2"
          >
            <span>Authenticate Admin Mode</span>
          </button>
        </form>
      </div>
    </div>
  );
};
