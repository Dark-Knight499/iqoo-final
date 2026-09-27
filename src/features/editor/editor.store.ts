import { useState, useEffect } from 'react';

export type EditorPanel = null | 'cut' | 'effects' | 'audio' | 'captions' | 'reframe' | 'highlights';

export type EffectPresetId =
  | 'none'
  | 'cinematic_dark'
  | 'vintage_kodak'
  | 'studio_light'
  | 'hyper_vibrant'
  | 'noir_bw'
  | 'soft_dream';

export interface EffectPreset {
  id: EffectPresetId;
  name: string;
  category: 'Color Grade' | 'Lighting' | 'Film Emulation' | 'Artistic' | 'Normal';
  description: string;
  filterCss: string;
  badgeColor: string;
}

export const EFFECT_PRESETS: EffectPreset[] = [
  {
    id: 'none',
    name: 'Natural (No Filter)',
    category: 'Normal',
    description: 'Original unaltered source video color and lighting.',
    filterCss: 'none',
    badgeColor: '#64748B',
  },
  {
    id: 'cinematic_dark',
    name: 'Cyber Cinematic Dark',
    category: 'Color Grade',
    description: 'Crushed blacks, high micro-contrast, vibrant lime highlights for tech content.',
    filterCss: 'contrast(130%) brightness(92%) saturate(125%) hue-rotate(-5deg)',
    badgeColor: '#D8FF00',
  },
  {
    id: 'studio_light',
    name: 'Studio Key Light',
    category: 'Lighting',
    description: 'Softens facial shadows with simulated 3-point diffused lighting.',
    filterCss: 'brightness(108%) contrast(105%) sepia(12%) saturate(110%)',
    badgeColor: '#38BDF8',
  },
  {
    id: 'vintage_kodak',
    name: 'Kodak 250D 16mm',
    category: 'Film Emulation',
    description: 'Warm analog highlights, organic film tone, and gentle contrast roll-off.',
    filterCss: 'sepia(35%) contrast(115%) brightness(95%) saturate(85%)',
    badgeColor: '#F59E0B',
  },
  {
    id: 'hyper_vibrant',
    name: 'Hyper Pop Glow',
    category: 'Color Grade',
    description: 'Maximized color pop and saturation for lifestyle and product showcases.',
    filterCss: 'saturate(170%) contrast(110%) brightness(102%)',
    badgeColor: '#EC4899',
  },
  {
    id: 'noir_bw',
    name: 'Dramatic Noir Monochrome',
    category: 'Artistic',
    description: 'Timeless high-contrast black and white with deep shadow depth.',
    filterCss: 'grayscale(100%) contrast(145%) brightness(95%)',
    badgeColor: '#E2E8F0',
  },
  {
    id: 'soft_dream',
    name: 'Soft Pastel Haze',
    category: 'Artistic',
    description: 'Dreamy low-contrast diffusion ideal for storytelling and aesthetic vlogs.',
    filterCss: 'brightness(110%) contrast(92%) saturate(118%) blur(0.4px)',
    badgeColor: '#A855F7',
  },
];

export interface EditorState {
  currentTime: number;
  isPlaying: boolean;
  activePanel: EditorPanel;
  zoomLevel: number;
  selectedClipId: string | null;
  aspectRatio: '9:16' | '16:9' | '1:1';
  hasCaptions: boolean;
  captionStyle: 'tiktok_yellow' | 'minimal_white' | 'neon_cyber';
  customCaptionText: string;
  audioNoiseReduction: boolean;
  audioVolume: number;
  isMuted: boolean;
  playbackRate: number;
  // Live Visual Effects
  selectedEffect: EffectPresetId;
  brightness: number;   // 50 - 150 (100 normal)
  contrast: number;     // 50 - 180 (100 normal)
  saturation: number;   // 0 - 200 (100 normal)
  warmth: number;       // 0 - 100 (0 normal)
  blur: number;         // 0 - 3 (0 normal)
  videoScale: number;   // 1.0, 1.15, 1.25
  showSafeZones: boolean;
  safeZonePlatform: 'reels' | 'tiktok';
  showCompare: boolean;
}

const INITIAL_STATE: EditorState = {
  currentTime: 0,
  isPlaying: false,
  activePanel: null,
  zoomLevel: 1,
  selectedClipId: 'c1',
  aspectRatio: '9:16',
  hasCaptions: true,
  captionStyle: 'tiktok_yellow',
  customCaptionText: 'Tap edit to customize caption text or auto-transcribe with AI',
  audioNoiseReduction: true,
  audioVolume: 100,
  isMuted: false,
  playbackRate: 1,
  selectedEffect: 'none',
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  blur: 0,
  videoScale: 1,
  showSafeZones: true,
  safeZonePlatform: 'reels',
  showCompare: false,
};

let state: EditorState = { ...INITIAL_STATE };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function computeFilterStyle(s: EditorState): string {
  const preset = EFFECT_PRESETS.find((p) => p.id === s.selectedEffect);
  const baseFilter = preset && preset.id !== 'none' ? preset.filterCss : '';
  
  // Custom slider adjustments
  const hasAdjustments =
    s.brightness !== 100 ||
    s.contrast !== 100 ||
    s.saturation !== 100 ||
    s.warmth !== 0 ||
    s.blur !== 0;

  if (!hasAdjustments) return baseFilter || 'none';

  const adjustments = [
    s.brightness !== 100 ? `brightness(${s.brightness}%)` : null,
    s.contrast !== 100 ? `contrast(${s.contrast}%)` : null,
    s.saturation !== 100 ? `saturate(${s.saturation}%)` : null,
    s.warmth !== 0 ? `sepia(${s.warmth}%)` : null,
    s.blur !== 0 ? `blur(${s.blur}px)` : null,
  ].filter(Boolean).join(' ');

  return baseFilter ? `${baseFilter} ${adjustments}` : adjustments || 'none';
}

export const editorStore = {
  getState: () => state,

  setCurrentTime: (timeOrUpdater: number | ((prev: number) => number)) => {
    state = {
      ...state,
      currentTime: typeof timeOrUpdater === 'function' ? timeOrUpdater(state.currentTime) : timeOrUpdater,
    };
    notify();
  },

  togglePlay: () => {
    state = { ...state, isPlaying: !state.isPlaying };
    notify();
  },

  setPlaying: (playing: boolean) => {
    state = { ...state, isPlaying: playing };
    notify();
  },

  setActivePanel: (panel: EditorPanel) => {
    state = { ...state, activePanel: state.activePanel === panel ? null : panel };
    notify();
  },

  setAspectRatio: (ar: '9:16' | '16:9' | '1:1') => {
    state = { ...state, aspectRatio: ar };
    notify();
  },

  toggleCaptions: () => {
    state = { ...state, hasCaptions: !state.hasCaptions };
    notify();
  },

  setCaptionStyle: (style: 'tiktok_yellow' | 'minimal_white' | 'neon_cyber') => {
    state = { ...state, captionStyle: style };
    notify();
  },

  setCustomCaptionText: (text: string) => {
    state = { ...state, customCaptionText: text };
    notify();
  },

  toggleNoiseReduction: () => {
    state = { ...state, audioNoiseReduction: !state.audioNoiseReduction };
    notify();
  },

  setAudioVolume: (volume: number) => {
    state = { ...state, audioVolume: volume };
    notify();
  },

  toggleMute: () => {
    state = { ...state, isMuted: !state.isMuted };
    notify();
  },

  setPlaybackRate: (rate: number) => {
    state = { ...state, playbackRate: rate };
    notify();
  },

  // Effects Actions
  selectEffect: (effectId: EffectPresetId) => {
    state = { ...state, selectedEffect: effectId };
    notify();
  },

  setBrightness: (val: number) => {
    state = { ...state, brightness: val };
    notify();
  },

  setContrast: (val: number) => {
    state = { ...state, contrast: val };
    notify();
  },

  setSaturation: (val: number) => {
    state = { ...state, saturation: val };
    notify();
  },

  setWarmth: (val: number) => {
    state = { ...state, warmth: val };
    notify();
  },

  setBlur: (val: number) => {
    state = { ...state, blur: val };
    notify();
  },

  setVideoScale: (scale: number) => {
    state = { ...state, videoScale: scale };
    notify();
  },

  toggleSafeZones: () => {
    state = { ...state, showSafeZones: !state.showSafeZones };
    notify();
  },

  setSafeZones: (show: boolean) => {
    state = { ...state, showSafeZones: show };
    notify();
  },

  setSafeZonePlatform: (platform: 'reels' | 'tiktok') => {
    state = { ...state, safeZonePlatform: platform };
    notify();
  },

  toggleCompare: () => {
    state = { ...state, showCompare: !state.showCompare };
    notify();
  },

  resetEffects: () => {
    state = {
      ...state,
      selectedEffect: 'none',
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      blur: 0,
      videoScale: 1,
      showSafeZones: true,
      safeZonePlatform: 'reels',
      showCompare: false,
    };
    notify();
  },
};

export function useEditorStore() {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const update = () => setVersion((v) => v + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    ...state,
    filterCss: computeFilterStyle(state),
    setCurrentTime: editorStore.setCurrentTime,
    togglePlay: editorStore.togglePlay,
    setPlaying: editorStore.setPlaying,
    setActivePanel: editorStore.setActivePanel,
    setAspectRatio: editorStore.setAspectRatio,
    toggleCaptions: editorStore.toggleCaptions,
    setCaptionStyle: editorStore.setCaptionStyle,
    setCustomCaptionText: editorStore.setCustomCaptionText,
    toggleNoiseReduction: editorStore.toggleNoiseReduction,
    setAudioVolume: editorStore.setAudioVolume,
    toggleMute: editorStore.toggleMute,
    setPlaybackRate: editorStore.setPlaybackRate,
    selectEffect: editorStore.selectEffect,
    setBrightness: editorStore.setBrightness,
    setContrast: editorStore.setContrast,
    setSaturation: editorStore.setSaturation,
    setWarmth: editorStore.setWarmth,
    setBlur: editorStore.setBlur,
    setVideoScale: editorStore.setVideoScale,
    toggleSafeZones: editorStore.toggleSafeZones,
    setSafeZones: editorStore.setSafeZones,
    setSafeZonePlatform: editorStore.setSafeZonePlatform,
    toggleCompare: editorStore.toggleCompare,
    resetEffects: editorStore.resetEffects,
  };
}
