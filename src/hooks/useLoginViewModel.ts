import type React from 'react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export type LoginStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string };

export function useLoginViewModel() {
  const { login, loginWithGoogle, isLiveMode } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState<LoginStatus>({ status: 'idle' });

  const handleGoogleSignIn = async () => {
    setLoginStatus({ status: 'loading' });
    try {
      await loginWithGoogle();
      // On success, the parent component will re-render and unmount this one
    } catch (err: unknown) {
      console.error('[Login] Google sign-in failed:', err);
      setLoginStatus({
        status: 'error',
        message: err instanceof Error ? err.message : 'Google sign in failed.',
      });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginStatus({ status: 'error', message: 'Please fill in all credentials.' });
      return;
    }
    setLoginStatus({ status: 'loading' });
    try {
      await login(email, password);
    } catch (err: unknown) {
      console.error('[Login] Email/password sign-in failed:', err);
      setLoginStatus({
        status: 'error',
        message:
          err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.',
      });
    }
  };

  const handleQuickLogin = async (profileEmail: string, profileName: string) => {
    setLoginStatus({ status: 'loading' });
    try {
      await login(profileEmail, 'password123', profileName);
    } catch (err: unknown) {
      console.error('[Login] Quick-access login failed:', err);
      setLoginStatus({ status: 'error', message: 'Quick login failed.' });
    }
  };

  return {
    state: {
      email,
      password,
      loginStatus,
      isLiveMode,
    },
    actions: {
      setEmail,
      setPassword,
      handleGoogleSignIn,
      handleLoginSubmit,
      handleQuickLogin,
    },
  };
}
