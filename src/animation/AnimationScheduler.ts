/**
 * Animation Scheduler
 * Centralized RequestAnimationFrame scheduler for performance optimization
 */

export class AnimationScheduler {
  private tasks = new Set<() => boolean | void>();
  private isRunning = false;
  private animationId: number | null = null;

  public add(task: () => boolean | void): () => void {
    this.tasks.add(task);
    if (!this.isRunning) {
      this.start();
    }

    // Return cleanup function
    return () => this.remove(task);
  }

  public remove(task: () => boolean | void): void {
    this.tasks.delete(task);
    if (this.tasks.size === 0) {
      this.stop();
    }
  }

  private start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  private stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    // Execute all animation tasks
    for (const task of this.tasks) {
      try {
        const shouldContinue = task();
        if (shouldContinue === false) {
          this.tasks.delete(task);
        }
      } catch (error) {
        // Optionally handle the error, e.g., log to a different service
        this.tasks.delete(task);
      }
    }

    if (this.tasks.size > 0) {
      this.animationId = requestAnimationFrame(this.tick);
    } else {
      this.isRunning = false;
      this.animationId = null;
    }
  };

  public destroy(): void {
    this.tasks.clear();
    this.stop();
  }

  public getActiveTaskCount(): number {
    return this.tasks.size;
  }

  public pause(): void {
    this.stop();
  }

  public resume(): void {
    if (this.tasks.size > 0 && !this.isRunning) {
      this.start();
    }
  }
}

// Global animation scheduler instance
export const globalScheduler = new AnimationScheduler();
