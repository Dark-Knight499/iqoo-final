import { 
  MetricSummary, 
  TranscriptSegment, 
  SceneData, 
  LLMUnderstandingData 
} from '../types/mediaIntelligence';

export const mockMetrics: MetricSummary = {
  duration: '08:42',
  scenesCount: 12,
  speakersCount: 2,
  objectsCount: 18,
  topicsCount: 7,
  momentsCount: 6,
};

export const mockTranscript: TranscriptSegment[] = [
  {
    id: 'tr-1',
    timestamp: '00:00',
    speaker: 'Speaker 1 (Harsh)',
    text: 'AI is changing how we build software, but something even bigger is happening right under our noses.',
  },
  {
    id: 'tr-2',
    timestamp: '00:18',
    speaker: 'Speaker 1 (Harsh)',
    text: 'Most people think you need a million-dollar cloud cluster to run useful neural networks. That was true last year.',
  },
  {
    id: 'tr-3',
    timestamp: '00:45',
    speaker: 'Speaker 1 (Harsh)',
    text: 'Look at this phone right here. It has a dedicated neural processing unit capable of 45 TOPS of integer inference.',
  },
  {
    id: 'tr-4',
    timestamp: '01:12',
    speaker: 'Speaker 2 (Guest)',
    text: 'When you eliminate the round-trip latency to a server in Virginia, the user experience completely transforms.',
  },
  {
    id: 'tr-5',
    timestamp: '01:42',
    speaker: 'Speaker 1 (Harsh)',
    text: 'Local AI is going to change mobile computing forever. Everything from live speech transcription to real-time portrait reframing happens in airplane mode.',
  },
  {
    id: 'tr-6',
    timestamp: '02:18',
    speaker: 'Speaker 1 (Harsh)',
    text: 'The important part is privacy and zero marginal inference costs. As creators, we can ship models directly to audience devices.',
  },
  {
    id: 'tr-7',
    timestamp: '03:05',
    speaker: 'Speaker 1 (Harsh)',
    text: 'Let us benchmark the latency between a cloud API call and on-device execution right now.',
  },
  {
    id: 'tr-8',
    timestamp: '04:20',
    speaker: 'Speaker 2 (Guest)',
    text: 'Notice that instant response? Zero buffering, zero waiting in a queue.',
  },
];

export const mockScenes: SceneData[] = [
  {
    id: 'sc-1',
    sceneNumber: 'Scene 01',
    timestampRange: '00:00–00:42',
    visualType: 'Talking head',
    location: 'Studio Office',
    description: 'Creator directly addressing camera with dramatic dark studio lighting and microphone.',
  },
  {
    id: 'sc-2',
    sceneNumber: 'Scene 02',
    timestampRange: '00:42–01:38',
    visualType: 'Product demonstration',
    location: 'Desk Setup',
    description: 'Top-down desk shot demonstrating smartphone running local neural model next to laptop.',
  },
  {
    id: 'sc-3',
    sceneNumber: 'Scene 03',
    timestampRange: '01:38–02:41',
    visualType: 'Explanation & Benchmarks',
    location: 'Talking head & Split Screen',
    description: 'Side-by-side benchmark comparison between cloud API and on-device NPU response rates.',
  },
  {
    id: 'sc-4',
    sceneNumber: 'Scene 04',
    timestampRange: '02:41–04:10',
    visualType: 'Software screen capture',
    location: 'Phone Screen Macro',
    description: 'Extreme close-up of real-time offline transcription running in airplane mode.',
  },
  {
    id: 'sc-5',
    sceneNumber: 'Scene 05',
    timestampRange: '04:10–05:55',
    visualType: 'Guest dialogue',
    location: 'Two-shot Studio',
    description: 'Dialogue discussing privacy, local data storage, and eliminating recurring subscription fees.',
  },
  {
    id: 'sc-6',
    sceneNumber: 'Scene 06',
    timestampRange: '05:55–08:42',
    visualType: 'Outro & Call to Action',
    location: 'Studio Wide',
    description: 'Creator summarizing takeaways, pointing to local studio tools, and closing.',
  },
];

export const mockObjects: string[] = [
  'Person',
  'Laptop',
  'Phone',
  'Microphone',
  'Desk',
  'Camera',
  'Monitor',
  'Keyboard',
  'Mouse',
  'Headphones',
  'Notebook',
  'Pen',
  'Cup',
  'Light',
  'Tripod',
  'Window',
  'Bookshelf',
  'Cable',
];

export const mockTopics: string[] = [
  'AI',
  'Local AI',
  'Mobile Computing',
  'Creator Economy',
  'NPU',
  'Privacy',
  'Snapdragon',
];

export const mockEntities: string[] = [
  'iQOO',
  'Snapdragon',
  'AI',
  'Phone',
  'NPU',
  'Qualcomm',
  'Android',
  'Whisper',
];

export const mockKeyMoments = [
  { timestamp: '00:12', label: 'High retention hook', type: 'Hook' },
  { timestamp: '00:48', label: 'Hardware reveal & NPU mention', type: 'Product' },
  { timestamp: '01:42', label: 'Local AI thesis statement', type: 'Key Thesis' },
  { timestamp: '02:18', label: 'Zero latency advantage explained', type: 'Insight' },
  { timestamp: '03:15', label: 'Live benchmark demonstration', type: 'Demo' },
  { timestamp: '07:30', label: 'Concluding actionable advice', type: 'CTA' },
];

export const mockLLMUnderstanding: LLMUnderstandingData = {
  summary:
    'This video explains how on-device AI chips and local small language models could fundamentally change mobile computing and creator workflows by removing cloud latency, subscription fees, and privacy concerns.',
  keyThemes: ['Local AI', 'Privacy & Security', 'Mobile Edge Computing', 'NPU Acceleration'],
  contentStructure: ['Hook (0:00)', 'Problem Statement (0:18)', 'Hardware Breakdown (0:45)', 'Airplane Mode Demo (1:42)', 'Economic Takeaway (2:18)'],
  creatorStyle: ['Technical yet accessible', 'Conversational delivery', 'Fast-paced editing', 'High information density'],
};
