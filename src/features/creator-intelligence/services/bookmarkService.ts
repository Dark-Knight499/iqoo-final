import { storage } from '@/utils/storage';
import { creatorStore } from '@/shared/state/creator.store';

let owner = '';
const key = (id: string) => `ci_bookmarks_${encodeURIComponent(id)}`;
const load = (): string[] => {
  const id = creatorStore.get().id;
  if (!id) return [];
  const saved = storage.load<string[] | null>(key(id), null);
  if (Array.isArray(saved)) return saved;
  if (id !== creatorStore.getLegacyOwnerId()) return [];
  const legacy = storage.load<string[]>('ci_bookmarks', []);
  const items = Array.isArray(legacy) ? legacy : [];
  storage.save(key(id), items);
  return items;
};

export const bookmarkService = {
  _bookmarks: new Set<string>(),
  reload(): void {
    owner = creatorStore.get().id;
    this._bookmarks = new Set(load());
  },
  ensureOwner(): void {
    if (owner !== creatorStore.get().id) this.reload();
  },

  getAll(): string[] {
    this.ensureOwner();
    return Array.from(this._bookmarks);
  },

  isBookmarked(contentId: string): boolean {
    this.ensureOwner();
    return this._bookmarks.has(contentId);
  },

  toggle(contentId: string): boolean {
    this.ensureOwner();
    if (!owner) return false;
    if (this._bookmarks.has(contentId)) {
      this._bookmarks.delete(contentId);
    } else {
      this._bookmarks.add(contentId);
    }
    storage.save(key(owner), this.getAll());
    return this._bookmarks.has(contentId);
  }
};
