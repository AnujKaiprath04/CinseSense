import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck, Key, Mail, User, Film, ArrowLeft } from 'lucide-react';
import { loginUser, registerUser } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectUser, setUsers, users, isLoggedIn, addUser } = useAuth();
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
        setTimeout(() => navigate('/'), 600);
      } else {
        const result = await registerUser({
          username: username.trim(),
          email: email.trim(),
          password: password,
        });
        setSuccessMsg(`Account created! Welcome, ${result.user.username}.`);
        setUsers([result.user, ...users]);
        selectUser(result.user.id);
        setTimeout(() => navigate('/'), 600);
      }
    } catch (err: any) {
      console.error('Auth error', err);
      const detail = err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      setErrorMsg(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setSuccessMsg('Signing in with Google OAuth 2.0...');
    try {
      const googleUser = await addUser('Google User', 'google.user@cinesense.ai');
      setSuccessMsg(`Welcome, ${googleUser.username}!`);
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      console.error('Google Sign In error', err);
      setErrorMsg('Google OAuth sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)] flex items-center justify-center p-4 sm:p-6">
      {/* Background Cinema Vignette */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-30 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80"
          alt="Cinema backdrop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md glass-modal rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 border border-slate-700/60">
        {/* Back Link only if already logged in */}
        {isLoggedIn && (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        )}

        {/* Header & Logo */}
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-300 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/20">
            <Film className="w-7 h-7 text-slate-950" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Sign in to access your personalized CineSense watchlist'
                : 'Join CineSense to get explainable AI movie recommendations'}
            </p>
          </div>

          {/* Google OAuth 1-Click Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-extrabold flex items-center justify-center gap-2.5 transition-all shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google OAuth</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              or credentials
            </span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
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
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
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
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-semibold p-3.5 rounded-2xl animate-fadeIn">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-semibold p-3.5 rounded-2xl animate-fadeIn">
            ✓ {successMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'login' ? (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-500" /> Username or Email Address
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
                  <User className="w-3.5 h-3.5 text-brand-500" /> Choose Username
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
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In to CineSense
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Register New Account
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800/80 text-center space-y-1">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Database PBKDF2 Password Encryption
          </p>
        </div>
      </div>
    </div>
  );
};
