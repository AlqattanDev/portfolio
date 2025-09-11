/**
 * Skill-related type definitions
 */

import { z } from 'zod';
import type { BaseComponentProps } from './component.js';

// Skill levels
export type SkillLevel =
  | 'Expert'
  | 'Advanced'
  | 'Proficient'
  | 'Intermediate'
  | 'Beginner';

// Individual skill item
export interface SkillItem {
  name: string;
  level: SkillLevel;
  years: string;
  projects: string;
  highlight: string;
}

// Skill category
export interface SkillCategory {
  header: string;
  years: string;
  items: SkillItem[];
}

// Skills component props
export interface SkillsProps extends BaseComponentProps {
  skills: SkillCategory[];
  variant?: 'grid' | 'list' | 'compact';
  showProgressBars?: boolean;
  interactive?: boolean;
}

// Skill bar visualization
export interface SkillBarConfig {
  level: SkillLevel;
  bar: string;
  html: string;
}

export interface SkillVisualization {
  filled: string;
  dither1: string;
  dither2: string;
  dither3: string;
  brackets: string;
}

// Progress bar types for different skill levels
export type ProgressBarType =
  | 'filled'
  | 'dither-1'
  | 'dither-2'
  | 'dither-3'
  | 'empty';

export interface ProgressSegment {
  type: ProgressBarType;
  content: string;
  opacity: number;
}

// Skill assessment and scoring
export interface SkillAssessment {
  technical: number; // 0-100
  practical: number; // 0-100
  experience: number; // years
  projects: number; // project count
  confidence: number; // 0-100
}

export interface SkillMetrics {
  totalSkills: number;
  averageLevel: number;
  totalExperience: number;
  topSkills: SkillItem[];
  skillsByLevel: Record<SkillLevel, number>;
}

// Skill filtering and searching
export interface SkillFilters {
  level?: SkillLevel[];
  category?: string[];
  minYears?: number;
  search?: string;
}

export interface SkillSearchResult {
  item: SkillItem;
  category: string;
  relevanceScore: number;
  matchedFields: string[];
}

// Educational background
export interface Education {
  degree: string;
  university: string;
  thesis: string;
  year?: string;
  gpa?: string;
  honors?: string[];
  relevantCourses?: string[];
}

export interface EducationProps extends BaseComponentProps {
  edu: Education;
  variant?: 'default' | 'compact';
  showDetails?: boolean;
}

// Zod validation schemas
export const SkillLevelSchema = z.enum([
  'Expert',
  'Advanced',
  'Proficient',
  'Intermediate',
  'Beginner',
]);

export const SkillItemSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: SkillLevelSchema,
  years: z.string().min(1, 'Years of experience is required'),
  projects: z.string().min(1, 'Project information is required'),
  highlight: z.string().min(1, 'Highlight information is required'),
});

export const SkillCategorySchema = z.object({
  header: z.string().min(1, 'Category header is required'),
  years: z.string().min(1, 'Category years is required'),
  items: z.array(SkillItemSchema).min(1, 'At least one skill item is required'),
});

export const EducationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  university: z.string().min(1, 'University is required'),
  thesis: z.string().min(1, 'Thesis information is required'),
  year: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
  relevantCourses: z.array(z.string()).optional(),
});

// Type guards
export const isSkillLevel = (level: string): level is SkillLevel => {
  return SkillLevelSchema.safeParse(level).success;
};

export const isSkillItem = (obj: unknown): obj is SkillItem => {
  return SkillItemSchema.safeParse(obj).success;
};

export const isSkillCategory = (obj: unknown): obj is SkillCategory => {
  return SkillCategorySchema.safeParse(obj).success;
};

export const isEducation = (obj: unknown): obj is Education => {
  return EducationSchema.safeParse(obj).success;
};

// Utility functions type definitions
export interface SkillUtilities {
  generateProgressBar: (level: SkillLevel) => SkillBarConfig;
  calculateSkillMetrics: (skills: SkillCategory[]) => SkillMetrics;
  filterSkills: (
    skills: SkillCategory[],
    filters: SkillFilters
  ) => SkillCategory[];
  searchSkills: (skills: SkillCategory[], query: string) => SkillSearchResult[];
  validateSkillData: (data: unknown) => data is SkillCategory[];
  sortSkillsByLevel: (items: SkillItem[]) => SkillItem[];
  getSkillLevelNumeric: (level: SkillLevel) => number;
}

// Skill level mappings
export const SKILL_LEVEL_VALUES: Record<SkillLevel, number> = {
  Expert: 5,
  Advanced: 4,
  Proficient: 3,
  Intermediate: 2,
  Beginner: 1,
} as const;

export const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  Expert: '#00ff41',
  Advanced: '#00d4aa',
  Proficient: '#ffaa00',
  Intermediate: '#ff6b35',
  Beginner: '#ff4444',
} as const;

// ASCII progress bar characters
export const PROGRESS_CHARS = {
  FILLED: '██',
  DITHER_1: '▓▓',
  DITHER_2: '▒▒',
  DITHER_3: '░░',
  EMPTY: '  ',
  BRACKET_LEFT: '[',
  BRACKET_RIGHT: ']',
  SEPARATOR: ' ',
} as const;
