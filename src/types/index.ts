/**
 * Main type exports for the application
 */

// Re-export all types for easy importing
export * from './component.js';
export * from './project.js';
export * from './skill.js';

// Profile and user data types
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

// Site configuration types
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

// Content types (for Astro collections)
export interface BlogPost {
  title: string;
  description: string;
  publishDate: Date;
  tags: string[];
  draft?: boolean;
  image?: string;
  canonicalURL?: string;
}

// Layout and page types
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

// Global state types
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

// API and external service types
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

// Form and input types
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
  honeypot?: string; // Anti-spam field
}

// Utility and helper types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredOnly<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event and interaction types
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

// Environment and configuration types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  BUILD_MODE: 'static' | 'ssr' | 'hybrid';
  API_BASE_URL?: string;
  GITHUB_TOKEN?: string;
  ANALYTICS_ID?: string;
}

// Module declarations for non-TypeScript files
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

// Global augmentations
declare global {
  interface Window {
    // Custom properties that might be added to window
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
