'use client';

import { addDoc, collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db, isFirebaseEnabled } from '@/lib/firebase';
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

/**
 * Manages Firestore / LocalStorage synchronisation for all stadium telemetry
 * (gates, bins, concessions, incidents, and stadium metadata).
 *
 * In **live mode** (Firebase configured), Firestore `onSnapshot` listeners
 * stream real-time updates to the UI and self-heal empty collections by
 * re-seeding from the canonical initial state.
 *
 * In **sandbox mode** (no Firebase), state is persisted to and restored from
 * `localStorage` so the app works fully offline — important for stadium
 * environments with poor connectivity.
 *
 * Firestore writes are throttled to every 6th simulation tick (~30 s at a
 * 5-second tick rate) to stay well within Firestore's free-tier write quotas.
 */
export function useFirestoreSync() {
  const [stadiumState, setStadiumState] = useState<StadiumState>(getInitialStadiumState());
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const stadiumStateRef = useRef<StadiumState>(stadiumState);
  const fbWriteCounter = useRef(0);

  // Keep ref in sync so closures in callbacks always read fresh state
  useEffect(() => {
    stadiumStateRef.current = stadiumState;
  }, [stadiumState]);

  // Persist state changes to LocalStorage or throttled Firestore
  useEffect(() => {
    stadiumStateRef.current = stadiumState;
    if (!isFirebaseEnabled) {
      localStorage.setItem('guardian_stadium_state', JSON.stringify(stadiumState));
    } else if (db) {
      const firestoreDb = db;
      fbWriteCounter.current += 1;
      if (fbWriteCounter.current % 6 === 0) {
        void syncStadiumStateBatch(firestoreDb, stadiumState).catch((e) =>
          console.error('Failed to sync stadium telemetry batch to Firebase:', e),
        );
      }
    }
  }, [stadiumState]);

  // Firestore realtime listeners or LocalStorage restore on mount
  useEffect(() => {
    if (isFirebaseEnabled && db) {
      const firestoreDb = db;

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
        setStadiumState((prev) => ({ ...prev, gates: gatesData }));
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
        setStadiumState((prev) => ({ ...prev, bins: binsData }));
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
        setStadiumState((prev) => ({ ...prev, concessions: concessionsData }));
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
        setStadiumState((prev) => ({
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
      const cachedState = localStorage.getItem('guardian_stadium_state');
      if (cachedState) {
        try {
          setStadiumState(JSON.parse(cachedState));
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

  /**
   * Adds a new incident to Firestore (live mode) or local-storage (sandbox).
   * Auto-assigns a unique `id`, `timestamp`, and `status: "ACTIVE"`.
   */
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

  /**
   * Marks an incident as RESOLVED in Firestore or local-storage.
   * Does not delete the record — resolved incidents remain visible in the
   * Operations Analytics page for post-match review.
   */
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

  return {
    stadiumState,
    setStadiumState,
    stadiumStateRef,
    incidents,
    addIncident,
    resolveIncident,
  };
}
