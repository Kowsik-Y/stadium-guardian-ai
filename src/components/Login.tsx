'use client';

import CredentialsForm from '@/components/login/CredentialsForm';
import LoginHeader from '@/components/login/LoginHeader';
import OAuthSection from '@/components/login/OAuthSection';
import QuickTestProfiles from '@/components/login/QuickTestProfiles';
import { useLoginViewModel } from '@/hooks/useLoginViewModel';

export default function Login() {
  const { state, actions } = useLoginViewModel();
  const { email, password, loginStatus, isLiveMode } = state;
  const { setEmail, setPassword, handleGoogleSignIn, handleLoginSubmit, handleQuickLogin } =
    actions;

  const loading = loginStatus.status === 'loading';
  const error = loginStatus.status === 'error' ? loginStatus.message : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <LoginHeader />

        {error && (
          <div
            className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400 font-medium"
            aria-live="polite"
            role="alert"
          >
            {error}
          </div>
        )}

        <CredentialsForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLoginSubmit={handleLoginSubmit}
          loading={loading}
        />

        <OAuthSection handleGoogleSignIn={handleGoogleSignIn} loading={loading} />

        <QuickTestProfiles handleQuickLogin={handleQuickLogin} loading={loading} />

        <div
          className="mt-6 flex justify-center text-[10px] text-slate-500 gap-1.5 font-mono"
          aria-live="polite"
        >
          <span>Engine Status:</span>
          <span className={isLiveMode ? 'text-emerald-400 font-bold' : 'text-indigo-400 font-bold'}>
            {isLiveMode ? 'Firebase Live' : 'Sandbox Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
