import { beforeEach, describe, expect, it, vi } from 'vitest';

const batchSet = vi.hoisted(() => vi.fn());
const batchCommit = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const docMock = vi.hoisted(() =>
  vi.fn((_db, collectionName: string, id: string) => `${collectionName}/${id}`),
);
const writeBatchMock = vi.hoisted(() =>
  vi.fn(() => ({
    set: batchSet,
    commit: batchCommit,
  })),
);

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  writeBatch: writeBatchMock,
}));

import { seedCollectionBatch, syncStadiumStateBatch } from '@/lib/firestoreSync';
import type { StadiumState } from '@/lib/types';

describe('Firestore sync batching', () => {
  const firestoreDb = {};

  beforeEach(() => {
    batchSet.mockClear();
    batchCommit.mockClear();
    docMock.mockClear();
    writeBatchMock.mockClear();
  });

  it('writes stadium telemetry through a single batch commit', async () => {
    const state: StadiumState = {
      gates: {
        'Gate A': {
          gate: 'Gate A',
          density: 42,
          arrival_rate: 100,
          wait_time: 5,
        },
      },
      bins: {
        'B-101': {
          bin_id: 'B-101',
          zone: 'Gate A Concourse',
          fill_level: 50,
          adjacent_density: 42,
          assigned_crew: null,
        },
      },
      concessions: {
        'C-101': {
          concession_id: 'C-101',
          name: 'Corner Kick Burgers',
          zone: 'Gate A Concourse',
          queue_length: 12,
          wait_time: 4,
          stock_level: 90,
          status: 'OPEN',
        },
      },
      weather: 'Hot & Clear (29°C)',
      nearby_medical_cases: 2,
    };

    await syncStadiumStateBatch(firestoreDb, state);

    expect(writeBatchMock).toHaveBeenCalledTimes(1);
    expect(batchSet).toHaveBeenCalledTimes(4);
    expect(batchCommit).toHaveBeenCalledTimes(1);
    expect(docMock).toHaveBeenNthCalledWith(1, firestoreDb, 'gates', 'Gate A');
    expect(docMock).toHaveBeenNthCalledWith(2, firestoreDb, 'bins', 'B-101');
    expect(docMock).toHaveBeenNthCalledWith(3, firestoreDb, 'concessions', 'C-101');
    expect(docMock).toHaveBeenNthCalledWith(4, firestoreDb, 'stadium_meta', 'general');
  });

  it('seeds a collection through one batch commit', async () => {
    await seedCollectionBatch(firestoreDb, 'gates', {
      'Gate A': { gate: 'Gate A', density: 10 },
      'Gate B': { gate: 'Gate B', density: 20 },
    });

    expect(writeBatchMock).toHaveBeenCalledTimes(1);
    expect(batchSet).toHaveBeenCalledTimes(2);
    expect(batchCommit).toHaveBeenCalledTimes(1);
    expect(docMock).toHaveBeenNthCalledWith(1, firestoreDb, 'gates', 'Gate A');
    expect(docMock).toHaveBeenNthCalledWith(2, firestoreDb, 'gates', 'Gate B');
  });
});
