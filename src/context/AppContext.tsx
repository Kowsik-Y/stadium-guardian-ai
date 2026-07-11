'use client';

import type React from 'react';
import { createContext, useContext } from 'react';
import { useAiReasoning } from '@/hooks/useAiReasoning';
import { type AppUser, useAuth } from '@/hooks/useAuth';
import { useFirestoreSync } from '@/hooks/useFirestoreSync';
import { useSimulation } from '@/hooks/useSimulation';
import { isFirebaseEnabled } from '@/lib/firebase';
import type { Incident, StadiumState } from '@/lib/types';

/** Shape of the global application context available to all child components. */
interface AppContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string, mockName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  stadiumState: StadiumState;
  incidents: Incident[];
  setStadiumState: React.Dispatch<React.SetStateAction<StadiumState>>;
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  resolveIncident: (id: string) => Promise<void>;
  triggerSimulationTick: () => void;
  simulationEnabled: boolean;
  setSimulationEnabled: (enabled: boolean) => void;
  runAiReasoningEngine: (latest?: StadiumState) => Promise<void>;
  isLiveMode: boolean;
  aiAnalyzing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Root application state provider.
 *
 * Composes four focused hooks into the single context surface consumed
 * by all pages and components:
 *
 * - `useAuth` — authentication state, login/logout handlers
 * - `useFirestoreSync` — Firestore/LocalStorage sync, incident CRUD
 * - `useSimulation` — sensor drift simulation loop
 * - `useAiReasoning` — proactive Gemini reasoning engine
 *
 * This separation of concerns keeps each hook under ~150 lines and makes
 * individual behaviours independently testable.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, login, logout, loginWithGoogle } = useAuth();

  const {
    stadiumState,
    setStadiumState,
    stadiumStateRef,
    incidents,
    addIncident,
    resolveIncident,
  } = useFirestoreSync();

  const { simulationEnabled, setSimulationEnabled, triggerSimulationTick } =
    useSimulation(setStadiumState);

  const { aiAnalyzing, runAiReasoningEngine } = useAiReasoning(stadiumState, addIncident);

  // Suppress unused-variable warnings for stadiumStateRef (consumed internally by hooks)
  void stadiumStateRef;

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        stadiumState,
        incidents,
        setStadiumState,
        addIncident,
        resolveIncident,
        triggerSimulationTick,
        simulationEnabled,
        setSimulationEnabled,
        runAiReasoningEngine,
        isLiveMode: isFirebaseEnabled,
        aiAnalyzing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to consume the global AppContext.
 * Must be called from within an `<AppProvider>` tree — throws an explanatory
 * error otherwise to aid debugging during development.
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
