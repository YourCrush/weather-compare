/**
 * Responsive design utilities and breakpoint management
 */

export const breakpoints = {
  xs: 360,   // Extra small devices
  sm: 640,   // Small devices
  md: 768,   // Medium devices
  lg: 1024,  // Large devices
  xl: 1280,  // Extra large devices
  '2xl': 1536, // 2X large devices
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Get current breakpoint based on window width
 */
export const getCurrentBreakpoint = (): Breakpoint => {
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Check if current viewport matches a breakpoint
 */
export const isBreakpoint = (breakpoint: Breakpoint): boolean => {
  return window.innerWidth >= breakpoints[breakpoint];
};

/**
 * Check if viewport is mobile (below md breakpoint)
 */
export const isMobile = (): boolean => {
  return window.innerWidth < breakpoints.md;
};

/**
 * Check if viewport is tablet (md to lg)
 */
export const isTablet = (): boolean => {
  const width = window.innerWidth;
  return width >= breakpoints.md && width < breakpoints.lg;
};

/**
 * Check if viewport is desktop (lg and above)
 */
export const isDesktop = (): boolean => {
  return window.innerWidth >= breakpoints.lg;
};

/**
 * Media query strings for CSS-in-JS
 */
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  
  // Max width queries
  maxXs: `(max-width: ${breakpoints.xs - 1}px)`,
  maxSm: `(max-width: ${breakpoints.sm - 1}px)`,
  maxMd: `(max-width: ${breakpoints.md - 1}px)`,
  maxLg: `(max-width: ${breakpoints.lg - 1}px)`,
  maxXl: `(max-width: ${breakpoints.xl - 1}px)`,
  max2xl: `(max-width: ${breakpoints['2xl'] - 1}px)`,
} as const;

/**
 * Responsive grid utilities
 */
export const gridUtils = {
  /**
   * Get responsive column classes based on breakpoint
   */
  getColumns: (
    xs: number = 1,
    sm?: number,
    md?: number,
    lg?: number,
    xl?: number
  ): string => {
    const classes = [`grid-cols-${xs}`];
    
    if (sm) classes.push(`sm:grid-cols-${sm}`);
    if (md) classes.push(`md:grid-cols-${md}`);
    if (lg) classes.push(`lg:grid-cols-${lg}`);
    if (xl) classes.push(`xl:grid-cols-${xl}`);
    
    return classes.join(' ');
  },

  /**
   * Get responsive gap classes
   */
  getGap: (
    xs: number = 4,
    sm?: number,
    md?: number,
    lg?: number
  ): string => {
    const classes = [`gap-${xs}`];
    
    if (sm) classes.push(`sm:gap-${sm}`);
    if (md) classes.push(`md:gap-${md}`);
    if (lg) classes.push(`lg:gap-${lg}`);
    
    return classes.join(' ');
  },
};

/**
 * Responsive text utilities
 */
export const textUtils = {
  /**
   * Get responsive text size classes
   */
  getTextSize: (
    xs: string = 'text-sm',
    sm?: string,
    md?: string,
    lg?: string
  ): string => {
    const classes = [xs];
    
    if (sm) classes.push(`sm:${sm}`);
    if (md) classes.push(`md:${md}`);
    if (lg) classes.push(`lg:${lg}`);
    
    return classes.join(' ');
  },

  /**
   * Get responsive padding classes
   */
  getPadding: (
    xs: string = 'p-4',
    sm?: string,
    md?: string,
    lg?: string
  ): string => {
    const classes = [xs];
    
    if (sm) classes.push(`sm:${sm}`);
    if (md) classes.push(`md:${md}`);
    if (lg) classes.push(`lg:${lg}`);
    
    return classes.join(' ');
  },
};

/**
 * Touch and gesture utilities
 */
export const touchUtils = {
  /**
   * Check if device supports touch
   */
  isTouchDevice: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Get appropriate click/touch event handlers
   */
  getInteractionProps: (onClick: () => void) => {
    if (touchUtils.isTouchDevice()) {
      return {
        onTouchEnd: (e: React.TouchEvent) => {
          e.preventDefault();
          onClick();
        },
      };
    }
    return { onClick };
  },

  /**
   * Add touch-friendly sizing to interactive elements
   */
  getTouchTargetSize: (size: 'sm' | 'md' | 'lg' = 'md'): string => {
    const sizes = {
      sm: 'min-h-[44px] min-w-[44px]', // 44px is iOS minimum
      md: 'min-h-[48px] min-w-[48px]', // 48dp is Android minimum
      lg: 'min-h-[56px] min-w-[56px]', // Larger touch targets
    };
    
    return sizes[size];
  },
};

/**
 * Viewport utilities
 */
export const viewportUtils = {
  /**
   * Get viewport dimensions
   */
  getDimensions: () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }),

  /**
   * Check if element is in viewport
   */
  isInViewport: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  },

  /**
   * Scroll element into view with smooth behavior
   */
  scrollIntoView: (element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void => {
    element.scrollIntoView({
      behavior,
      block: 'nearest',
      inline: 'nearest',
    });
  },
};

/**
 * Container query utilities (for modern browsers)
 */
export const containerUtils = {
  /**
   * Check if container queries are supported
   */
  isSupported: (): boolean => {
    return 'container' in document.documentElement.style;
  },

  /**
   * Get container query classes
   */
  getContainerClasses: (name?: string): string => {
    const baseClass = '@container';
    return name ? `${baseClass}/${name}` : baseClass;
  },
};

/**
 * Responsive image utilities
 */
export const imageUtils = {
  /**
   * Generate responsive image sizes attribute
   */
  getSizes: (
    xs: string = '100vw',
    sm?: string,
    md?: string,
    lg?: string
  ): string => {
    const sizes = [];
    
    if (lg) sizes.push(`(min-width: ${breakpoints.lg}px) ${lg}`);
    if (md) sizes.push(`(min-width: ${breakpoints.md}px) ${md}`);
    if (sm) sizes.push(`(min-width: ${breakpoints.sm}px) ${sm}`);
    sizes.push(xs);
    
    return sizes.join(', ');
  },
};