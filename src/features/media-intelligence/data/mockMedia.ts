import { MediaItem } from '../types/mediaIntelligence';

export const primaryDemoVideo: MediaItem = {
  id: 'vid-demo-1',
  title: 'Local AI Explained.mp4',
  type: 'video',
  duration: '08:42',
  resolution: '1080p',
  fps: 24,
  size: '420 MB',
  thumbnail: '',
  analyzedAt: 'Just now',
};

export const mockRecentFiles: MediaItem[] = [
  primaryDemoVideo,
  {
    id: 'aud-1',
    title: 'Podcast Episode 04.wav',
    type: 'audio',
    duration: '42:18',
    size: '180 MB',
    thumbnail: '',
    analyzedAt: '2 hours ago',
  },
  {
    id: 'img-1',
    title: 'Creator Setup.jpg',
    type: 'image',
    duration: 'Static',
    resolution: '4K',
    size: '8.4 MB',
    thumbnail: '',
    analyzedAt: 'Yesterday',
  },
  {
    id: 'aud-2',
    title: 'Voice Memo 12.m4a',
    type: 'audio',
    duration: '03:14',
    size: '12 MB',
    thumbnail: '',
    analyzedAt: '3 days ago',
  },
  {
    id: 'img-2',
    title: 'Studio Lighting.png',
    type: 'image',
    duration: 'Static',
    resolution: '1080p',
    size: '4.2 MB',
    thumbnail: '',
    analyzedAt: '5 days ago',
  },
];
