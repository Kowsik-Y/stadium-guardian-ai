import { doc, type Firestore, writeBatch } from 'firebase/firestore';
import type { StadiumState } from '@/lib/types';

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
