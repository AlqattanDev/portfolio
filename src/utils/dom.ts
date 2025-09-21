/**
 * DOM Manipulation Utilities
 * Centralized DOM helpers with performance optimizations
 */

import { throttle, debounce } from '@/utils/performance';

/**
 * Element selection utilities
 */
export const select = {
  /**
   * Safe element selection with optional type checking
   */
  byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
  },

  /**
   * Safe query selector with optional type checking
   */
  one<T extends HTMLElement = HTMLElement>(
    selector: string,
    parent: ParentNode = document
  ): T | null {
    return parent.querySelector(selector) as T | null;
  },

  /**
   * Safe query selector all with type checking
   */
  all<T extends HTMLElement = HTMLElement>(
    selector: string,
    parent: ParentNode = document
  ): T[] {
    return Array.from(parent.querySelectorAll(selector)) as T[];
  },

  /**
   * Find closest parent matching selector
   */
  closest<T extends HTMLElement = HTMLElement>(
    element: Element,
    selector: string
  ): T | null {
    return element.closest(selector) as T | null;
  },

  /**
   * Find next sibling matching selector
   */
  nextSibling<T extends HTMLElement = HTMLElement>(
    element: Element,
    selector: string
  ): T | null {
    let sibling = element.nextElementSibling;
    while (sibling) {
      if (sibling.matches(selector)) {
        return sibling as T;
      }
      sibling = sibling.nextElementSibling;
    }
    return null;
  },

  /**
   * Find previous sibling matching selector
   */
  prevSibling<T extends HTMLElement = HTMLElement>(
    element: Element,
    selector: string
  ): T | null {
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling.matches(selector)) {
        return sibling as T;
      }
      sibling = sibling.previousElementSibling;
    }
    return null;
  },
};

/**
 * Element creation utilities
 */
export const create = {
  /**
   * Create element with attributes and children
   */
  element<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    attributes: Partial<HTMLElementTagNameMap[T]> &
      Record<string, unknown> = {},
    children: (Node | string)[] = []
  ): HTMLElementTagNameMap[T] {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value as string;
      } else if (key === 'textContent' || key === 'innerHTML') {
        (element as Record<string, unknown>)[key] = value;
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, String(value));
      } else if (key.startsWith('aria-')) {
        element.setAttribute(key, String(value));
      } else if (key in element) {
        (element as Record<string, unknown>)[key] = value;
      } else {
        element.setAttribute(key, String(value));
      }
    });

    // Append children
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });

    return element;
  },

  /**
   * Create text node
   */
  text(content: string): Text {
    return document.createTextNode(content);
  },

  /**
   * Create document fragment
   */
  fragment(): DocumentFragment {
    return document.createDocumentFragment();
  },

  /**
   * Create element from HTML string
   */
  fromHTML(html: string): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild as HTMLElement;
  },
};

/**
 * CSS class utilities
 */
export const css = {
  /**
   * Add classes with conditional logic
   */
  add(
    element: Element,
    ...classes: (string | undefined | null | false)[]
  ): void {
    const validClasses = classes.filter(
      (cls): cls is string => typeof cls === 'string' && cls.length > 0
    );
    if (validClasses.length > 0) {
      element.classList.add(...validClasses);
    }
  },

  /**
   * Remove classes safely
   */
  remove(element: Element, ...classes: string[]): void {
    element.classList.remove(...classes);
  },

  /**
   * Toggle class with optional condition
   */
  toggle(element: Element, className: string, condition?: boolean): boolean {
    if (condition !== undefined) {
      element.classList.toggle(className, condition);
      return condition;
    }
    return element.classList.toggle(className);
  },

  /**
   * Replace one class with another
   */
  replace(element: Element, oldClass: string, newClass: string): void {
    element.classList.replace(oldClass, newClass);
  },

  /**
   * Check if element has class
   */
  has(element: Element, className: string): boolean {
    return element.classList.contains(className);
  },

  /**
   * Get all classes as array
   */
  list(element: Element): string[] {
    return Array.from(element.classList);
  },
};

/**
 * Style manipulation utilities
 */
export const style = {
  /**
   * Set CSS custom property
   */
  setProperty(element: HTMLElement, property: string, value: string): void {
    element.style.setProperty(property, value);
  },

  /**
   * Get CSS custom property
   */
  getProperty(element: HTMLElement, property: string): string {
    return element.style.getPropertyValue(property);
  },

  /**
   * Set multiple styles at once
   */
  set(
    element: HTMLElement,
    styles: Record<string, string | number | null>
  ): void {
    Object.entries(styles).forEach(([prop, value]) => {
      if (value === null) {
        element.style.removeProperty(prop);
      } else {
        element.style.setProperty(prop, String(value));
      }
    });
  },

  /**
   * Get computed style value
   */
  computed(element: Element, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property);
  },

  /**
   * Force reflow (use sparingly)
   */
  forceReflow(element: HTMLElement): void {
    // Reading offsetHeight forces a reflow
    void element.offsetHeight;
  },
};

/**
 * Event handling utilities
 */
export const events = {
  /**
   * Add event listener with options
   */
  on<T extends HTMLElement, K extends keyof HTMLElementEventMap>(
    element: T,
    type: K,
    listener: (this: T, event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): () => void {
    element.addEventListener(type, listener as EventListener, options);
    return () =>
      element.removeEventListener(type, listener as EventListener, options);
  },

  /**
   * Add event listener to multiple elements
   */
  onAll<T extends HTMLElement, K extends keyof HTMLElementEventMap>(
    elements: T[],
    type: K,
    listener: (this: T, event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): () => void {
    const cleanupFunctions = elements.map((element) =>
      this.on(element, type, listener, options)
    );
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  },

  /**
   * Add event listener with delegation
   */
  delegate<K extends keyof HTMLElementEventMap>(
    container: HTMLElement,
    type: K,
    selector: string,
    listener: (event: HTMLElementEventMap[K], target: Element) => void,
    options?: AddEventListenerOptions
  ): () => void {
    const delegatedListener = (event: HTMLElementEventMap[K]) => {
      const target = (event.target as Element)?.closest(selector);
      if (target && container.contains(target)) {
        listener(event, target);
      }
    };

    container.addEventListener(
      type,
      delegatedListener as EventListener,
      options
    );
    return () =>
      container.removeEventListener(
        type,
        delegatedListener as EventListener,
        options
      );
  },

  /**
   * Add throttled event listener
   */
  onThrottled<T extends HTMLElement, K extends keyof HTMLElementEventMap>(
    element: T,
    type: K,
    listener: (this: T, event: HTMLElementEventMap[K]) => void,
    delay: number = 16,
    options?: AddEventListenerOptions
  ): () => void {
    const throttledListener = throttle(listener, delay);
    return this.on(element, type, throttledListener, options);
  },

  /**
   * Add debounced event listener
   */
  onDebounced<T extends HTMLElement, K extends keyof HTMLElementEventMap>(
    element: T,
    type: K,
    listener: (this: T, event: HTMLElementEventMap[K]) => void,
    delay: number = 250,
    options?: AddEventListenerOptions
  ): () => void {
    const debouncedListener = debounce(listener, delay);
    return this.on(element, type, debouncedListener, options);
  },

  /**
   * Trigger custom event
   */
  trigger(element: Element, eventName: string, detail?: unknown): boolean {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });
    return element.dispatchEvent(event);
  },
};

/**
 * Animation utilities
 */
export const animate = {
  /**
   * Fade in element
   */
  fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease-in-out`;

      style.forceReflow(element);

      element.style.opacity = '1';
      setTimeout(resolve, duration);
    });
  },

  /**
   * Fade out element
   */
  fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      element.style.opacity = '0';
      setTimeout(resolve, duration);
    });
  },

  /**
   * Slide down element
   */
  slideDown(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startHeight = element.scrollHeight;
      element.style.height = '0px';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease-in-out`;

      style.forceReflow(element);

      element.style.height = startHeight + 'px';
      setTimeout(() => {
        element.style.height = 'auto';
        element.style.overflow = '';
        resolve();
      }, duration);
    });
  },

  /**
   * Slide up element
   */
  slideUp(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const startHeight = element.scrollHeight;
      element.style.height = startHeight + 'px';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease-in-out`;

      style.forceReflow(element);

      element.style.height = '0px';
      setTimeout(resolve, duration);
    });
  },
};

/**
 * Scroll utilities
 */
export const scroll = {
  /**
   * Smooth scroll to element
   */
  to(element: Element, options: ScrollIntoViewOptions = {}): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options,
    });
  },

  /**
   * Smooth scroll to position
   */
  toPosition(x: number, y: number, behavior: ScrollBehavior = 'smooth'): void {
    window.scrollTo({ top: y, left: x, behavior });
  },

  /**
   * Smooth scroll to top
   */
  toTop(behavior: ScrollBehavior = 'smooth'): void {
    this.toPosition(0, 0, behavior);
  },

  /**
   * Smooth scroll to bottom
   */
  toBottom(behavior: ScrollBehavior = 'smooth'): void {
    this.toPosition(0, document.body.scrollHeight, behavior);
  },

  /**
   * Get scroll position
   */
  getPosition(): { x: number; y: number } {
    return {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset,
    };
  },

  /**
   * Check if element is in viewport
   */
  isInViewport(element: Element, threshold: number = 0): boolean {
    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= windowHeight + threshold &&
      rect.right <= windowWidth + threshold
    );
  },
};

/**
 * Form utilities
 */
export const form = {
  /**
   * Get form data as object
   */
  getData(form: HTMLFormElement): Record<string, string> {
    const formData = new FormData(form);
    const data: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value as string;
    }

    return data;
  },

  /**
   * Set form data from object
   */
  setData(form: HTMLFormElement, data: Record<string, string>): void {
    Object.entries(data).forEach(([name, value]) => {
      const field = form.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(`[name="${name}"]`);
      if (field) {
        field.value = value;
      }
    });
  },

  /**
   * Validate form field
   */
  validateField(field: HTMLInputElement): boolean {
    return field.checkValidity();
  },

  /**
   * Reset form with animation
   */
  reset(form: HTMLFormElement, animate: boolean = true): Promise<void> {
    if (animate) {
      return this.fadeOut(form, 150).then(() => {
        form.reset();
        return this.fadeIn(form, 150);
      });
    } else {
      form.reset();
      return Promise.resolve();
    }
  },
};

// Export all utilities as a single object for convenience
export const dom = {
  select,
  create,
  css,
  style,
  events,
  animate,
  scroll,
  form,
};
