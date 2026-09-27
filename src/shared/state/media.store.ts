import { useState, useEffect } from 'react';
import { storage } from '@/utils/storage';

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  mediaId?: string;
  duration?: number;
  size?: number;
  createdAt: string;
}

const INITIAL_ASSETS: MediaAsset[] = [];

// Only the old sample fixtures used these ids; keep every user-imported asset.
const sampleAssetIds = new Set(['m1', 'm2', 'm3', 'm4']);
const isSyntheticAsset = (asset: MediaAsset) =>
  sampleAssetIds.has(asset.id) && /^\/assets\/[^/?#]+\.jpg(?:[?#]|$)/i.test(asset.url);
let assets: MediaAsset[] = storage.load<MediaAsset[]>('media_assets', INITIAL_ASSETS)
  .filter((asset) => !isSyntheticAsset(asset));
const listeners = new Set<() => void>();

function notify() {
  storage.save('media_assets', assets);
  listeners.forEach((l) => l());
}

export const mediaStore = {
  getAssets: () => assets,
  addAsset: (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => {
    const newAsset: MediaAsset = {
      ...asset,
      id: `asset_${Date.now()}`,
      createdAt: 'Just now',
    };
    assets = [newAsset, ...assets];
    notify();
    return newAsset;
  },
  removeAsset: (id: string) => {
    assets = assets.filter((a) => a.id !== id);
    notify();
  },
};

export function useMediaStore() {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const update = () => setVersion((v) => v + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    assets,
    addAsset: mediaStore.addAsset,
    removeAsset: mediaStore.removeAsset,
  };
}
