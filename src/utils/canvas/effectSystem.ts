/**
 * Effect System for ASCII Canvas
 * Handles different visual effects and color schemes
 */

import type { CanvasParticle, VimMode } from '@/types/animation.js';
import { COLOR_SCHEMES, EFFECT_NAMES } from '@/utils/constants/theme.js';

export class EffectSystem {
  private currentEffect: number = 0;
  private currentMode: VimMode['mode'] = 'NORMAL';
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.updateColorScheme();
  }

  setCurrentEffect(effect: number): void {
    this.currentEffect = Math.max(0, Math.min(effect, EFFECT_NAMES.length - 1));
    this.updateColorScheme();
  }

  setCurrentMode(mode: VimMode['mode']): void {
    this.currentMode = mode;
    this.updateBodyClasses();
  }

  setMousePosition(x: number, y: number): void {
    this.mousePos.x = x;
    this.mousePos.y = y;
  }

  getCurrentEffect(): number {
    return this.currentEffect;
  }

  getCurrentEffectName(): string {
    return EFFECT_NAMES[this.currentEffect] || 'Unknown';
  }

  getCurrentMode(): VimMode['mode'] {
    return this.currentMode;
  }

  applyEffectToParticle(particle: CanvasParticle, time: number): void {
    const distance = Math.sqrt(
      Math.pow(this.mousePos.x - particle.baseX, 2) +
        Math.pow(this.mousePos.y - particle.baseY, 2)
    );

    const isHovering = distance < 30;

    switch (this.currentEffect) {
      case 0: // Matrix Rain
        particle.offsetY = Math.sin(time * 0.02 + particle.index * 0.05) * 0.5;
        particle.color = isHovering ? '#fabd2f' : '#00ff41';
        if (isHovering) {
          particle.offsetX = Math.sin(time * 0.05 + particle.index) * 2;
        } else {
          particle.offsetX *= 0.9;
        }
        break;

      case 1: // Blockchain Validation
        if (isHovering) {
          const validationDelay = particle.blockIndex * 10;
          if (time > validationDelay) {
            particle.validated = true;
            const hashChars = ['0', '1', 'a', 'b', 'c', 'd', 'e', 'f'];
            particle.char =
              hashChars[Math.floor(Math.random() * hashChars.length)] ||
              particle.originalChar;
            particle.color = '#00d4aa';
          } else {
            particle.color = '#666666';
          }
        } else {
          particle.validated = false;
          particle.char = particle.originalChar;
          particle.color = '#ffffff';
        }
        break;

      case 2: // Real-time Trading
        particle.phase += 0.1;
        if (isHovering) {
          particle.price += (Math.random() - 0.5) * 10 * particle.trend;
          particle.offsetY = Math.sin(particle.phase) * (particle.price / 50);
          const priceChars = ['$', '€', '¥', '£', '+', '-', '↑', '↓'];
          particle.char =
            priceChars[Math.floor(Math.random() * priceChars.length)] ||
            particle.originalChar;
          particle.color = particle.trend > 0 ? '#00ff88' : '#ff4444';
        } else {
          particle.offsetY *= 0.9;
          particle.char = particle.originalChar;
          particle.color = '#ffffff';
        }
        break;

      default:
        particle.color = '#ffffff';
        break;
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

  updateVimModeDisplay(): void {
    const modeElement = document.getElementById('statusMode');
    const schemeElement = document.getElementById('statusScheme');
    
    if (modeElement) {
      modeElement.textContent = this.currentMode;
      modeElement.className = `status-mode ${this.currentMode.toLowerCase()}`;
    }
    
    if (schemeElement) {
      schemeElement.textContent = this.getCurrentEffectName();
    }
  }
}
