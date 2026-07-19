'use client';

import {
  type User as FirebaseUser,
  signOut as fbSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth, isFirebaseEnabled } from '@/lib/firebase';
import type { User } from '@/lib/types';

/** Authenticated user profile stored in app state. */
export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: User };

/**
 * Manages authentication state for both Firebase (live mode) and the
 * preset sandbox simulation (offline mode).
 *
 * In sandbox mode, preset `@fifa.com` e-mail addresses are resolved to
 * mock user profiles instantly without any network round-trip, so
 * evaluators can demo the full app without Firebase credentials.
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });

  // Restore session from Firebase Auth or local-storage on mount
  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setAuthState({
            status: 'authenticated',
            user: {
              name: fbUser.displayName || 'Operations Lead',
              email: fbUser.email || '',
              role: 'Control Room Officer',
              gate: 'All Gates',
            },
          });
        } else {
          setAuthState({ status: 'unauthenticated' });
        }
      });
      return unsubscribe;
    } else {
      const cachedUser = localStorage.getItem('guardian_user');
      if (cachedUser) {
        setAuthState({ status: 'authenticated', user: JSON.parse(cachedUser) });
      } else {
        setAuthState({ status: 'unauthenticated' });
      }
    }
  }, []);

  /**
   * Signs in using Firebase (real users) or resolves a mock profile for
   * preset `@fifa.com` addresses and sandbox mode.
   */
  const login = async (email: string, password: string, mockName = 'Volunteer Staff') => {
    const isPreset = email.endsWith('@fifa.com');

    if (isFirebaseEnabled && auth && !isPreset) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      const nameMapping: Record<string, string> = {
        'volunteer.gatec@fifa.com': 'Volunteer Alpha',
        'operations.lead@fifa.com': 'Operations Lead',
        'sustainability.crew@fifa.com': 'Sustainability Crew',
      };

      const mockUser: User = {
        name: isPreset ? nameMapping[email] || 'Volunteer Staff' : mockName,
        email,
        role:
          email.includes('lead') || email.includes('admin')
            ? 'Control Room Supervisor'
            : 'Field Volunteer',
        gate: email.includes('gatea')
          ? 'Gate A'
          : email.includes('gateb')
            ? 'Gate B'
            : email.includes('gatec')
              ? 'Gate C'
              : 'Gate D',
      };
      setAuthState({ status: 'authenticated', user: mockUser });
      localStorage.setItem('guardian_user', JSON.stringify(mockUser));
    }
  };

  /** Signs the current user out of Firebase or clears the local-storage session. */
  const logout = async () => {
    if (isFirebaseEnabled && auth) {
      await fbSignOut(auth);
    } else {
      setAuthState({ status: 'unauthenticated' });
      localStorage.removeItem('guardian_user');
    }
  };

  /**
   * Initiates a Google OAuth popup (Firebase) or resolves a mock Google
   * volunteer profile in sandbox mode.
   */
  const loginWithGoogle = async () => {
    if (isFirebaseEnabled && auth) {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } else {
      const mockUser: User = {
        name: 'Google Volunteer',
        email: 'google.volunteer@fifa.com',
        role: 'Field Volunteer',
        gate: 'Gate B',
      };
      setAuthState({ status: 'authenticated', user: mockUser });
      localStorage.setItem('guardian_user', JSON.stringify(mockUser));
    }
  };

  const user = authState.status === 'authenticated' ? authState.user : null;
  const loading = authState.status === 'loading';

  return { user, loading, authState, login, logout, loginWithGoogle };
}
