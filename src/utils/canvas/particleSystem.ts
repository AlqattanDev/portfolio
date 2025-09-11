/**
 * Particle System for ASCII Canvas
 * Handles particle creation, positioning, and rendering
 */

import type { CanvasParticle } from '@/types/animation.js';

export class ParticleSystem {
  private particles: CanvasParticle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  createParticles(asciiName: string): void {
    this.particles = [];
    const fontSize = 12;
    const lines = asciiName.split('\n');
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

  getParticles(): CanvasParticle[] {
    return this.particles;
  }

  updateParticle(index: number, updates: Partial<CanvasParticle>): void {
    if (this.particles[index]) {
      Object.assign(this.particles[index], updates);
    }
  }

  resetParticles(): void {
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

  renderParticles(): void {
    this.ctx.font = '12px monospace';
    const isPrintMode = !document.body.classList.contains('digital-view');

    this.particles.forEach((particle) => {
      // Type-in effect
      if (!particle.typed && Date.now() > particle.index * 50) {
        // Simplified timing
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

  resize(): void {
    // Recreate particles when canvas resizes
    this.createParticles(this.getASCIIArt());
  }

  private getASCIIArt(): string {
    // This would be passed in or configured
    return `█████╗ ██╗     ██╗      █████╗ ██╗      ██████╗  █████╗ ████████╗████████╗ █████╗ ███╗   ██╗
██╔══██╗██║     ██║     ██╔══██╗██║     ██╔═══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗████╗  ██║
███████║██║     ██║     ███████║██║     ██║   ██║███████║   ██║      ██║   ███████║██╔██╗ ██║
██╔══██║██║     ██║     ██╔══██║██║     ██║▄▄ ██║██╔══██║   ██║      ██║   ██╔══██║██║╚██╗██║
██║  ██║███████╗██║     ██║  ██║███████╗╚██████╔╝██║  ██║   ██║      ██║   ██║  ██║██║ ╚████║
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝ ╚══▀▀═╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝`;
  }
}
