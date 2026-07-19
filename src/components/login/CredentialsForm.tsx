import { Lock, Mail } from 'lucide-react';
import type { FormEvent } from 'react';

interface CredentialsFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  handleLoginSubmit: (e: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

export default function CredentialsForm({
  email,
  setEmail,
  password,
  setPassword,
  handleLoginSubmit,
  loading,
}: CredentialsFormProps) {
  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4" aria-label="Login form">
      <div>
        <label
          className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
          htmlFor="email-input"
        >
          Volunteer Email
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-500" aria-hidden="true">
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
          <span className="absolute left-3 top-2.5 text-slate-500" aria-hidden="true">
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
        aria-disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg text-sm transition-all focus:outline-none shadow-lg shadow-emerald-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Authenticating...' : 'Sign In'}
      </button>
    </form>
  );
}
