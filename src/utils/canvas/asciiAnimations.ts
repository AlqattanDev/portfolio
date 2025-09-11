/**
 * ASCII Canvas Animation System
 * Extracted from Header.astro component
 */

import type {
  CanvasParticle,
  VimMode,
  EffectSystem,
} from '@/types/component.js';
import {
  COLOR_SCHEMES,
  EFFECT_NAMES,
  VIM_MODES,
} from '@/utils/constants/theme.js';

export class ASCIIAnimationSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };
  private currentMode: VimMode['mode'] = 'NORMAL';
  private particles: CanvasParticle[] = [];
  private currentEffect: number = 0;
  private animationId: number | null = null;

  private readonly ASCII_NAME = `█████╗ ██╗     ██╗      █████╗ ██╗      ██████╗  █████╗ ████████╗████████╗ █████╗ ███╗   ██╗
██╔══██╗██║     ██║     ██╔══██╗██║     ██╔═══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗████╗  ██║
███████║██║     ██║     ███████║██║     ██║   ██║███████║   ██║      ██║   ███████║██╔██╗ ██║
██╔══██║██║     ██║     ██╔══██║██║     ██║▄▄ ██║██╔══██║   ██║      ██║   ██╔══██║██║╚██╗██║
██║  ██║███████╗██║     ██║  ██║███████╗╚██████╔╝██║  ██║   ██║      ██║   ██║  ██║██║ ╚████║
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝ ╚══▀▀═╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝`;

  private readonly colorSchemes = Object.values(COLOR_SCHEMES);
  private readonly effectNames = [...EFFECT_NAMES];

  // Map color schemes to a light/dark theme for html[data-theme]
  private getThemeForScheme(scheme: string): 'dark' | 'light' {
    try {
      const lightSchemes = new Set<string>([
        COLOR_SCHEMES.GRUVBOX_SYNTAX,
      ]);
      return lightSchemes.has(scheme) ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get 2D context from canvas');
    }
    this.ctx = ctx;

    this.init();
  }

  private init(): void {
    // Restore previously selected color scheme if available
    try {
      const savedIndexRaw = localStorage.getItem('schemeIndex');
      const savedIndex = savedIndexRaw != null ? parseInt(savedIndexRaw, 10) : NaN;
      if (!Number.isNaN(savedIndex) && savedIndex >= 0 && savedIndex < this.colorSchemes.length) {
        this.currentEffect = savedIndex;
      }
    } catch {
      // no-op: localStorage may be unavailable
    }

    this.resize();
    this.createParticles();
    this.setupEventListeners();
    this.updateColorScheme();
    this.animate();
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousemove', (e) => this.updateMouse(e));
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.createParticles();
  }

  private createParticles(): void {
    this.particles = [];
    const fontSize = 12;
    const lines = this.ASCII_NAME.split('\n');
    const lineHeight = fontSize * 1.2;
    const totalWidth = lines[0]?.length
      ? lines[0].length * (fontSize * 0.6)
      : 0;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = 30;

    lines.forEach((line, lineIndex) => {
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex];
        if (char && char !== ' ') {
          const x = startX + charIndex * (fontSize * 0.6);
          const y = startY + lineIndex * lineHeight;

          // Use deterministic values based on position for better predictability
          const deterministicSeed = lineIndex * 100 + charIndex;
          this.particles.push({
            char: char,
            originalChar: char,
            x,
            y,
            baseX: x,
            baseY: y,
            offsetX: 0,
            offsetY: 0,
            opacity: 0,
            targetOpacity: 1,
            color: '#00ff41',
            typed: false,
            index: this.particles.length,
            phase: (deterministicSeed * 0.1) % (Math.PI * 2),
            blockIndex: Math.floor(charIndex / 8),
            validated: false,
            price: 500 + (deterministicSeed % 500), // Deterministic price between 500-1000
            trend: deterministicSeed % 2 === 0 ? 1 : -1, // Alternating trend
            riskLevel: (deterministicSeed % 100) / 100, // Deterministic risk 0-1
            highlighted: false,
          });
        }
      }
    });
  }

  private updateMouse(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = e.clientX - rect.left;
    this.mousePos.y = e.clientY - rect.top;
  }

  public handleKeydown(e: KeyboardEvent): boolean {
    if (!document.body.classList.contains('digital-view')) return false;

    let modeChanged = false;
    let effectChanged = false;

    if (e.key === 'Escape') {
      this.currentMode = 'NORMAL';
      modeChanged = true;
    } else if (this.currentMode === 'NORMAL') {
      if (e.key === 'i') {
        this.currentMode = 'INSERT';
        modeChanged = true;
      } else if (e.key === 'v') {
        this.currentMode = 'VISUAL';
        modeChanged = true;
      } else if (e.key === ':') {
        this.currentMode = 'COMMAND';
        modeChanged = true;
      } else if (e.key === 'n') {
        e.preventDefault();
        this.nextScheme();
        effectChanged = true;
      } else if (e.key === 'p') {
        e.preventDefault();
        this.prevScheme();
        effectChanged = true;
      }
    }

    if (modeChanged || effectChanged) {
      this.updateVimModeDisplay();
      this.updateBodyClasses();
      return true;
    }

    return false;
  }

  private updateVimModeDisplay(): void {
    const modeElement = document.getElementById('statusMode');
    const schemeElement = document.getElementById('statusScheme');
    
    if (modeElement) {
      modeElement.textContent = this.currentMode;
      modeElement.className = `status-mode ${this.currentMode.toLowerCase()}`;
    }
    
    if (schemeElement) {
      schemeElement.textContent = this.effectNames[this.currentEffect] || 'Unknown';
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

  private resetParticleStates(): void {
    this.particles.forEach((p) => {
      p.validated = false;
      p.offsetX = 0;
      p.offsetY = 0;
      p.highlighted = false;
      // Use deterministic values based on particle index
      p.trend = p.index % 2 === 0 ? 1 : -1;
      p.price = 500 + (p.index % 500);
      p.riskLevel = (p.index % 100) / 100;
    });
    this.time = 0;
  }

  private updateColorScheme(): void {
    // Remove all existing scheme classes
    this.colorSchemes.forEach((scheme) => {
      document.body.classList.remove(scheme);
    });

    // Apply the current scheme
    const currentScheme = this.colorSchemes[this.currentEffect];
    if (currentScheme) {
      document.body.classList.add(currentScheme);

      // Persist and sync with html[data-theme]
      try {
        localStorage.setItem('schemeIndex', String(this.currentEffect));
      } catch {}

      const html = document.documentElement;
      const theme = this.getThemeForScheme(currentScheme);
      try {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      } catch {}

      // Broadcast a custom event so other UI (like toggle button) can sync
      try {
        document.dispatchEvent(
          new CustomEvent('theme:changed', {
            detail: { theme, scheme: currentScheme, index: this.currentEffect },
          })
        );
      } catch {}
    }
  }

  private animate = (): void => {
    this.time++;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderParticles();

    this.animationId = requestAnimationFrame(this.animate);
  };

  private renderParticles(): void {
    this.ctx.font = '12px monospace';
    const isPrintMode = !document.body.classList.contains('digital-view');

    this.particles.forEach((particle, index) => {
      const distance = Math.sqrt(
        Math.pow(this.mousePos.x - particle.baseX, 2) +
          Math.pow(this.mousePos.y - particle.baseY, 2)
      );

      // Type-in effect
      if (!particle.typed && this.time > index * 2) {
        particle.typed = true;
        particle.targetOpacity = 1;
      }

      particle.opacity += (particle.targetOpacity - particle.opacity) * 0.1;

      // Set color and effects based on mode
      if (isPrintMode) {
        // Print mode: static black text, no effects
        particle.color = '#000000';
        particle.offsetX = 0;
        particle.offsetY = 0;
        particle.targetOpacity = 1;
      } else {
        // Digital mode: apply current effect
        this.applyCurrentEffect(particle, index, distance);
      }

      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillText(
        particle.char,
        particle.baseX + particle.offsetX,
        particle.baseY + particle.offsetY
      );
    });

    this.ctx.globalAlpha = 1;
  }

  private applyCurrentEffect(
    particle: CanvasParticle,
    index: number,
    distance: number
  ): void {
    const time = this.time;
    const isHovering = distance < 30;

    switch (this.currentEffect) {
      case 0: // Matrix Rain - Enhanced
        particle.offsetY = Math.sin(time * 0.02 + index * 0.05) * 0.5;
        if (isHovering) {
          // Enhanced hover effect with cascading animation
          const cascadeDelay = index * 2;
          const cascadePhase = Math.max(0, time - cascadeDelay) * 0.1;
          particle.offsetX = Math.sin(cascadePhase + index) * 3;
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
        break;

      case 1: // Blockchain Validation - Enhanced
        if (isHovering) {
          const validationDelay = particle.blockIndex * 8;
          const validationProgress = Math.min(1, Math.max(0, (time - validationDelay) / 30));
          
          if (validationProgress > 0) {
            particle.validated = true;
            
            // Progressive hash generation with visual feedback
            const hashChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
            const hashIndex = Math.floor(time / 4 + index) % hashChars.length;
            particle.char = hashChars[hashIndex] || particle.originalChar;
            
            // Color progression from pending to validated
            const hue = 180 + validationProgress * 40; // Blue to teal progression
            const saturation = 80 + validationProgress * 20;
            const lightness = 50 + validationProgress * 30;
            particle.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            
            // Validation pulse effect
            const pulseIntensity = Math.sin(time * 0.2 + index * 0.1) * 0.3 + 0.7;
            particle.offsetY = Math.sin(time * 0.1 + validationProgress * Math.PI) * pulseIntensity;
            particle.offsetX = Math.cos(time * 0.08 + index * 0.2) * (validationProgress * 2);
          } else {
            // Pending validation state
            particle.color = `hsl(0, 0%, ${30 + Math.sin(time * 0.1) * 10}%)`;
            particle.offsetY = Math.sin(time * 0.05 + index) * 0.5;
          }
        } else {
          particle.validated = false;
          particle.char = particle.originalChar;
          particle.color = '#ffffff';
          particle.offsetX *= 0.9;
          particle.offsetY *= 0.9;
        }
        break;

      case 2: // Real-time Trading - Enhanced
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
        break;

      case 3: // AES Encryption
        if (isHovering) {
          const encryptionChars = ['█', '▓', '▒', '░', '◆', '◇', '●', '○'];
          particle.char = encryptionChars[Math.floor(time / 5 + index) % encryptionChars.length] || particle.originalChar;
          particle.color = '#4ecdc4';
          particle.offsetX = Math.cos(time * 0.1 + index * 0.3) * 3;
          particle.offsetY = Math.sin(time * 0.08 + index * 0.2) * 2;
        } else {
          particle.char = particle.originalChar;
          particle.color = '#4ecdc4';
          particle.offsetX *= 0.95;
          particle.offsetY *= 0.95;
        }
        break;

      case 4: // Distributed Ledger
        if (isHovering) {
          const ledgerChars = ['⟨', '⟩', '⟪', '⟫', '⟬', '⟭', '⟮', '⟯'];
          particle.char = ledgerChars[Math.floor(time / 8 + index) % ledgerChars.length] || particle.originalChar;
          particle.color = '#45b7d1';
          const wave = Math.sin(time * 0.03 + index * 0.1);
          particle.offsetX = wave * 4;
          particle.offsetY = Math.cos(time * 0.04 + index * 0.15) * 1.5;
        } else {
          particle.char = particle.originalChar;
          particle.color = '#45b7d1';
          particle.offsetX *= 0.9;
          particle.offsetY *= 0.9;
        }
        break;

      case 5: // SWIFT Network
        if (isHovering) {
          const swiftChars = ['→', '←', '↑', '↓', '↗', '↘', '↙', '↖'];
          particle.char = swiftChars[Math.floor(time / 6 + index) % swiftChars.length] || particle.originalChar;
          particle.color = '#96ceb4';
          const pulse = Math.sin(time * 0.15 + index * 0.5);
          particle.offsetX = pulse * Math.cos(index) * 3;
          particle.offsetY = pulse * Math.sin(index) * 3;
        } else {
          particle.char = particle.originalChar;
          particle.color = '#96ceb4';
          particle.offsetX *= 0.85;
          particle.offsetY *= 0.85;
        }
        break;

      case 6: // Risk Assessment
        if (isHovering) {
          const riskChars = ['⚠', '⚡', '⚪', '⚫', '◉', '◎', '⊗', '⊙'];
          particle.char = riskChars[Math.floor(time / 10 + index) % riskChars.length] || particle.originalChar;
          const riskLevel = particle.riskLevel || 0.5;
          particle.color = riskLevel > 0.7 ? '#ff4444' : riskLevel > 0.4 ? '#feca57' : '#00ff88';
          particle.offsetX = (Math.random() - 0.5) * riskLevel * 6;
          particle.offsetY = (Math.random() - 0.5) * riskLevel * 4;
        } else {
          particle.char = particle.originalChar;
          particle.color = '#feca57';
          particle.offsetX *= 0.8;
          particle.offsetY *= 0.8;
        }
        break;

      case 7: // Compliance Check
        if (isHovering) {
          const complianceChars = ['✓', '✗', '◐', '◑', '◒', '◓', '⊕', '⊖'];
          particle.char = complianceChars[Math.floor(time / 12 + index) % complianceChars.length] || particle.originalChar;
          particle.color = '#ff9ff3';
          const checkPhase = (time + index * 20) % 60;
          if (checkPhase < 30) {
            particle.offsetX = Math.sin(checkPhase * 0.2) * 2;
            particle.offsetY = Math.cos(checkPhase * 0.15) * 1;
          } else {
            particle.offsetX *= 0.95;
            particle.offsetY *= 0.95;
          }
        } else {
          particle.char = particle.originalChar;
          particle.color = '#ff9ff3';
          particle.offsetX = 0;
          particle.offsetY = 0;
        }
        break;

      case 8: // Trade Settlement
        if (isHovering) {
          const settlementChars = ['⟲', '⟳', '⥁', '⥂', '⥃', '⥄', '⥅', '⥆'];
          particle.char = settlementChars[Math.floor(time / 7 + index) % settlementChars.length] || particle.originalChar;
          particle.color = '#54a0ff';
          const rotation = time * 0.05 + index * 0.3;
          particle.offsetX = Math.cos(rotation) * 2.5;
          particle.offsetY = Math.sin(rotation) * 2.5;
        } else {
          particle.char = particle.originalChar;
          particle.color = '#54a0ff';
          particle.offsetX *= 0.92;
          particle.offsetY *= 0.92;
        }
        break;

      case 9: // Typing Animation
        if (isHovering) {
          const typingDelay = index * 3;
          if (time > typingDelay) {
            particle.char = particle.originalChar;
            particle.color = '#d63031';
            particle.offsetX = Math.sin(time * 0.2 + index) * 1;
            const cursor = (time + index) % 30 < 15 ? '|' : ' ';
            if (index === this.particles.length - 1) {
              particle.char = cursor;
            }
          } else {
            particle.char = ' ';
            particle.color = '#636e72';
          }
        } else {
          particle.char = particle.originalChar;
          particle.color = '#d63031';
          particle.offsetX = 0;
        }
        break;

      case 10: // Visual Selection
        if (isHovering) {
          particle.color = '#74b9ff';
          particle.offsetX = 0;
          particle.offsetY = 0;
          // Highlight effect with background
          this.ctx.fillStyle = 'rgba(116, 185, 255, 0.3)';
          this.ctx.fillRect(particle.baseX - 2, particle.baseY - 10, 12, 14);
        } else {
          particle.color = '#74b9ff';
        }
        break;

      case 11: // Syntax Highlight
        if (isHovering) {
          const syntaxColors = ['#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe', '#fd79a8'];
          particle.color = syntaxColors[index % syntaxColors.length] || '#dda0dd';
          particle.offsetX = Math.sin(time * 0.1 + index * 0.5) * 0.5;
          particle.offsetY = Math.cos(time * 0.08 + index * 0.3) * 0.5;
        } else {
          particle.color = '#dda0dd';
          particle.offsetX = 0;
          particle.offsetY = 0;
        }
        break;

      default:
        particle.color = '#ffffff';
        break;
    }
  }

  public getCurrentMode(): VimMode['mode'] {
    return this.currentMode;
  }

  public getCurrentEffect(): number {
    return this.currentEffect;
  }

  public getCurrentEffectName(): string {
    return this.effectNames[this.currentEffect] || 'Unknown';
  }

  // Public API to cycle color schemes, used by UI controls
  public nextScheme(): void {
    this.currentEffect = (this.currentEffect + 1) % this.effectNames.length;
    this.resetParticleStates();
    this.updateColorScheme();
    this.updateVimModeDisplay();
    this.updateBodyClasses();
  }

  public prevScheme(): void {
    this.currentEffect =
      (this.currentEffect - 1 + this.effectNames.length) % this.effectNames.length;
    this.resetParticleStates();
    this.updateColorScheme();
    this.updateVimModeDisplay();
    this.updateBodyClasses();
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    window.removeEventListener('resize', () => this.resize());
    this.canvas.removeEventListener('mousemove', (e) => this.updateMouse(e));
    document.removeEventListener('keydown', (e) => this.handleKeydown(e));
  }

  public pause(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resume(): void {
    if (!this.animationId) {
      this.animate();
    }
  }
}
