/**
 * Project-related validation schemas
 */

import { z } from 'zod';

// Zod schemas for validation
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

export const GitHubRepoSchema = z.object({
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable().optional(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  language: z.string().nullable().optional(),
  updated_at: z.string(),
  html_url: z.string().url(),
  topics: z.array(z.string()).default([]),
  open_issues_count: z.number(),
  subscribers_count: z.number(),
});
