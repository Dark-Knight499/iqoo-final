import { StoryboardItem } from '../types/creatorIntelligence';
import { storage } from '@/utils/storage';
import { creatorStore } from '@/shared/state/creator.store';

let owner = '';
const key = (id: string) => `ci_storyboard_${encodeURIComponent(id)}`;
const load = (): StoryboardItem[] => {
  const id = creatorStore.get().id;
  if (!id) return [];
  const saved = storage.load<StoryboardItem[] | null>(key(id), null);
  if (Array.isArray(saved)) return saved;
  if (id !== creatorStore.getLegacyOwnerId()) return [];
  const legacy = storage.load<StoryboardItem[]>('ci_storyboard', []);
  const items = Array.isArray(legacy) ? legacy : [];
  storage.save(key(id), items);
  return items;
};

export const storyboardService = {
  _items: [] as StoryboardItem[],
  reload(): void {
    owner = creatorStore.get().id;
    this._items = load();
  },
  ensureOwner(): void {
    if (owner !== creatorStore.get().id) this.reload();
  },

  getItems(): StoryboardItem[] {
    this.ensureOwner();
    return [...this._items];
  },

  add(contentId: string, note?: string): StoryboardItem {
    this.ensureOwner();
    if (!owner) throw new Error('Save a creator workspace before adding storyboard items.');
    const newItem: StoryboardItem = {
      id: `storyboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      note,
      addedAt: Date.now()
    };
    this._items.push(newItem);
    storage.save(key(owner), this._items);
    return newItem;
  },

  remove(itemId: string): void {
    this.ensureOwner();
    if (!owner) return;
    this._items = this._items.filter(item => item.id !== itemId);
    storage.save(key(owner), this._items);
  },

  reorder(itemIds: string[]): void {
    this.ensureOwner();
    if (!owner) return;
    const itemMap = new Map(this._items.map(item => [item.id, item]));
    this._items = itemIds.map(id => itemMap.get(id)).filter(Boolean) as StoryboardItem[];
    storage.save(key(owner), this._items);
  },

  clear(): void {
    this.ensureOwner();
    if (!owner) return;
    this._items = [];
    storage.save(key(owner), this._items);
  },

  getCount(): number {
    this.ensureOwner();
    return this._items.length;
  }
};
