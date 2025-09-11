/**
 * Project-related type definitions
 */

import { z } from 'zod';
import type { BaseComponentProps, MediaConfig } from './component.js';

// Import schemas
import {
  ProjectStatusSchema,
  ProjectMetricsSchema,
  ProjectSchema,
  GitHubRepoSchema,
} from './project.schemas.js';

// Project status enum
export type ProjectStatus = 'PRODUCTION' | 'BETA' | 'DEVELOPMENT' | 'ARCHIVED';

// Project metric types
export interface ProjectMetrics {
  scale?: string;
  security?: string;
  performance?: string;
  innovation?: string;
}

// Base project interface
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

// Extended project with computed fields
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

// GitHub repository information
export interface GitHubRepo {
  name: string;
  full_name: string;
  description?: string;
  stargazers_count: number;
  forks_count: number;
  language?: string;
  updated_at: string;
  html_url: string;
  topics: string[];
  open_issues_count: number;
  subscribers_count: number;
}

// GitHub stats for display
export interface GitHubStats {
  stars: number;
  forks: number;
  language: string;
  isLoading: boolean;
  error?: string;
}

// Project entry component props
export interface ProjectEntryProps extends BaseComponentProps {
  project: Project;
  variant?: 'default' | 'compact' | 'detailed';
  showExpanded?: boolean;
  mediaConfig?: MediaConfig;
}

// Project actions
export interface ProjectAction {
  type: 'demo' | 'github' | 'case-study' | 'download';
  label: string;
  url?: string;
  icon: string;
  primary?: boolean;
  disabled?: boolean;
}

// Media preview types
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

// Live demo configuration
export interface LiveDemoConfig {
  src: string;
  title: string;
  sandbox: string[];
  width?: number;
  height?: number;
  scale?: number;
  interactive?: boolean;
}

// Achievement badge configuration
export interface AchievementBadge {
  text: string;
  icon: string;
  variant: 'production' | 'beta' | 'development';
  color?: string;
}

// Project filtering and sorting
export interface ProjectFilters {
  status?: ProjectStatus[];
  technologies?: string[];
  hasDemo?: boolean;
  hasGitHub?: boolean;
  search?: string;
}

export interface ProjectSortOptions {
  field: 'name' | 'status' | 'updated' | 'stars';
  direction: 'asc' | 'desc';
}

// Import schemas from separate file
export {
  ProjectStatusSchema,
  ProjectMetricsSchema,
  ProjectSchema,
  GitHubRepoSchema,
} from './project.schemas.js';

// Type guards
export const isProject = (obj: unknown): obj is Project => {
  return ProjectSchema.safeParse(obj).success;
};

export const isGitHubRepo = (obj: unknown): obj is GitHubRepo => {
  return GitHubRepoSchema.safeParse(obj).success;
};

// Utility types for project operations
export interface ProjectOperations {
  validate: (project: unknown) => project is Project;
  sanitize: (project: Partial<Project>) => Project;
  computeMeta: (project: Project) => ProjectWithMeta;
  filterProjects: (projects: Project[], filters: ProjectFilters) => Project[];
  sortProjects: (projects: Project[], options: ProjectSortOptions) => Project[];
}

export type ProjectValidationResult =
  | {
      success: true;
      data: Project;
    }
  | {
      success: false;
      error: string;
      details?: z.ZodError;
    };
