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

/** Authenticated user profile stored in app state. */
export interface AppUser {
  name: string;
  email: string;
  role: string;
  gate: string;
}

/**
 * Manages authentication state for both Firebase (live mode) and the
 * preset sandbox simulation (offline mode).
 *
 * In sandbox mode, preset `@fifa.com` e-mail addresses are resolved to
 * mock user profiles instantly without any network round-trip, so
 * evaluators can demo the full app without Firebase credentials.
 */
export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from Firebase Auth or local-storage on mount
  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({
            name: fbUser.displayName || 'Operations Lead',
            email: fbUser.email || '',
            role: 'Control Room Officer',
            gate: 'All Gates',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      const cachedUser = localStorage.getItem('guardian_user');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
      setLoading(false);
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

      const mockUser: AppUser = {
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
      setUser(mockUser);
      localStorage.setItem('guardian_user', JSON.stringify(mockUser));
    }
  };

  /** Signs the current user out of Firebase or clears the local-storage session. */
  const logout = async () => {
    if (isFirebaseEnabled && auth) {
      await fbSignOut(auth);
    } else {
      setUser(null);
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
      const mockUser: AppUser = {
        name: 'Google Volunteer',
        email: 'google.volunteer@fifa.com',
        role: 'Field Volunteer',
        gate: 'Gate B',
      };
      setUser(mockUser);
      localStorage.setItem('guardian_user', JSON.stringify(mockUser));
    }
  };

  return { user, loading, login, logout, loginWithGoogle };
}
