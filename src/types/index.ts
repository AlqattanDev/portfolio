/**
 * Consolidated type definitions for the application
 * All types are now in this single file for simplicity
 */

import { z } from 'zod';

// ====================
// UI & Component Types
// ====================

export interface BaseComponentProps {
  className?: string;
  id?: string;
}

export interface WithChildren {
  children?: any;
}

export interface ViewMode {
  mode: 'digital' | 'print';
}

export interface ThemeVariant {
  variant?:
    | 'matrix'
    | 'blockchain'
    | 'trading'
    | 'encryption'
    | 'ledger'
    | 'swift'
    | 'risk'
    | 'compliance'
    | 'settlement'
    | 'gruvbox'
    | 'gruvbox-visual'
    | 'gruvbox-syntax';
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface InteractiveState {
  isHovered?: boolean;
  isFocused?: boolean;
  isPressed?: boolean;
}

export interface ResponsiveConfig {
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
}

export interface BreakpointConfig {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ValidationSchema<T> {
  validate: (data: unknown) => ValidationResult<T>;
}

// ====================
// Animation Types
// ====================

export interface Position {
  x: number;
  y: number;
}

export interface AnimationConfig {
  duration?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;
}

export interface CanvasParticle {
  char: string;
  originalChar: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  targetOpacity: number;
  color: string;
  typed: boolean;
  index: number;
  phase: number;
  blockIndex: number;
  validated: boolean;
  price: number;
  trend: number;
  riskLevel: number;
  highlighted: boolean;
}

export interface VimMode {
  mode: 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND';
}

export interface EffectSystem {
  currentEffect: number;
  effectNames: string[];
  colorSchemes: string[];
}

// ====================
// Error Types
// ====================

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export interface ErrorContext {
  component: string;
  props?: Record<string, unknown>;
  timestamp: number;
  userAgent?: string;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ====================
// Performance Types
// ====================

export interface PerformanceMetrics {
  renderTime?: number;
  loadTime?: number;
  interactionTime?: number;
  memoryUsage?: number;
}

export interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache';
}

// ====================
// Media Types
// ====================

export interface MediaConfig {
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
}

export interface ApiConfig {
  timeout?: number;
  retries?: number;
  fallbackData?: unknown;
}

// ====================
// Project Types
// ====================

export type ProjectStatus = 'PRODUCTION' | 'BETA' | 'DEVELOPMENT' | 'ARCHIVED';

export interface ProjectMetrics {
  scale?: string;
  security?: string;
  performance?: string;
  innovation?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  features: string[];
  stack: string[];
  demoUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  images?: string[];
  metrics?: ProjectMetrics;
}

export interface ProjectWithMeta extends Project {
  primaryMetric?: string;
  primaryMetricLabel?: string;
  metaString: string;
  isProduction: boolean;
  hasDemo: boolean;
  hasGitHub: boolean;
  hasVideo: boolean;
  hasImages: boolean;
}


export interface ProjectEntryProps extends BaseComponentProps {
  project: Project;
  variant?: 'default' | 'compact' | 'detailed';
  showExpanded?: boolean;
  mediaConfig?: MediaConfig;
}

export interface ProjectAction {
  type: 'demo' | 'github' | 'case-study' | 'download';
  label: string;
  url?: string;
  icon: string;
  primary?: boolean;
  disabled?: boolean;
}

export interface VideoPreviewState {
  isHovered: boolean;
  isLoaded: boolean;
  videoElement?: HTMLVideoElement;
  error?: string;
}

export interface ImageGalleryItem {
  src: string;
  alt: string;
  thumbnail?: string;
  caption?: string;
}

export interface LiveDemoConfig {
  src: string;
  title: string;
  sandbox: string[];
  width?: number;
  height?: number;
  scale?: number;
  interactive?: boolean;
}

export interface AchievementBadge {
  text: string;
  icon: string;
  variant: 'production' | 'beta' | 'development';
  color?: string;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  technologies?: string[];
  hasDemo?: boolean;
  hasGitHub?: boolean;
  search?: string;
}

export interface ProjectSortOptions {
  field: 'name' | 'status' | 'updated';
  direction: 'asc' | 'desc';
}

// Project Validation Schemas
export const ProjectStatusSchema = z.enum([
  'PRODUCTION',
  'BETA',
  'DEVELOPMENT',
  'ARCHIVED',
]);

export const ProjectMetricsSchema = z.object({
  scale: z.string().optional(),
  security: z.string().optional(),
  performance: z.string().optional(),
  innovation: z.string().optional(),
});

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  status: ProjectStatusSchema,
  features: z.array(z.string()).min(1),
  stack: z.array(z.string()).min(1),
  demoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  metrics: ProjectMetricsSchema.optional(),
});



// ====================
// Skill Types
// ====================

export type SkillLevel =
  | 'Expert'
  | 'Advanced'
  | 'Proficient'
  | 'Intermediate'
  | 'Beginner';

export interface SkillItem {
  name: string;
  level: SkillLevel;
  years: string;
  projects: string;
  highlight: string;
}

export interface SkillCategory {
  header: string;
  years: string;
  items: SkillItem[];
}

export interface SkillsProps extends BaseComponentProps {
  skills: SkillCategory[];
  variant?: 'grid' | 'list' | 'compact';
  showProgressBars?: boolean;
  interactive?: boolean;
}

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

export interface SkillAssessment {
  technical: number;
  practical: number;
  experience: number;
  projects: number;
  confidence: number;
}

export interface SkillMetrics {
  totalSkills: number;
  averageLevel: number;
  totalExperience: number;
  topSkills: SkillItem[];
  skillsByLevel: Record<SkillLevel, number>;
}

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

// Skill Validation Schemas
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

// Skill Constants
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

// ====================
// User Profile Types
// ====================

export interface UserProfile {
  personal: {
    name: string;
    title: string;
    email: string;
    location?: string;
    website?: string;
    avatar?: string;
  };
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    devto?: string;
    stackoverflow?: string;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
    availability?: string;
  };
}

// ====================
// Site Configuration
// ====================

export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  author: UserProfile['personal'] & {
    social: UserProfile['social'];
  };
  keywords: string[];
  rss?: boolean;
  analytics?: {
    googleAnalyticsId?: string;
    plausibleDomain?: string;
  };
  seo: {
    defaultImage?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    locale?: string;
  };
}

// ====================
// Content Types
// ====================

export interface BlogPost {
  title: string;
  description: string;
  publishDate: Date;
  tags: string[];
  draft?: boolean;
  image?: string;
  canonicalURL?: string;
}

// ====================
// Layout & Page Types
// ====================

export interface LayoutProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishDate?: Date;
  author?: string;
  tags?: string[];
  schema?: 'Person' | 'WebSite' | 'Article' | 'BlogPosting';
}

export interface PageProps {
  title: string;
  description?: string;
  layout?: 'default' | 'blog' | 'project';
}

// ====================
// Application State
// ====================

export interface AppState {
  theme: 'digital' | 'print';
  colorScheme: string;
  isLoading: boolean;
  user?: UserProfile;
  preferences: {
    animations: boolean;
    soundEffects: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
  };
}

// ====================
// API Types
// ====================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface APIError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// ====================
// Form Types
// ====================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
}

// ====================
// Utility Types
// ====================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredOnly<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ====================
// Event Types
// ====================

export interface CustomEvent<T = any> {
  type: string;
  detail: T;
  timestamp: number;
}

export interface InteractionEvent extends CustomEvent {
  detail: {
    element: string;
    action: 'click' | 'hover' | 'focus' | 'scroll';
    position?: { x: number; y: number };
    metadata?: Record<string, any>;
  };
}

// ====================
// Environment Types
// ====================

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  BUILD_MODE: 'static' | 'ssr' | 'hybrid';
  API_BASE_URL?: string;

  ANALYTICS_ID?: string;
}

// ====================
// Type Guards
// ====================

export const isProject = (obj: unknown): obj is Project => {
  return ProjectSchema.safeParse(obj).success;
};


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

// ====================
// Module Declarations
// ====================

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.astro' {
  const component: any;
  export default component;
}

// ====================
// Global Augmentations
// ====================

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (...args: any[]) => void;
    webVitals?: {
      getCLS: (callback: (metric: any) => void) => void;
      getFID: (callback: (metric: any) => void) => void;
      getFCP: (callback: (metric: any) => void) => void;
      getLCP: (callback: (metric: any) => void) => void;
      getTTFB: (callback: (metric: any) => void) => void;
    };
  }
}