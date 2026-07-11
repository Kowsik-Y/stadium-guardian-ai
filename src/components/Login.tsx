'use client';

import { Lock, Mail, Shield, Users } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, loginWithGoogle, isLiveMode } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error('[Login] Google sign-in failed:', err);
      setError(err instanceof Error ? err.message : 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      console.error('[Login] Email/password sign-in failed:', err);
      setError(
        err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (profileEmail: string, profileName: string) => {
    setError('');
    setLoading(true);
    try {
      await login(profileEmail, 'password123', profileName);
    } catch (err: unknown) {
      console.error('[Login] Quick-access login failed:', err);
      setError('Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const PRESETS = [
    { name: 'Volunteer Alpha (Gate C)', email: 'volunteer.gatec@fifa.com', icon: '[VOL]' },
    { name: 'Operations Lead (Control Room)', email: 'operations.lead@fifa.com', icon: '[OPS]' },
    { name: 'Sustainability Crew (Gate A)', email: 'sustainability.crew@fifa.com', icon: '[SST]' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Stadium Guardian AI</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Smart Operations Assistant & Risk Mitigation Suite for Tournament Spectator Safety
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
              htmlFor="email-input"
            >
              Volunteer Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="volunteer@stadium.com"
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
              htmlFor="password-input"
            >
              Access Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-600 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg text-sm transition-all focus:outline-none shadow-lg shadow-emerald-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-mono text-[9px]">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-350 hover:text-slate-200 font-medium rounded-lg text-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="h-4 w-4 mr-1"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Google Credentials
          </button>
        </form>

        {/* Quick Access Presets (Especially valuable for Sandbox review) */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-4 justify-center sm:justify-start">
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">
              Quick Test Profiles (Sandbox Fallback)
            </span>
          </div>

          <div className="space-y-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleQuickLogin(preset.email, preset.name)}
                disabled={loading}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-850 hover:border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-medium transition-all duration-200"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-[10px] font-mono font-semibold text-slate-500">
                    {preset.icon}
                  </span>
                  <div className="text-left">
                    <p className="font-semibold text-[11px]">{preset.name}</p>
                    <p className="text-[9px] text-slate-500 font-mono leading-none">
                      {preset.email}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase font-mono font-bold">
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center text-[10px] text-slate-500 gap-1.5 font-mono">
          <span>Engine Status:</span>
          <span className={isLiveMode ? 'text-emerald-400 font-bold' : 'text-indigo-400 font-bold'}>
            {isLiveMode ? 'Firebase Live' : 'Sandbox Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
