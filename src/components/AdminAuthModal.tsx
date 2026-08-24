import React, { useState } from 'react';
import { Lock, X, Mail, ShieldAlert, Loader2, ShieldCheck } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface AdminAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Store stateless JWT token
      if (data.token) {
        StorageService.setAdminToken(data.token);
      }

      setIsLoading(false);
      onSuccess();
    } catch (err) {
      setErrorMsg('Could not reach authentication server. Please ensure backend is running.');
      setIsLoading(false);
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
          Sign in with your organization email and algorithmic password token to access administrative controls.
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
                placeholder="e.g. saji@difinative.com"
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
                placeholder="e.g. saji423"
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

          <div className="p-2.5 bg-blue-950/30 border border-blue-800/40 rounded-xl text-blue-300/90 text-[11px] leading-relaxed">
            <span className="font-semibold text-blue-300">Security Rule:</span> Password is verified on backend via dynamic ASCII token formula (username + ASCII sum).
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-600/20 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Authenticate Admin Mode</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
