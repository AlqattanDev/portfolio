/**
 * UI-related type definitions
 */

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
  xs?: number; // 0px
  sm?: number; // 576px
  md?: number; // 768px
  lg?: number; // 992px
  xl?: number; // 1200px
  xxl?: number; // 1400px
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
