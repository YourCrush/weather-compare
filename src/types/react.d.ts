// Type declarations for React when node_modules is not available locally
declare module 'react' {
  // React hooks
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: Context<T>): T;
  export function useReducer<R extends Reducer<any, any>>(
    reducer: R,
    initialState: ReducerState<R>,
    initializer?: undefined
  ): [ReducerState<R>, Dispatch<ReducerAction<R>>];

  // React types
  export interface FC<P = {}> {
    (props: P): JSX.Element | null;
  }
  
  export interface Component<P = {}, S = {}> {
    props: P;
    state: S;
  }

  export interface Context<T> {
    Provider: FC<{ value: T; children?: ReactNode }>;
    Consumer: FC<{ children: (value: T) => ReactNode }>;
  }

  export type ReactNode = JSX.Element | string | number | boolean | null | undefined | ReactNode[];
  export type Reducer<S, A> = (prevState: S, action: A) => S;
  export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
  export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
  export type Dispatch<A> = (value: A) => void;

  // Default export
  const React: {
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