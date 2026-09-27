export type CatalogAsset = {
  id: string;
  name: string;
  category: 'background' | 'overlay';
  description: string;
  url: string;
  width: number;
  height: number;
  license: 'Original / project-owned';
  version: 1;
};

// Static source assets only. Timeline effects (including animated glow) require a renderer.
export const assetCatalog: CatalogAsset[] = [
  {
    id: 'background-obsidian-grid',
    name: 'Obsidian Grid',
    category: 'background',
    description: 'Dark graphite with a quiet technical grid.',
    url: '/assets/catalog/obsidian-grid.svg',
    width: 1080,
    height: 1920,
    license: 'Original / project-owned',
    version: 1,
  },
  {
    id: 'background-midnight-glow',
    name: 'Midnight Glow',
    category: 'background',
    description: 'Soft lime light on a near-black canvas.',
    url: '/assets/catalog/midnight-glow.svg',
    width: 1080,
    height: 1920,
    license: 'Original / project-owned',
    version: 1,
  },
  {
    id: 'background-porcelain',
    name: 'Porcelain',
    category: 'background',
    description: 'Warm off-white with a subtle blue haze.',
    url: '/assets/catalog/porcelain.svg',
    width: 1080,
    height: 1920,
    license: 'Original / project-owned',
    version: 1,
  },
  {
    id: 'overlay-glow-ring',
    name: 'Glow Ring',
    category: 'overlay',
    description: 'Translucent halo for a focal point.',
    url: '/assets/catalog/glow-ring.svg',
    width: 1080,
    height: 1920,
    license: 'Original / project-owned',
    version: 1,
  },
  {
    id: 'overlay-focus-frame',
    name: 'Focus Frame',
    category: 'overlay',
    description: 'Fine corner markers with a restrained glow.',
    url: '/assets/catalog/focus-frame.svg',
    width: 1080,
    height: 1920,
    license: 'Original / project-owned',
    version: 1,
  },
  {
    id: 'overlay-soft-spotlight',
    name: 'Soft Spotlight',
    category: 'overlay',
    description: 'Dim the edges while keeping the center clear.',
    url: '/assets/catalog/soft-spotlight.svg',
    width: 1080,
    height: 1920,
    license: 'Original / project-owned',
    version: 1,
  },
];
