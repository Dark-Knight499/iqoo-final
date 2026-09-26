import { Trend } from '../types/creatorIntelligence';

export const mockTrends: Trend[] = [
  {
    id: 't1',
    title: 'AI Agents',
    description: 'Autonomous AI systems executing multi-step workflows without human intervention.',
    region: ['global', 'foryou', 'india'],
    category: 'Technology',
    growth: 52.4,
    relatedContentIds: ['c1', 'c2'],
    relatedTopics: ['Agentic Workflows', 'Multi-Agent Systems'],
    postCount: 145000
  },
  {
    id: 't2',
    title: 'On-device AI',
    description: 'Running complex LLMs directly on smartphones and laptops for privacy and zero latency.',
    region: ['global', 'india', 'hyderabad'],
    category: 'Hardware',
    growth: 45.1,
    relatedContentIds: ['c3', 'c4'],
    relatedTopics: ['Edge AI', 'NPU Inference', 'AI Phones'],
    postCount: 89000
  },
  {
    id: 't3',
    title: 'AI Video Generation',
    description: 'Text-to-video models generating hyper-realistic cinematic content.',
    region: ['global', 'foryou'],
    category: 'Creative',
    growth: 38.7,
    relatedContentIds: ['c5', 'c6'],
    relatedTopics: ['Video AI', 'Stable Diffusion'],
    postCount: 210000
  },
  {
    id: 't4',
    title: 'Creator Economy',
    description: 'New monetization models for digital creators independent of ad revenue.',
    region: ['global', 'india', 'myniche'],
    category: 'Business',
    growth: 22.5,
    relatedContentIds: ['c7', 'c8'],
    relatedTopics: ['Creator Monetization'],
    postCount: 345000
  },
  {
    id: 't5',
    title: 'Spatial Computing',
    description: 'Augmented and virtual reality integrating digital elements with the physical world.',
    region: ['global'],
    category: 'Technology',
    growth: 18.2,
    relatedContentIds: ['c9', 'c10'],
    relatedTopics: ['AI Wearables'],
    postCount: 125000
  },
  {
    id: 't6',
    title: 'Voice Cloning',
    description: 'Highly accurate text-to-speech models replicating human voices with emotion.',
    region: ['global', 'foryou'],
    category: 'Audio',
    growth: 41.9,
    relatedContentIds: ['c11', 'c12'],
    relatedTopics: ['Whisper'],
    postCount: 76000
  },
  {
    id: 't7',
    title: 'AI Music',
    description: 'Generative models creating full songs, beats, and backing tracks from prompts.',
    region: ['global', 'india'],
    category: 'Audio',
    growth: 34.5,
    relatedContentIds: ['c13', 'c14'],
    relatedTopics: [],
    postCount: 198000
  },
  {
    id: 't8',
    title: 'Short-form Strategy',
    description: 'Optimizing hooks and retention for sub-60 second vertical video content.',
    region: ['global', 'india', 'myniche'],
    category: 'Marketing',
    growth: 15.3,
    relatedContentIds: ['c15', 'c16'],
    relatedTopics: ['Creator Monetization'],
    postCount: 560000
  },
  {
    id: 't9',
    title: 'AI Coding',
    description: 'Using LLMs and specialized agents to write, debug, and refactor code.',
    region: ['global', 'india', 'hyderabad'],
    category: 'Development',
    growth: 48.6,
    relatedContentIds: ['c17', 'c18'],
    relatedTopics: ['Computer Use', 'MCP Protocol'],
    postCount: 234000
  },
  {
    id: 't10',
    title: 'Robotics',
    description: 'Humanoid robots and automated systems integrating with advanced AI brains.',
    region: ['global'],
    category: 'Hardware',
    growth: 29.8,
    relatedContentIds: ['c19', 'c20'],
    relatedTopics: ['Edge AI'],
    postCount: 112000
  }
];
