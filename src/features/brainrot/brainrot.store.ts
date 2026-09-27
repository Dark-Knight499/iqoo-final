import { useEffect, useState } from 'react';
import { storage } from '@/utils/storage';

export interface BrainrotShort {
  id: string;
  taskId: string;
  topic: string;
  script: string;
  voice: string;
  /** Engine-relative media path, e.g. /tasks/<id>/final-1.mp4 */
  relativePath: string;
  createdAt: number;
}

const STORAGE_KEY = 'brainrot_shorts';
// Rendered files stay on the engine, so keep only recent entries in browser storage.
const MAX_SHORTS = 24;

let shorts: BrainrotShort[] = storage.load<BrainrotShort[]>(STORAGE_KEY, []);
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function persist() {
  storage.save(STORAGE_KEY, shorts);
}

export const brainrotStore = {
  getShorts: () => shorts,

  addShort: (entry: BrainrotShort) => {
    // Re-rendering the same task should update its card, not duplicate it.
    shorts = [entry, ...shorts.filter((item) => item.taskId !== entry.taskId)].slice(0, MAX_SHORTS);
    persist();
    notify();
  },

  removeShort: (id: string) => {
    shorts = shorts.filter((item) => item.id !== id);
    persist();
    notify();
  },

  clear: () => {
    shorts = [];
    persist();
    notify();
  },
};

export function useBrainrotStore() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const update = () => setVersion((version) => version + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    shorts,
    addShort: brainrotStore.addShort,
    removeShort: brainrotStore.removeShort,
    clear: brainrotStore.clear,
  };
}
