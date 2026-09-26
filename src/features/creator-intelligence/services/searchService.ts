import { mockTrends } from '../data/mockTrends';
import { mockCreators } from '../data/mockCreators';
import { mockVideos, mockReels } from '../data/mockContent';
import { mockTopics } from '../data/mockTopics';
import { 
  Trend, 
  DiscoverCreator, 
  ContentItem, 
  Topic 
} from '../types/creatorIntelligence';

export interface SearchResults {
  trends: Trend[];
  creators: DiscoverCreator[];
  videos: ContentItem[];
  reels: ContentItem[];
  topics: Topic[];
}

export const searchService = {
  search(query: string): SearchResults {
    const q = query.trim().toLowerCase();
    
    if (!q) {
      return {
        trends: mockTrends,
        creators: mockCreators,
        videos: mockVideos,
        reels: mockReels,
        topics: mockTopics
      };
    }

    return {
      trends: mockTrends.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.relatedTopics.some(topic => topic.toLowerCase().includes(q))
      ),
      creators: mockCreators.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.handle.toLowerCase().includes(q) ||
        c.niche.toLowerCase().includes(q) ||
        c.platform.toLowerCase().includes(q)
      ),
      videos: mockVideos.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.creatorName.toLowerCase().includes(q) || 
        v.platform.toLowerCase().includes(q) ||
        v.topics.some(topic => topic.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q))
      ),
      reels: mockReels.filter(r => 
        r.title.toLowerCase().includes(r.title ? q : '') || 
        r.creatorName.toLowerCase().includes(q) || 
        r.platform.toLowerCase().includes(q) ||
        r.topics.some(topic => topic.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
      ),
      topics: mockTopics.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      )
    };
  }
};
