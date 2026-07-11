'use client';

import {
  type User as FirebaseUser,
  signOut as fbSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { auth, db, isFirebaseEnabled } from '@/lib/firebase';
import { seedCollectionBatch, syncStadiumStateBatch } from '@/lib/firestoreSync';
import {
  getInitialStadiumState,
  INITIAL_BINS,
  INITIAL_CONCESSIONS,
  INITIAL_GATES,
  INITIAL_INCIDENTS,
} from '@/lib/stadiumState';
import type {
  ConcessionTelemetry,
  GateTelemetry,
  Incident,
  SmartBinTelemetry,
  StadiumState,
} from '@/lib/types';

interface AppUser {
  name: string;
  email: string;
  role: string;
  gate: string;
}

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
  runAiReasoningEngine: () => Promise<void>;
  isLiveMode: boolean;
  aiAnalyzing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stadiumStateState, setStadiumStateState] = useState<StadiumState>(
    getInitialStadiumState(),
  );
  const stadiumStateRef = useRef<StadiumState>(stadiumStateState);
  const fbWriteCounter = useRef(0);

  // Keep ref in sync with latest state so closures always see fresh data
  const stadiumState = stadiumStateState;
  useEffect(() => {
    stadiumStateRef.current = stadiumStateState;
  }, [stadiumStateState]);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [simulationEnabled, setSimulationEnabled] = useState(true);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const isLiveMode = isFirebaseEnabled;

  // Pure state updater callback
  const setStadiumState = useCallback(
    (stateOrFn: StadiumState | ((prev: StadiumState) => StadiumState)) => {
      setStadiumStateState(stateOrFn);
    },
    [],
  );

  // Synchronise state changes to LocalStorage or throttled Firestore via pure side-effect loop
  useEffect(() => {
    stadiumStateRef.current = stadiumStateState;
    if (!isFirebaseEnabled) {
      localStorage.setItem('guardian_stadium_state', JSON.stringify(stadiumStateState));
    } else if (db) {
      const firestoreDb = db;
      // Throttle: write to Firestore every 6th call (~30s at 5s tick) to avoid write storms
      fbWriteCounter.current += 1;
      if (fbWriteCounter.current % 6 === 0) {
        void syncStadiumStateBatch(firestoreDb, stadiumStateState).catch((e) =>
          console.error('Failed to sync stadium telemetry batch to Firebase:', e),
        );
      }
    }
  }, [stadiumStateState]);

  // Sync Auth State
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
      // Local storage mock auth check
      const cachedUser = localStorage.getItem('guardian_user');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
      setLoading(false);
    }
  }, []);

  // Sync Database telemetry and incidents
  useEffect(() => {
    if (isFirebaseEnabled && db) {
      // Capture non-null db once so TypeScript narrows correctly in all nested closures
      const firestoreDb = db;

      // Firestore Realtime listeners with self-healing seeds
      const unsubGates = onSnapshot(collection(firestoreDb, 'gates'), (snapshot) => {
        if (snapshot.empty) {
          void seedCollectionBatch(firestoreDb, 'gates', INITIAL_GATES).catch((e) =>
            console.error('Failed to seed gates collection:', e),
          );
          return;
        }
        const gatesData: Record<string, GateTelemetry> = {};
        snapshot.forEach((doc) => {
          gatesData[doc.id] = doc.data() as GateTelemetry;
        });
        setStadiumStateState((prev) => ({ ...prev, gates: gatesData }));
      });

      const unsubBins = onSnapshot(collection(firestoreDb, 'bins'), (snapshot) => {
        if (snapshot.empty) {
          void seedCollectionBatch(firestoreDb, 'bins', INITIAL_BINS).catch((e) =>
            console.error('Failed to seed bins collection:', e),
          );
          return;
        }
        const binsData: Record<string, SmartBinTelemetry> = {};
        snapshot.forEach((doc) => {
          binsData[doc.id] = doc.data() as SmartBinTelemetry;
        });
        setStadiumStateState((prev) => ({ ...prev, bins: binsData }));
      });

      const unsubConcessions = onSnapshot(collection(firestoreDb, 'concessions'), (snapshot) => {
        if (snapshot.empty) {
          void seedCollectionBatch(firestoreDb, 'concessions', INITIAL_CONCESSIONS).catch((e) =>
            console.error('Failed to seed concessions collection:', e),
          );
          return;
        }
        const concessionsData: Record<string, ConcessionTelemetry> = {};
        snapshot.forEach((doc) => {
          concessionsData[doc.id] = doc.data() as ConcessionTelemetry;
        });
        setStadiumStateState((prev) => ({ ...prev, concessions: concessionsData }));
      });

      const unsubMeta = onSnapshot(doc(firestoreDb, 'stadium_meta', 'general'), (snap) => {
        if (!snap.exists()) {
          setDoc(doc(firestoreDb, 'stadium_meta', 'general'), {
            weather: 'Hot & Clear (29°C)',
            nearby_medical_cases: 2,
          });
          return;
        }
        const data = snap.data();
        setStadiumStateState((prev) => ({
          ...prev,
          weather: data.weather || prev.weather,
          nearby_medical_cases:
            data.nearby_medical_cases !== undefined
              ? data.nearby_medical_cases
              : prev.nearby_medical_cases,
        }));
      });

      const unsubIncidents = onSnapshot(collection(firestoreDb, 'incidents'), (snapshot) => {
        const incidentsData: Incident[] = [];
        snapshot.forEach((doc) => {
          incidentsData.push({ ...doc.data(), id: doc.id } as Incident);
        });
        incidentsData.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setIncidents(incidentsData);
      });

      return () => {
        unsubGates();
        unsubBins();
        unsubConcessions();
        unsubMeta();
        unsubIncidents();
      };
    } else {
      // Offline local storage loading
      const cachedState = localStorage.getItem('guardian_stadium_state');
      if (cachedState) {
        try {
          setStadiumStateState(JSON.parse(cachedState));
        } catch (_) {}
      }
      const cachedIncidents = localStorage.getItem('guardian_incidents');
      if (cachedIncidents) {
        try {
          setIncidents(JSON.parse(cachedIncidents));
        } catch (_) {}
      }
    }
  }, []);

  // Login handler
  const login = async (email: string, password: string, mockName = 'Volunteer Staff') => {
    const isPreset = email.endsWith('@fifa.com');

    if (isFirebaseEnabled && auth && !isPreset) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      // Simulated Auth for presets or when Firebase is disabled
      const nameMapping: Record<string, string> = {
        'volunteer.gatec@fifa.com': 'Volunteer Alpha',
        'operations.lead@fifa.com': 'Operations Lead',
        'sustainability.crew@fifa.com': 'Sustainability Crew',
      };

      const mockUser = {
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

  // Logout handler
  const logout = async () => {
    if (isFirebaseEnabled && auth) {
      await fbSignOut(auth);
    } else {
      setUser(null);
      localStorage.removeItem('guardian_user');
    }
  };

  // Google Login handler
  const loginWithGoogle = async () => {
    if (isFirebaseEnabled && auth) {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } else {
      // Simulated Google Auth
      const mockUser = {
        name: 'Google Volunteer',
        email: 'google.volunteer@fifa.com',
        role: 'Field Volunteer',
        gate: 'Gate B',
      };
      setUser(mockUser);
      localStorage.setItem('guardian_user', JSON.stringify(mockUser));
    }
  };

  // Add Incident handler
  const addIncident = useCallback(async (newInc: Omit<Incident, 'id' | 'timestamp' | 'status'>) => {
    const freshIncident: Incident = {
      ...newInc,
      id: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
    };

    if (isFirebaseEnabled && db) {
      const firestoreDb = db;
      await addDoc(collection(firestoreDb, 'incidents'), freshIncident);
    } else {
      setIncidents((prev) => {
        const next = [freshIncident, ...prev];
        localStorage.setItem('guardian_incidents', JSON.stringify(next));
        return next;
      });
    }
  }, []);

  // Call the backend AI reasoning engine to analyze telemetry
  // Uses a ref so it always reads the latest stadiumState without stale closure
  const runAiReasoningEngine = useCallback(async () => {
    setAiAnalyzing(true);
    const latest = stadiumStateRef.current;
    try {
      const response = await fetch('/api/reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gates: latest.gates,
          bins: latest.bins,
          concessions: latest.concessions,
          weather: latest.weather,
          nearby_medical_cases: latest.nearby_medical_cases,
        }),
      });

      if (!response.ok) throw new Error('API reasoning request failed');
      const analysisResult = await response.json();

      // If a real incident is detected (not normal baseline check), add it
      if (
        analysisResult.incident_type !== 'ROUTINE' ||
        analysisResult.action_plan.recommended_action.includes('Redirect') ||
        analysisResult.action_plan.recommended_action.includes('empty') ||
        analysisResult.action_plan.recommended_action.includes('Clear')
      ) {
        await addIncident({
          incident_type: analysisResult.incident_type,
          problem: analysisResult.analysis.current_state,
          reasoning: analysisResult.analysis.predictive_reasoning,
          recommended_action: analysisResult.action_plan.recommended_action,
          confidence: analysisResult.confidence || 92,
          message_for_volunteer:
            analysisResult.broadcast_payload.staff_script ||
            analysisResult.action_plan.recommended_action,
          target_zone: analysisResult.action_plan.target_zone,
          dispatched_resource_id: analysisResult.action_plan.dispatched_resource_id,
          algorithmic_routing_priority: analysisResult.action_plan.algorithmic_routing_priority,
          broadcast_payload: analysisResult.broadcast_payload,
        });
      }
    } catch (e) {
      console.error('Failed to run AI reasoning:', e);
    } finally {
      setAiAnalyzing(false);
    }
  }, [addIncident]);

  // Resolve Incident handler
  const resolveIncident = async (id: string) => {
    if (isFirebaseEnabled && db) {
      const firestoreDb = db;
      const docRef = doc(firestoreDb, 'incidents', id);
      await updateDoc(docRef, { status: 'RESOLVED' });
    } else {
      setIncidents((prev) => {
        const next = prev.map((inc) =>
          inc.id === id ? { ...inc, status: 'RESOLVED' as const } : inc,
        );
        localStorage.setItem('guardian_incidents', JSON.stringify(next));
        return next;
      });
    }
  };

  // Dynamic simulation telemetry tick (drift sensor data)
  const triggerSimulationTick = useCallback(() => {
    setStadiumState((prev) => {
      // Drift gates
      const nextGates = { ...prev.gates };
      Object.keys(nextGates).forEach((gateName) => {
        const g = nextGates[gateName];
        // Fluctuating density and arrival rate
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const density = Math.max(10, Math.min(98, g.density + delta));

        const rateDelta = Math.floor(Math.random() * 20) - 10;
        const arrival_rate = Math.max(20, g.arrival_rate + rateDelta);

        // Calculate wait time dynamically: density of 80% with high rate creates backlog
        const wait_time = Math.max(2, Math.floor((density / 10) * (arrival_rate / 150)));

        nextGates[gateName] = {
          ...g,
          density,
          arrival_rate,
          wait_time,
        };
      });

      // Drift trash bins (fill levels grow)
      const nextBins = { ...prev.bins };
      Object.keys(nextBins).forEach((binId) => {
        const b = nextBins[binId];
        // If not assigned to crew, fill rate grows based on adjacent crowd density
        let fill_level = b.fill_level;
        let assigned_crew = b.assigned_crew;

        if (assigned_crew) {
          // Crew delta empties it gradually
          fill_level = Math.max(0, fill_level - Math.floor(Math.random() * 15) - 15);
          if (fill_level === 0) {
            assigned_crew = null; // job done
          }
        } else {
          // Bins fill faster when adjacent density is high
          const fillDelta = Math.max(1, Math.floor(b.adjacent_density / 30) + 1);
          fill_level = Math.min(100, fill_level + fillDelta);
        }

        nextBins[binId] = {
          ...b,
          fill_level,
          assigned_crew,
          adjacent_density:
            nextGates[
              b.zone.includes('Gate A')
                ? 'Gate A'
                : b.zone.includes('Gate B')
                  ? 'Gate B'
                  : b.zone.includes('Gate C')
                    ? 'Gate C'
                    : 'Gate D'
            ]?.density || b.adjacent_density,
        };
      });

      // Drift concessions (queue length, stock level, wait times)
      const nextConcessions = { ...prev.concessions };
      Object.keys(nextConcessions).forEach((conId) => {
        const c = nextConcessions[conId];
        const gateName = c.zone.includes('Gate A')
          ? 'Gate A'
          : c.zone.includes('Gate B')
            ? 'Gate B'
            : c.zone.includes('Gate C')
              ? 'Gate C'
              : 'Gate D';
        const density = nextGates[gateName]?.density || 50;

        // Queue length increases if gate density is high
        const qDelta = Math.floor(Math.random() * 5) - (density > 60 ? 1 : 3);
        const queue_length = Math.max(2, Math.min(120, c.queue_length + qDelta));

        // Wait time is roughly proportional to queue length (35 seconds per person)
        const wait_time = Math.max(1, Math.floor(queue_length * 0.35));

        // Stock levels decrease over time if open, restock if depleted
        let stock_level = c.stock_level;
        if (Math.random() > 0.7) {
          stock_level = Math.max(10, stock_level - Math.floor(Math.random() * 4) - 1);
        }
        if (stock_level < 15) {
          stock_level = 95; // restocked!
        }

        const status = queue_length > 40 ? 'BUSY' : queue_length === 0 ? 'CLOSED' : 'OPEN';

        nextConcessions[conId] = {
          ...c,
          queue_length,
          wait_time,
          stock_level,
          status,
        };
      });

      return {
        ...prev,
        gates: nextGates,
        bins: nextBins,
        concessions: nextConcessions,
      };
    });
  }, [setStadiumState]);

  // Run the simulation loop
  useEffect(() => {
    if (!simulationEnabled) return;
    const interval = setInterval(() => {
      triggerSimulationTick();
    }, 5000);
    return () => clearInterval(interval);
  }, [simulationEnabled, triggerSimulationTick]);

  const hasTriggeredAILock = useRef(false);

  // Triggers AI review when thresholds are breached
  useEffect(() => {
    // If crowd is too high or bin overflows, trigger the AI Reasoning engine proactively
    const peakCrowd = Object.values(stadiumState.gates).some((g) => g.density > 80);
    const peakBin = Object.values(stadiumState.bins).some(
      (b) => b.fill_level > 85 && !b.assigned_crew,
    );

    if (peakCrowd || peakBin) {
      if (!hasTriggeredAILock.current) {
        hasTriggeredAILock.current = true;
        const timer = setTimeout(() => {
          void runAiReasoningEngine().catch((e) =>
            console.error('Failed to run proactive AI reasoning:', e),
          );
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset lock once all systems are back within normal operating parameters
      hasTriggeredAILock.current = false;
    }
  }, [stadiumState.gates, stadiumState.bins, runAiReasoningEngine]);

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
        isLiveMode,
        aiAnalyzing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
