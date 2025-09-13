/**
 * Validation schemas and utilities
 */
import { z } from 'zod';
import type { UserProfile } from '@/types';

// User Profile Schema
export const userProfileSchema = z.object({
  personal: z.object({
    name: z.string(),
    title: z.string(),
    email: z.string().email(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    avatar: z.string().optional(),
  }),
  social: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    devto: z.string().optional(),
    stackoverflow: z.string().optional(),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    availability: z.string().optional(),
  }),
});

// Generic validation function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}