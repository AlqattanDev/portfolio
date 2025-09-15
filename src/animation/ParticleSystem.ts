/**
 * Particle System
 * Handles particle creation, positioning, and rendering for ASCII animations
 */

import type { CanvasParticle } from '@/types';
import { ASCII_ART } from '@/utils/constants';

export class ParticleSystem {
  private particles: CanvasParticle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public createParticles(asciiArt?: string): void {
    this.particles = [];
    const artText = asciiArt || ASCII_ART.PORTFOLIO_NAME;
    const fontSize = 12;
    const lines = artText.split('\n');
    const lineHeight = fontSize * 1.2;
    const firstLine = lines[0] || '';
    const totalWidth = firstLine.length * (fontSize * 0.6);
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = 30;

    lines.forEach((line, lineIndex) => {
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex] || '';
        if (char && char !== ' ') {
          const x = startX + charIndex * (fontSize * 0.6);
          const y = startY + lineIndex * lineHeight;

          // Use deterministic values based on position for better predictability
          const deterministicSeed = lineIndex * 100 + charIndex;
          this.particles.push({
            char,
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

  public getParticles(): CanvasParticle[] {
    return this.particles;
  }

  public updateParticle(index: number, updates: Partial<CanvasParticle>): void {
    if (this.particles[index]) {
      Object.assign(this.particles[index], updates);
    }
  }

  public resetParticles(): void {
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
  }

  public renderParticles(time: number): void {
    this.ctx.font = '12px monospace';
    const isPrintMode = !document.body.classList.contains('digital-view');

    this.particles.forEach((particle) => {
      // Type-in effect with time-based animation
      if (!particle.typed && time > particle.index * 2) {
        particle.typed = true;
        particle.targetOpacity = 1;
      }

      // Smooth opacity animation
      particle.opacity += (particle.targetOpacity - particle.opacity) * 0.1;

      // Set color and effects based on mode
      if (isPrintMode) {
        // Print mode: static black text, no effects
        particle.color = '#000000';
        particle.offsetX = 0;
        particle.offsetY = 0;
        particle.targetOpacity = 1;
      }

      // Render the particle
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

  public resize(): void {
    // Recreate particles when canvas resizes
    this.createParticles();
  }

  public getParticleAt(x: number, y: number, threshold: number = 30): CanvasParticle | null {
    for (const particle of this.particles) {
      const distance = Math.sqrt(
        Math.pow(x - particle.baseX, 2) +
        Math.pow(y - particle.baseY, 2)
      );
      
      if (distance < threshold) {
        return particle;
      }
    }
    return null;
  }

  public getParticlesInRadius(x: number, y: number, radius: number): CanvasParticle[] {
    return this.particles.filter(particle => {
      const distance = Math.sqrt(
        Math.pow(x - particle.baseX, 2) +
        Math.pow(y - particle.baseY, 2)
      );
      return distance < radius;
    });
  }

  public destroy(): void {
    this.particles = [];
  }

  // Statistics and debugging
  public getStats() {
    return {
      particleCount: this.particles.length,
      typedParticles: this.particles.filter(p => p.typed).length,
      validatedParticles: this.particles.filter(p => p.validated).length,
      highlightedParticles: this.particles.filter(p => p.highlighted).length
    };
  }
}