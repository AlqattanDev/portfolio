/**
 * Vim System
 * Centralized vim mode handling and keybinding management
 */

import type { VimMode } from '@/types';
import { VIM_MODES, VIM_KEYBINDINGS } from '@/utils/constants';

export interface VimSystemCallbacks {
  onModeChange?: (mode: VimMode['mode']) => void;
  onSchemeChange?: (direction: 'next' | 'prev') => void;
  onScroll?: (direction: 'up' | 'down', amount: number) => void;
  onGoToTop?: () => void;
  onGoToBottom?: () => void;
}

export class VimSystem {
  private currentMode: VimMode['mode'] = VIM_MODES.NORMAL;
  private lastKey: string = '';
  private lastKeyTime: number = 0;
  private callbacks: VimSystemCallbacks;
  private commandTimeout: number | null = null;

  constructor(callbacks: VimSystemCallbacks = {}) {
    this.callbacks = callbacks;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    console.log('VimSystem: Setting up event listeners');
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  public handleKeydown(e: KeyboardEvent): boolean {
    // Only handle keys in digital view
    const hasDigitalView = document.body.classList.contains('digital-view');
    console.log(`VimSystem: Key '${e.key}' pressed, digital-view: ${hasDigitalView}`);
    
    if (!hasDigitalView) {
      console.log('VimSystem: Ignoring key - not in digital view');
      return false;
    }

    let modeChanged = false;
    let actionTaken = false;

    // Handle escape key (always works)
    if (e.key === VIM_KEYBINDINGS.MODE_KEYS.ESCAPE) {
      this.changeMode(VIM_MODES.NORMAL);
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['Escape']);
      modeChanged = true;
    } 
    // Handle keys in normal mode
    else if (this.currentMode === VIM_MODES.NORMAL) {
      actionTaken = this.handleNormalModeKeys(e);
      if (actionTaken) {
        modeChanged = true;
      }
    }

    if (modeChanged || actionTaken) {
      this.updateBodyClasses();
      return true;
    }

    return false;
  }

  private handleNormalModeKeys(e: KeyboardEvent): boolean {
    const key = e.key;

    // Mode switching
    if (key === VIM_KEYBINDINGS.MODE_KEYS.INSERT) {
      this.changeMode(VIM_MODES.INSERT);
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['i']);
      return true;
    }
    
    if (key === VIM_KEYBINDINGS.MODE_KEYS.VISUAL) {
      this.changeMode(VIM_MODES.VISUAL);
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['v']);
      return true;
    }
    
    if (key === VIM_KEYBINDINGS.MODE_KEYS.COMMAND) {
      this.changeMode(VIM_MODES.COMMAND);
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS[':']);
      return true;
    }

    // Navigation and actions
    if (key === VIM_KEYBINDINGS.SCHEME.NEXT) {
      e.preventDefault();
      this.callbacks.onSchemeChange?.('next');
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['n']);
      return true;
    }
    
    if (key === VIM_KEYBINDINGS.SCHEME.PREVIOUS) {
      e.preventDefault();
      this.callbacks.onSchemeChange?.('prev');
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['N']);
      return true;
    }
    
    if (key === VIM_KEYBINDINGS.NAVIGATION.SCROLL_DOWN) {
      e.preventDefault();
      this.callbacks.onScroll?.('down', VIM_KEYBINDINGS.TIMINGS.SCROLL_AMOUNT);
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['j']);
      return true;
    }
    
    if (key === VIM_KEYBINDINGS.NAVIGATION.SCROLL_UP) {
      e.preventDefault();
      this.callbacks.onScroll?.('up', VIM_KEYBINDINGS.TIMINGS.SCROLL_AMOUNT);
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['k']);
      return true;
    }
    
    if (key === VIM_KEYBINDINGS.NAVIGATION.GO_TO_TOP) {
      e.preventDefault();
      return this.handleGoToTopSequence();
    }
    
    if (key === VIM_KEYBINDINGS.NAVIGATION.GO_TO_BOTTOM) {
      e.preventDefault();
      this.callbacks.onGoToBottom?.();
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['G']);
      return true;
    }

    return false;
  }

  private handleGoToTopSequence(): boolean {
    const now = Date.now();
    const timeDiff = now - this.lastKeyTime;
    
    if (this.lastKey === VIM_KEYBINDINGS.NAVIGATION.GO_TO_TOP && 
        timeDiff < VIM_KEYBINDINGS.TIMINGS.SEQUENCE_TIMEOUT) {
      // Complete 'gg' sequence
      this.callbacks.onGoToTop?.();
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['gg']);
      this.clearKeySequence();
      return true;
    } else {
      // Start 'g' sequence
      this.showCommand(VIM_KEYBINDINGS.COMMAND_DESCRIPTIONS['g']);
      this.lastKey = VIM_KEYBINDINGS.NAVIGATION.GO_TO_TOP;
      this.lastKeyTime = now;
      
      // Clear sequence after timeout
      setTimeout(() => {
        if (this.lastKey === VIM_KEYBINDINGS.NAVIGATION.GO_TO_TOP) {
          this.clearCommand();
          this.clearKeySequence();
        }
      }, VIM_KEYBINDINGS.TIMINGS.SEQUENCE_TIMEOUT);
      
      return true;
    }
  }

  private changeMode(mode: VimMode['mode']): void {
    this.currentMode = mode;
    this.callbacks.onModeChange?.(mode);
    this.updateVimModeDisplay();
  }

  private showCommand(command: string): void {
    const modeElement = document.getElementById('statusMode');
    if (modeElement) {
      modeElement.textContent = command;
      
      // Clear any existing timeout
      if (this.commandTimeout) {
        clearTimeout(this.commandTimeout);
      }
      
      // Restore original mode after delay
      this.commandTimeout = setTimeout(() => {
        if (modeElement.textContent === command) {
          modeElement.textContent = this.currentMode;
        }
        this.commandTimeout = null;
      }, VIM_KEYBINDINGS.TIMINGS.COMMAND_DISPLAY_DURATION);
    }
  }

  private clearCommand(): void {
    const modeElement = document.getElementById('statusMode');
    if (modeElement) {
      modeElement.textContent = this.currentMode;
    }
    
    if (this.commandTimeout) {
      clearTimeout(this.commandTimeout);
      this.commandTimeout = null;
    }
  }

  private clearKeySequence(): void {
    this.lastKey = '';
    this.lastKeyTime = 0;
  }

  private updateVimModeDisplay(): void {
    const modeElement = document.getElementById('statusMode');
    if (modeElement) {
      modeElement.textContent = this.currentMode;
      modeElement.className = `status-mode ${this.currentMode.toLowerCase()}`;
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

  // Public API
  public getCurrentMode(): VimMode['mode'] {
    return this.currentMode;
  }

  public setMode(mode: VimMode['mode']): void {
    this.changeMode(mode);
  }

  public destroy(): void {
    document.removeEventListener('keydown', (e) => this.handleKeydown(e));
    
    if (this.commandTimeout) {
      clearTimeout(this.commandTimeout);
      this.commandTimeout = null;
    }
  }

  // Static utility methods
  public static getDefaultScrollBehavior(): ScrollBehavior {
    return 'smooth';
  }

  public static getScrollAmount(): number {
    return VIM_KEYBINDINGS.TIMINGS.SCROLL_AMOUNT;
  }

  public static isVimKey(key: string): boolean {
    const allKeys = [
      ...Object.values(VIM_KEYBINDINGS.MODE_KEYS),
      ...Object.values(VIM_KEYBINDINGS.NAVIGATION),
      ...Object.values(VIM_KEYBINDINGS.SCHEME),
    ];
    return allKeys.includes(key);
  }
}