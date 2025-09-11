import { beforeEach } from 'vitest';

// Mock window.matchMedia for components that use CSS media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for lazy loading tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch for API testing
global.fetch = vi.fn();

// Mock HTMLCanvasElement for canvas-based components
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type) => {
  if (type === '2d') {
    return {
      clearRect: vi.fn(),
      fillText: vi.fn(),
      fillRect: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 100 }),
      // Add other canvas context methods as needed
      font: '',
      fillStyle: '',
      globalAlpha: 1,
    };
  }
  return null;
});

// Clean up between tests
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();

  // Clean up DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});
