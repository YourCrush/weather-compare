// Type declarations for React when node_modules is not available locally

// First, declare the global React namespace
declare global {
  namespace React {
    type ReactNode = JSX.Element | string | number | boolean | null | undefined | ReactNode[];
    type Reducer<S, A> = (prevState: S, action: A) => S;
    type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
    type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
    type Dispatch<A> = (value: A) => void;

    interface FC<P = {}> {
      (props: P): JSX.Element | null;
    }
    
    interface Component<P = {}, S = {}> {
      props: P;
      state: S;
    }

    interface Context<T> {
      Provider: FC<{ value: T; children?: ReactNode }>;
      Consumer: FC<{ children: (value: T) => ReactNode }>;
    }
  }
}

// Then declare the React module
declare module 'react' {
  // Export all the hooks as named exports
  export function useState<T>(initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: React.Context<T>): T;
  export function useReducer<R extends React.Reducer<any, any>>(
    reducer: R,
    initialState: React.ReducerState<R>,
    initializer?: undefined
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];

  // Export React types
  export type FC<P = {}> = React.FC<P>;
  export type Component<P = {}, S = {}> = React.Component<P, S>;
  export type ReactNode = React.ReactNode;
  export type Context<T> = React.Context<T>;
  export type Reducer<S, A> = React.Reducer<S, A>;
  export type Dispatch<A> = React.Dispatch<A>;
  export type SetStateAction<S> = S | ((prevState: S) => S);

  // Default export - the React object itself
  declare const React: {
    FC: typeof FC;
    Component: typeof Component;
    useState: typeof useState;
    useEffect: typeof useEffect;
    useMemo: typeof useMemo;
    useCallback: typeof useCallback;
    useRef: typeof useRef;
    useContext: typeof useContext;
    useReducer: typeof useReducer;
  };
  
  export default React;
}

declare module 'react-dom' {
  export function render(element: JSX.Element, container: Element | null): void;
  export function createRoot(container: Element): {
    render(element: JSX.Element): void;
    unmount(): void;
  };
}

declare namespace JSX {
  interface Element {
    type: any;
    props: any;
    key: any;
  }
  
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  
  interface ElementAttributesProperty {
    props: {};
  }
  
  interface ElementChildrenAttribute {
    children: {};
  }
}