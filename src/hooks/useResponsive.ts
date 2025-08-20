import { useState, useEffect } from 'react';
import { 
  getCurrentBreakpoint, 
  isBreakpoint, 
  isMobile, 
  isTablet, 
  isDesktop,
  type Breakpoint 
} from '../utils/responsive';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => ({
    breakpoint: getCurrentBreakpoint(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const handleResize = () => {
      setState({
        breakpoint: getCurrentBreakpoint(),
        isMobile: isMobile(),
        isTablet: isTablet(),
        isDesktop: isDesktop(),
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
};

export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const [matches, setMatches] = useState(() => isBreakpoint(breakpoint));

  useEffect(() => {
    const handleResize = () => {
      setMatches(isBreakpoint(breakpoint));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return matches;
};

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};