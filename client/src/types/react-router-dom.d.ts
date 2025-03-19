declare module 'react-router-dom' {
  import { ComponentType } from 'react';

  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: any;
  }

  export interface NavigateFunction {
    (to: string | number, options?: { replace?: boolean; state?: any }): void;
  }

  export function useLocation(): Location;
  export function useNavigate(): NavigateFunction;
  export const BrowserRouter: ComponentType<{ children?: React.ReactNode }>;
} 