import { z } from 'zod';
import type { ValidationResult, UserProfile } from '@/types';

export const userProfileSchema = z.object({
  personal: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    email: z.string().email(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    avatar: z.string().url().optional(),
  }),
  social: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    devto: z.string().url().optional(),
    stackoverflow: z.string().url().optional(),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    availability: z.string().optional(),
  }),
});

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  return {
    success: false,
    error: 'Validation failed',
    errors: parsed.error.flatten().fieldErrors,
  };
}

export type UserProfileData = z.infer<typeof userProfileSchema> & UserProfile;
