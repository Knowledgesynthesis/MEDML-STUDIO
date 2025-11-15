import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SyntheticDataset,
  TrainedModel,
  Module,
  UserProgress,
  GlossaryTerm,
} from '@/types';
import { getAllDatasets } from '@/lib/data/synthetic-generator';

interface AppState {
  // Datasets
  datasets: SyntheticDataset[];
  selectedDataset: SyntheticDataset | null;
  setSelectedDataset: (dataset: SyntheticDataset | null) => void;

  // Models
  models: TrainedModel[];
  selectedModel: TrainedModel | null;
  addModel: (model: TrainedModel) => void;
  setSelectedModel: (model: TrainedModel | null) => void;
  removeModel: (modelId: string) => void;

  // Learning
  modules: Module[];
  currentModule: Module | null;
  setCurrentModule: (module: Module | null) => void;
  completeModule: (moduleId: string) => void;

  // User progress
  userProgress: UserProgress;
  updateProgress: (progress: Partial<UserProgress>) => void;

  // Glossary
  glossaryTerms: GlossaryTerm[];

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Initialize
  initialize: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      datasets: [],
      selectedDataset: null,
      models: [],
      selectedModel: null,
      modules: [],
      currentModule: null,
      userProgress: {
        userId: 'default',
        completedModules: [],
        assessmentScores: {},
        timeSpent: {},
        lastActive: new Date().toISOString(),
      },
      glossaryTerms: [],
      sidebarOpen: true,
      darkMode: true,

      // Dataset actions
      setSelectedDataset: (dataset) => set({ selectedDataset: dataset }),

      // Model actions
      addModel: (model) =>
        set((state) => ({ models: [...state.models, model] })),

      setSelectedModel: (model) => set({ selectedModel: model }),

      removeModel: (modelId) =>
        set((state) => ({
          models: state.models.filter((m) => m.id !== modelId),
          selectedModel:
            state.selectedModel?.id === modelId ? null : state.selectedModel,
        })),

      // Learning actions
      setCurrentModule: (module) => set({ currentModule: module }),

      completeModule: (moduleId) =>
        set((state) => {
          const updatedModules = state.modules.map((m) =>
            m.id === moduleId ? { ...m, completed: true } : m
          );

          const completedModules = state.userProgress.completedModules.includes(
            moduleId
          )
            ? state.userProgress.completedModules
            : [...state.userProgress.completedModules, moduleId];

          return {
            modules: updatedModules,
            userProgress: {
              ...state.userProgress,
              completedModules,
              lastActive: new Date().toISOString(),
            },
          };
        }),

      // User progress actions
      updateProgress: (progress) =>
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            ...progress,
            lastActive: new Date().toISOString(),
          },
        })),

      // UI actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.darkMode;
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newDarkMode };
        }),

      // Initialize
      initialize: () => {
        const datasets = getAllDatasets();
        set({ datasets, selectedDataset: datasets[0] || null });

        // Set dark mode on init
        if (get().darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }),
    {
      name: 'medml-storage',
      partialize: (state) => ({
        userProgress: state.userProgress,
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
