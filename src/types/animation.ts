/**
 * Animation and canvas-related type definitions
 */

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
