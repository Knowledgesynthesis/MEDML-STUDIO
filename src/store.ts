import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuizRecord {
  best: number;
  last: number;
  attempts: number;
}

interface ProgressState {
  quizzes: Record<string, QuizRecord>;
  visited: Record<string, number>;
  dark: boolean;
  recordQuiz: (id: string, score: number) => void;
  visit: (id: string) => void;
  setDark: (dark: boolean) => void;
  reset: () => void;
}

export const PASS_MARK = 0.8;

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      quizzes: {},
      visited: {},
      dark: document.documentElement.classList.contains('dark'),
      recordQuiz: (id, score) =>
        set((s) => {
          const prev = s.quizzes[id];
          return {
            quizzes: {
              ...s.quizzes,
              [id]: { best: Math.max(prev?.best ?? 0, score), last: score, attempts: (prev?.attempts ?? 0) + 1 },
            },
          };
        }),
      visit: (id) => set((s) => ({ visited: { ...s.visited, [id]: Date.now() } })),
      setDark: (dark) => {
        document.documentElement.classList.toggle('dark', dark);
        try {
          localStorage.setItem('medml-theme', dark ? 'dark' : 'light');
        } catch {
          /* storage unavailable */
        }
        set({ dark });
      },
      reset: () => set({ quizzes: {}, visited: {} }),
    }),
    { name: 'medml-progress-v2', partialize: (s) => ({ quizzes: s.quizzes, visited: s.visited }) },
  ),
);
