export const bookmarkService = {
  _bookmarks: new Set<string>(),

  getAll(): string[] {
    return Array.from(this._bookmarks);
  },

  isBookmarked(contentId: string): boolean {
    return this._bookmarks.has(contentId);
  },

  toggle(contentId: string): boolean {
    if (this._bookmarks.has(contentId)) {
      this._bookmarks.delete(contentId);
    } else {
      this._bookmarks.add(contentId);
    }
    return this._bookmarks.has(contentId);
  }
};
