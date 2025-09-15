/**
 * Theme and color scheme constants
 */

export const COLOR_SCHEMES = {
  MATRIX: 'scheme-matrix',
  BLOCKCHAIN: 'scheme-blockchain',
  TRADING: 'scheme-trading',
  ENCRYPTION: 'scheme-encryption',
  LEDGER: 'scheme-ledger',
  SWIFT: 'scheme-swift',
  RISK: 'scheme-risk',
  COMPLIANCE: 'scheme-compliance',
  SETTLEMENT: 'scheme-settlement',
  GRUVBOX: 'scheme-gruvbox',
  GRUVBOX_VISUAL: 'scheme-gruvbox-visual',
  GRUVBOX_SYNTAX: 'scheme-gruvbox-syntax',
} as const;

export const EFFECT_NAMES = [
  'Matrix Rain',
  'Blockchain Validation',
  'Real-time Trading',
  'AES Encryption',
  'Distributed Ledger',
  'SWIFT Network',
  'Risk Assessment',
  'Compliance Check',
  'Trade Settlement',
  'Typing Animation',
  'Visual Selection',
  'Syntax Highlight',
] as const;

export const VIM_MODES = {
  NORMAL: 'NORMAL',
  INSERT: 'INSERT',
  VISUAL: 'VISUAL',
  COMMAND: 'COMMAND',
} as const;

// Vim keybindings configuration
export const VIM_KEYBINDINGS = {
  // Mode switching keys
  MODE_KEYS: {
    ESCAPE: 'Escape',
    INSERT: 'i',
    VISUAL: 'v',
    COMMAND: ':',
  },
  // Navigation keys
  NAVIGATION: {
    SCROLL_DOWN: 'j',
    SCROLL_UP: 'k',
    GO_TO_TOP: 'g',
    GO_TO_BOTTOM: 'G',
  },
  // Color scheme keys
  SCHEME: {
    NEXT: 'n',
    PREVIOUS: 'N',
  },
  // Key sequences
  SEQUENCES: {
    GO_TO_TOP: ['g', 'g'],
  },
  // Timeouts and delays
  TIMINGS: {
    SEQUENCE_TIMEOUT: 500,
    COMMAND_DISPLAY_DURATION: 1500,
    SCROLL_AMOUNT: 50,
  },
  // Command descriptions for status display (keep short for fixed width)
  COMMAND_DESCRIPTIONS: {
    'Escape': 'NORMAL',
    'i': 'INSERT',
    'v': 'VISUAL', 
    ':': 'COMMAND',
    'n': 'NEXT →',
    'N': '← PREV',
    'j': 'j ↓',
    'k': 'k ↑', 
    'g': 'g...',
    'gg': 'gg ↑↑',
    'G': 'G ↓↓',
  },
} as const;

export const TRANSITION_SPEEDS = {
  FAST: '150ms',
  NORMAL: '250ms',
  SLOW: '400ms',
  EXTRA_SLOW: '600ms',
} as const;

export const ANIMATION_EASINGS = {
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  LINEAR: 'linear',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
} as const;

export const Z_INDEX_LAYERS = {
  BACKGROUND: -1,
  BASE: 0,
  CONTENT: 1,
  HEADER: 10,
  OVERLAY: 100,
  MODAL: 1000,
  TOOLTIP: 10000,
} as const;

// CSS Custom Properties (used in components)
export const CSS_VARIABLES = {
  // Colors
  BACKGROUND_DIGITAL: '--background-digital',
  FOREGROUND_DIGITAL: '--foreground-digital',
  MUTED_DIGITAL: '--muted-digital',
  BORDER_DIGITAL: '--border-digital',
  ACCENT_DIGITAL: '--accent-digital',
  
  BACKGROUND_PRINT: '--background-print',
  FOREGROUND_PRINT: '--foreground-print',
  MUTED_PRINT: '--muted-print',
  BORDER_PRINT: '--border-print',
  ACCENT_PRINT: '--accent-print',
  
  // Typography
  FONT_BODY: '--font-body',
  FONT_ACCENT: '--font-accent',
  
  // Animation
  TRANSITION_SPEED: '--transition-speed',
} as const;

// Default theme configuration
export const DEFAULT_THEME = {
  colorScheme: COLOR_SCHEMES.MATRIX,
  viewMode: 'digital' as const,
  transitionSpeed: TRANSITION_SPEEDS.NORMAL,
  easing: ANIMATION_EASINGS.SMOOTH,
  enableAnimations: true,
  enableSounds: false,
  reducedMotion: false,
} as const;

// ASCII art constants
export const ASCII_ART = {
  PORTFOLIO_NAME: `█████╗ ██╗     ██╗      █████╗ ██╗      ██████╗  █████╗ ████████╗████████╗ █████╗ ███╗   ██╗
██╔══██╗██║     ██║     ██╔══██╗██║     ██╔═══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗████╗  ██║
███████║██║     ██║     ███████║██║     ██║   ██║███████║   ██║      ██║   ███████║██╔██╗ ██║
██╔══██║██║     ██║     ██╔══██║██║     ██║▄▄ ██║██╔══██║   ██║      ██║   ██╔══██║██║╚██╗██║
██║  ██║███████╗██║     ██║  ██║███████╗╚██████╔╝██║  ██║   ██║      ██║   ██║  ██║██║ ╚████║
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝ ╚══▀▀═╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝`,
} as const;

export const ASCII_CHARS = {
  FILLED_BLOCKS: ['█', '▉', '▊', '▋', '▌', '▍', '▎', '▏'],
  SHADE_BLOCKS: ['░', '▒', '▓', '█'],
  BOX_DRAWING: {
    HORIZONTAL: '─',
    VERTICAL: '│',
    TOP_LEFT: '┌',
    TOP_RIGHT: '┐',
    BOTTOM_LEFT: '└',
    BOTTOM_RIGHT: '┘',
    CROSS: '┼',
    T_UP: '┴',
    T_DOWN: '┬',
    T_LEFT: '┤',
    T_RIGHT: '├',
  },
  PROGRESS: {
    FULL: '██',
    THREE_QUARTER: '▓▓',
    HALF: '▒▒',
    QUARTER: '░░',
    EMPTY: '  ',
  },
} as const;

export type ColorScheme = typeof COLOR_SCHEMES[keyof typeof COLOR_SCHEMES];
export type EffectName = typeof EFFECT_NAMES[number];
export type VimMode = typeof VIM_MODES[keyof typeof VIM_MODES];
export type TransitionSpeed = typeof TRANSITION_SPEEDS[keyof typeof TRANSITION_SPEEDS];
export type AnimationEasing = typeof ANIMATION_EASINGS[keyof typeof ANIMATION_EASINGS];
export type Breakpoint = typeof BREAKPOINTS[keyof typeof BREAKPOINTS];