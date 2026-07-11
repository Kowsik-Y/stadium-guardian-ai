import { doc, type Firestore, writeBatch } from 'firebase/firestore';
import type { StadiumState } from '@/lib/types';

/**
 * Seeds an entire Firestore collection from an in-memory record map using a
 * single atomic batch write.
 *
 * This is used for self-healing: when a Firestore `onSnapshot` listener
 * receives an empty collection (e.g. first deployment or accidental deletion),
 * it immediately re-seeds from the canonical initial state rather than
 * rendering a blank dashboard.
 *
 * @param firestoreDb - Active Firestore instance.
 * @param collectionName - Target collection name (e.g. `"gates"`, `"bins"`).
 * @param records - Record keyed by document ID to values of type T.
 * @returns Promise resolving when the batch commit completes.
 */
export function seedCollectionBatch<T extends object>(
  firestoreDb: Firestore,
  collectionName: string,
  records: Record<string, T>,
) {
  const batch = writeBatch(firestoreDb);

  Object.entries(records).forEach(([recordId, record]) => {
    batch.set(doc(firestoreDb, collectionName, recordId), record);
  });

  return batch.commit();
}

/**
 * Syncs the full stadium telemetry state to Firestore using a single batch
 * write, touching gates, bins, concessions, and stadium metadata atomically.
 *
 * Designed to be called on a throttled cadence (every ~30 s) from the
 * simulation loop to avoid Firestore write quotas under high-frequency
 * sensor drift updates.
 *
 * @param firestoreDb - Active Firestore instance.
 * @param nextState - The current complete StadiumState snapshot to persist.
 * @returns Promise resolving when the batch commit completes.
 */
export function syncStadiumStateBatch(firestoreDb: Firestore, nextState: StadiumState) {
  const batch = writeBatch(firestoreDb);

  Object.entries(nextState.gates).forEach(([gateId, gate]) => {
    batch.set(doc(firestoreDb, 'gates', gateId), gate);
  });

  Object.entries(nextState.bins).forEach(([binId, bin]) => {
    batch.set(doc(firestoreDb, 'bins', binId), bin);
  });

  Object.entries(nextState.concessions || {}).forEach(([concessionId, concession]) => {
    batch.set(doc(firestoreDb, 'concessions', concessionId), concession);
  });

  batch.set(doc(firestoreDb, 'stadium_meta', 'general'), {
    weather: nextState.weather,
    nearby_medical_cases: nextState.nearby_medical_cases,
  });

  return batch.commit();
}
