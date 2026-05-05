import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Region, AIStrategy, DrawResult, PredictionRecord } from '../types';
import {
  INITIAL_DRAWS_XSMB,
  INITIAL_DRAWS_XSMT,
  INITIAL_DRAWS_XSMN,
} from '../services/initialData';

interface Store {
  region: Region;
  strategy: AIStrategy;
  draws: DrawResult[];
  predictions: PredictionRecord[];
  apiKey: string;
  showApiModal: boolean;
  showDataModal: boolean;
  isLoadingAI: boolean;

  setRegion: (r: Region) => void;
  setStrategy: (s: AIStrategy) => void;
  setApiKey: (k: string) => void;
  setShowApiModal: (v: boolean) => void;
  setShowDataModal: (v: boolean) => void;
  setIsLoadingAI: (v: boolean) => void;
  addPrediction: (p: PredictionRecord) => void;
  addDraw: (d: DrawResult) => void;
  deleteDraw: (id: string) => void;
  clearDrawsByRegion: (region: Region) => void;
  importDraws: (newDraws: DrawResult[]) => void;
  getDrawsForRegion: () => DrawResult[];
}

const allInitial: DrawResult[] = [
  ...INITIAL_DRAWS_XSMB,
  ...INITIAL_DRAWS_XSMT,
  ...INITIAL_DRAWS_XSMN,
];

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      region: 'XSMB',
      strategy: 'BALANCED',
      draws: allInitial,
      predictions: [],
      apiKey: '',
      showApiModal: false,
      showDataModal: false,
      isLoadingAI: false,

      setRegion: (region) => set({ region }),
      setStrategy: (strategy) => set({ strategy }),
      setApiKey: (apiKey) => {
        sessionStorage.setItem('geminiApiKey', apiKey);
        set({ apiKey, showApiModal: false });
      },
      setShowApiModal: (showApiModal) => set({ showApiModal }),
      setShowDataModal: (showDataModal) => set({ showDataModal }),
      setIsLoadingAI: (isLoadingAI) => set({ isLoadingAI }),
      addPrediction: (p) =>
        set((s) => ({ predictions: [p, ...s.predictions].slice(0, 50) })),
      addDraw: (d) =>
        set((s) => ({
          draws: [d, ...s.draws.filter((x) => x.id !== d.id)],
        })),
      deleteDraw: (id) =>
        set((s) => ({ draws: s.draws.filter((x) => x.id !== id) })),
      clearDrawsByRegion: (region) =>
        set((s) => ({ draws: s.draws.filter((x) => x.region !== region) })),
      importDraws: (newDraws) =>
        set((s) => {
          const existingIds = new Set(s.draws.map((d) => d.id));
          const unique = newDraws.filter((d) => !existingIds.has(d.id));
          return { draws: [...unique, ...s.draws] };
        }),
      getDrawsForRegion: () =>
        get().draws.filter((d) => d.region === get().region),
    }),
    {
      name: 'xoso-ai-store',
      partialize: (s) => ({
        draws: s.draws,
        predictions: s.predictions,
        region: s.region,
        strategy: s.strategy,
      }),
    }
  )
);
