import type { ReactNode } from 'react';
import type { Question } from '@/components/learn/Quiz';

export interface ModuleSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface ModuleDef {
  id: string;
  number: number;
  title: string;
  summary: string;
  minutes: number;
  objectives: string[];
  sections: ModuleSection[];
  quiz: Question[];
  refs: string[];
}
