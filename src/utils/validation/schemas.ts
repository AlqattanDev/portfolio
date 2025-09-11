/**
 * Centralized validation schemas using Zod
 */

import { z } from 'zod';

// Common validation patterns
export const urlSchema = z.string().url('Must be a valid URL');
export const emailSchema = z.string().email('Must be a valid email address');
export const nonEmptyStringSchema = z.string().min(1, 'This field is required');
export const optionalUrlSchema = z.string().url('Must be a valid URL').optional();

// Component prop validation schemas
export const baseComponentPropsSchema = z.object({
  className: z.string().optional(),
  id: z.string().optional(),
});

// Project validation (re-export for convenience)
export { 
  ProjectSchema, 
  ProjectStatusSchema, 
  ProjectMetricsSchema,
  GitHubRepoSchema 
} from '@/types/project.js';

// Skill validation (re-export for convenience)
export { 
  SkillLevelSchema, 
  SkillItemSchema, 
  SkillCategorySchema,
  EducationSchema 
} from '@/types/skill.js';

// Profile and user data validation
export const userProfileSchema = z.object({
  personal: z.object({
    name: nonEmptyStringSchema,
    title: nonEmptyStringSchema,
    email: emailSchema,
    location: z.string().optional(),
    website: optionalUrlSchema,
    avatar: optionalUrlSchema,
  }),
  social: z.object({
    github: optionalUrlSchema,
    linkedin: optionalUrlSchema,
    twitter: optionalUrlSchema,
    devto: optionalUrlSchema,
    stackoverflow: optionalUrlSchema,
  }),
  contact: z.object({
    email: emailSchema,
    phone: z.string().optional(),
    address: z.string().optional(),
    availability: z.string().optional(),
  }),
});

// Site configuration validation
export const siteConfigSchema = z.object({
  title: nonEmptyStringSchema,
  description: nonEmptyStringSchema,
  url: urlSchema,
  author: z.object({
    name: nonEmptyStringSchema,
    title: nonEmptyStringSchema,
    email: emailSchema,
    social: z.object({
      github: optionalUrlSchema,
      linkedin: optionalUrlSchema,
      twitter: optionalUrlSchema,
    }),
  }),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
  rss: z.boolean().optional(),
  analytics: z.object({
    googleAnalyticsId: z.string().optional(),
    plausibleDomain: z.string().optional(),
  }).optional(),
  seo: z.object({
    defaultImage: optionalUrlSchema,
    twitterCard: z.enum(['summary', 'summary_large_image']).optional(),
    locale: z.string().optional(),
  }),
});

// Blog post validation
export const blogPostSchema = z.object({
  title: nonEmptyStringSchema,
  description: nonEmptyStringSchema,
  publishDate: z.date(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  draft: z.boolean().optional(),
  image: optionalUrlSchema,
  canonicalURL: optionalUrlSchema,
});

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  honeypot: z.string().max(0, 'Spam detected').optional(), // Anti-spam field
});

// API response validation
export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  status: z.number(),
});

// Environment validation
export const environmentConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  BUILD_MODE: z.enum(['static', 'ssr', 'hybrid']),
  API_BASE_URL: optionalUrlSchema,
  GITHUB_TOKEN: z.string().optional(),
  ANALYTICS_ID: z.string().optional(),
});

// Canvas and animation validation
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const canvasParticleSchema = z.object({
  char: z.string(),
  originalChar: z.string(),
  x: z.number(),
  y: z.number(),
  baseX: z.number(),
  baseY: z.number(),
  offsetX: z.number(),
  offsetY: z.number(),
  opacity: z.number().min(0).max(1),
  targetOpacity: z.number().min(0).max(1),
  color: z.string(),
  typed: z.boolean(),
  index: z.number().min(0),
  phase: z.number(),
  blockIndex: z.number().min(0),
  validated: z.boolean(),
  price: z.number().min(0),
  trend: z.number(),
  riskLevel: z.number().min(0).max(1),
  highlighted: z.boolean(),
});

// Performance metrics validation
export const performanceMetricsSchema = z.object({
  renderTime: z.number().min(0).optional(),
  loadTime: z.number().min(0).optional(),
  interactionTime: z.number().min(0).optional(),
  memoryUsage: z.number().min(0).optional(),
});

export const webVitalsMetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  delta: z.number(),
  id: z.string(),
  navigationType: z.enum(['navigate', 'reload', 'back-forward', 'back-forward-cache']),
});

// Error reporting validation
export const errorContextSchema = z.object({
  component: z.string(),
  props: z.record(z.unknown()).optional(),
  timestamp: z.number(),
  userAgent: z.string().optional(),
});

export const errorReportSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  context: errorContextSchema,
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

// Utility validation functions
export const createArraySchema = <T>(itemSchema: z.ZodType<T>) => 
  z.array(itemSchema).min(1, 'Array cannot be empty');

export const createOptionalArraySchema = <T>(itemSchema: z.ZodType<T>) => 
  z.array(itemSchema).optional();

export const createPaginationSchema = (itemSchema: z.ZodType<any>) => z.object({
  items: z.array(itemSchema),
  totalItems: z.number().min(0),
  totalPages: z.number().min(1),
  currentPage: z.number().min(1),
  itemsPerPage: z.number().min(1),
});

// Validation helper functions
export const validateData = <T>(schema: z.ZodType<T>, data: unknown): { 
  success: true; 
  data: T; 
} | { 
  success: false; 
  error: string; 
  details: z.ZodError; 
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        details: error 
      };
    }
    return { 
      success: false, 
      error: 'Unknown validation error', 
      details: error as z.ZodError 
    };
  }
};

export const validatePartialData = <T>(schema: z.ZodType<T>, data: unknown) => {
  return schema.partial().safeParse(data);
};