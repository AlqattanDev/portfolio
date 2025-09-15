/**
 * Effect System
 * Handles different visual effects and color schemes for ASCII animations
 */

import type { CanvasParticle, VimMode } from '@/types';
import { COLOR_SCHEMES, EFFECT_NAMES, VIM_MODES } from '@/utils/constants';

export interface EffectContext {
  time: number;
  mousePos: { x: number; y: number };
  isHovering: boolean;
  distance: number;
}

export interface EffectStrategy {
  apply(particle: CanvasParticle, context: EffectContext): void;
}

// Matrix Rain Effect
class MatrixRainEffect implements EffectStrategy {
  apply(particle: CanvasParticle, context: EffectContext): void {
    const { time, isHovering } = context;
    
    particle.offsetY = Math.sin(time * 0.02 + particle.index * 0.05) * 0.5;
    
    if (isHovering) {
      // Enhanced hover effect with cascading animation
      const cascadeDelay = particle.index * 2;
      const cascadePhase = Math.max(0, time - cascadeDelay) * 0.1;
      particle.offsetX = Math.sin(cascadePhase + particle.index) * 3;
      particle.offsetY += Math.cos(cascadePhase * 0.5) * 1.5;
      
      // Dynamic color transition
      const intensity = Math.sin(cascadePhase) * 0.5 + 0.5;
      particle.color = `hsl(${60 + intensity * 20}, 100%, ${70 + intensity * 20}%)`;
      
      // Character morphing effect
      const matrixChars = ['0', '1', 'ア', 'カ', 'サ', 'タ', 'ナ', 'ハ'];
      if (Math.floor(time / 3) % 2 === 0) {
        particle.char = matrixChars[Math.floor(Math.random() * matrixChars.length)] || particle.originalChar;
      }
    } else {
      particle.color = '#00ff41';
      particle.char = particle.originalChar;
      particle.offsetX *= 0.92;
    }
  }
}

// Blockchain Validation Effect
class BlockchainValidationEffect implements EffectStrategy {
  apply(particle: CanvasParticle, context: EffectContext): void {
    const { time, isHovering } = context;
    
    if (isHovering) {
      const validationDelay = particle.blockIndex * 8;
      const validationProgress = Math.min(1, Math.max(0, (time - validationDelay) / 30));
      
      if (validationProgress > 0) {
        particle.validated = true;
        
        // Progressive hash generation with visual feedback
        const hashChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        const hashIndex = Math.floor(time / 4 + particle.index) % hashChars.length;
        particle.char = hashChars[hashIndex] || particle.originalChar;
        
        // Color progression from pending to validated
        const hue = 180 + validationProgress * 40; // Blue to teal progression
        const saturation = 80 + validationProgress * 20;
        const lightness = 50 + validationProgress * 30;
        particle.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // Validation pulse effect
        const pulseIntensity = Math.sin(time * 0.2 + particle.index * 0.1) * 0.3 + 0.7;
        particle.offsetY = Math.sin(time * 0.1 + validationProgress * Math.PI) * pulseIntensity;
        particle.offsetX = Math.cos(time * 0.08 + particle.index * 0.2) * (validationProgress * 2);
      } else {
        // Pending validation state
        particle.color = `hsl(0, 0%, ${30 + Math.sin(time * 0.1) * 10}%)`;
        particle.offsetY = Math.sin(time * 0.05 + particle.index) * 0.5;
      }
    } else {
      particle.validated = false;
      particle.char = particle.originalChar;
      particle.color = '#ffffff';
      particle.offsetX *= 0.9;
      particle.offsetY *= 0.9;
    }
  }
}

// Trading Effect
class TradingEffect implements EffectStrategy {
  apply(particle: CanvasParticle, context: EffectContext): void {
    const { time, isHovering } = context;
    
    particle.phase += 0.08;
    
    if (isHovering) {
      // More realistic price movement with momentum
      const volatility = 0.02 + Math.sin(time * 0.01) * 0.01;
      const priceChange = (Math.random() - 0.5) * volatility * particle.trend;
      particle.price = Math.max(0.1, particle.price + priceChange);
      
      // Dynamic trend calculation
      const trendStrength = Math.abs(particle.trend);
      particle.offsetY = Math.sin(particle.phase) * (trendStrength * 3);
      particle.offsetX = Math.cos(particle.phase * 0.7) * (trendStrength * 1.5);
      
      // Enhanced trading symbols with context
      const bullishChars = ['↗', '▲', '⬆', '📈', '+', '$'];
      const bearishChars = ['↘', '▼', '⬇', '📉', '-', '¥'];
      const neutralChars = ['→', '◆', '●', '€', '£', '₿'];
      
      let charSet = neutralChars;
      let baseColor = '#ffaa00';
      
      if (particle.trend > 0.1) {
        charSet = bullishChars;
        baseColor = '#00ff88';
      } else if (particle.trend < -0.1) {
        charSet = bearishChars;
        baseColor = '#ff4444';
      }
      
      // Animate character selection based on price movement intensity
      const intensity = Math.min(1, Math.abs(priceChange) * 100);
      const charIndex = Math.floor(time / 6 + intensity * 3) % charSet.length;
      particle.char = charSet[charIndex] || particle.originalChar;
      
      // Dynamic color based on trend strength and recent movement
      const colorIntensity = 0.7 + intensity * 0.3;
      particle.color = baseColor.replace(/[0-9a-f]{2}/g, (match) => {
        const value = parseInt(match, 16);
        const adjustedValue = Math.floor(value * colorIntensity);
        return adjustedValue.toString(16).padStart(2, '0');
      }) ?? baseColor;
    } else {
      particle.offsetY *= 0.92;
      particle.offsetX *= 0.92;
      particle.char = particle.originalChar;
      particle.color = '#ffffff';
      // Gradually return trend to neutral
      particle.trend *= 0.98;
    }
  }
}

// Simple effects for other cases
class SimpleEffect implements EffectStrategy {
  constructor(private config: {
    chars?: string[];
    color: string;
    movement?: (particle: CanvasParticle, time: number) => void;
  }) {}

  apply(particle: CanvasParticle, context: EffectContext): void {
    const { time, isHovering } = context;
    
    if (isHovering && this.config.chars) {
      const charIndex = Math.floor(time / 8 + particle.index) % this.config.chars.length;
      particle.char = this.config.chars[charIndex] || particle.originalChar;
      
      if (this.config.movement) {
        this.config.movement(particle, time);
      }
    } else {
      particle.char = particle.originalChar;
      particle.offsetX *= 0.9;
      particle.offsetY *= 0.9;
    }
    
    particle.color = this.config.color;
  }
}

export class EffectSystem {
  private currentEffect: number = 0;
  private currentMode: VimMode['mode'] = VIM_MODES.NORMAL;
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };
  private effects: Map<number, EffectStrategy> = new Map();

  constructor() {
    this.initializeEffects();
    this.updateColorScheme();
  }

  private initializeEffects(): void {
    // Initialize all effect strategies
    this.effects.set(0, new MatrixRainEffect());
    this.effects.set(1, new BlockchainValidationEffect());
    this.effects.set(2, new TradingEffect());
    
    // AES Encryption
    this.effects.set(3, new SimpleEffect({
      chars: ['█', '▓', '▒', '░', '◆', '◇', '●', '○'],
      color: '#4ecdc4',
      movement: (particle, time) => {
        particle.offsetX = Math.cos(time * 0.1 + particle.index * 0.3) * 3;
        particle.offsetY = Math.sin(time * 0.08 + particle.index * 0.2) * 2;
      }
    }));
    
    // Distributed Ledger
    this.effects.set(4, new SimpleEffect({
      chars: ['⟨', '⟩', '⟪', '⟫', '⟬', '⟭', '⟮', '⟯'],
      color: '#45b7d1',
      movement: (particle, time) => {
        const wave = Math.sin(time * 0.03 + particle.index * 0.1);
        particle.offsetX = wave * 4;
        particle.offsetY = Math.cos(time * 0.04 + particle.index * 0.15) * 1.5;
      }
    }));
    
    // Add more effects as needed...
  }

  public setCurrentEffect(effect: number): void {
    this.currentEffect = Math.max(0, Math.min(effect, EFFECT_NAMES.length - 1));
    this.updateColorScheme();
  }

  public setCurrentMode(mode: VimMode['mode']): void {
    this.currentMode = mode;
    this.updateBodyClasses();
  }

  public setMousePosition(x: number, y: number): void {
    this.mousePos.x = x;
    this.mousePos.y = y;
  }

  public getCurrentEffect(): number {
    return this.currentEffect;
  }

  public getCurrentEffectName(): string {
    return EFFECT_NAMES[this.currentEffect] || 'Unknown';
  }

  public getCurrentMode(): VimMode['mode'] {
    return this.currentMode;
  }

  public applyEffectToParticle(particle: CanvasParticle, time: number): void {
    const distance = Math.sqrt(
      Math.pow(this.mousePos.x - particle.baseX, 2) +
        Math.pow(this.mousePos.y - particle.baseY, 2)
    );

    const context: EffectContext = {
      time,
      mousePos: this.mousePos,
      isHovering: distance < 30,
      distance
    };

    const effect = this.effects.get(this.currentEffect);
    if (effect) {
      effect.apply(particle, context);
    } else {
      // Fallback default effect
      particle.color = '#ffffff';
    }
  }

  private updateColorScheme(): void {
    // Remove all existing scheme classes
    Object.values(COLOR_SCHEMES).forEach((scheme) => {
      document.body.classList.remove(scheme);
    });

    // Apply the current scheme
    const currentScheme = Object.values(COLOR_SCHEMES)[this.currentEffect];
    if (currentScheme) {
      document.body.classList.add(currentScheme);
      
      // Persist scheme selection
      try {
        localStorage.setItem('schemeIndex', String(this.currentEffect));
      } catch {
        // localStorage not available
      }
    }
  }

  private updateBodyClasses(): void {
    // Remove existing vim mode classes
    document.body.className = document.body.className.replace(
      /\bvim-\w+\b/g,
      ''
    );
    document.body.classList.add(`vim-${this.currentMode.toLowerCase()}`);
  }

  public updateVimModeDisplay(): void {
    const modeElement = document.getElementById('statusMode');
    const schemeElement = document.getElementById('colorSchemeDisplay');
    
    if (modeElement) {
      modeElement.textContent = this.currentMode;
      modeElement.className = `status-mode ${this.currentMode.toLowerCase()}`;
    }
    
    if (schemeElement) {
      schemeElement.textContent = `Scheme: ${this.getCurrentEffectName()}`;
    }
  }

  public destroy(): void {
    this.effects.clear();
  }
}