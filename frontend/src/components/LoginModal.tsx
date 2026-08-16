import React, { useState } from 'react';
import { X, LogIn, UserPlus, ShieldCheck, Sparkles, Key, Mail, User } from 'lucide-react';
import { loginUser, registerUser } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { selectUser, setUsers, users } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await loginUser({
          email_or_username: identifier,
          password: password,
        });
        setSuccessMsg(`Welcome back, ${result.user.username}!`);
        if (!users.some((u) => u.id === result.user.id)) {
          setUsers([result.user, ...users]);
        }
        selectUser(result.user.id);
        setTimeout(() => onClose(), 1000);
      } else {
        const result = await registerUser({
          username: username.trim(),
          email: email.trim(),
          password: password,
        });
        setSuccessMsg(`Account created! Welcome, ${result.user.username}.`);
        setUsers([result.user, ...users]);
        selectUser(result.user.id);
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      console.error('Auth error', err);
      const detail = err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      setErrorMsg(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-700/60">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Tabs */}
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-300 mx-auto flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Sign In to CineSense' : 'Create Account'}
          </h2>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-semibold p-3.5 rounded-2xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-semibold p-3.5 rounded-2xl">
            ✓ {successMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'login' ? (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-500" /> Username or Email
              </label>
              <input
                type="text"
                required
                placeholder="e.g. alex@cinesense.ai"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand-500" /> Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CinemaMaster"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-brand-500" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. cinemamaster@cinesense.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-brand-500" /> Password
            </label>
            <input
              type="password"
              required
              minLength={4}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Register Account
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Database-backed PBKDF2 HMAC Password Encryption
          </p>
        </div>
      </div>
    </aside>
  );
};
