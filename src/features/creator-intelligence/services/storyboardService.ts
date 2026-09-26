import { StoryboardItem } from '../types/creatorIntelligence';

export const storyboardService = {
  _items: [] as StoryboardItem[],

  getItems(): StoryboardItem[] {
    return [...this._items];
  },

  add(contentId: string, note?: string): StoryboardItem {
    const newItem: StoryboardItem = {
      id: `storyboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      note,
      addedAt: Date.now()
    };
    this._items.push(newItem);
    return newItem;
  },

  remove(itemId: string): void {
    this._items = this._items.filter(item => item.id !== itemId);
  },

  reorder(itemIds: string[]): void {
    const itemMap = new Map(this._items.map(item => [item.id, item]));
    this._items = itemIds.map(id => itemMap.get(id)).filter(Boolean) as StoryboardItem[];
  },

  clear(): void {
    this._items = [];
  },

  getCount(): number {
    return this._items.length;
  }
};
