import type { Route, MatchResult } from '../types';


class StackRouter {
  navigate(path: string): void {
    throw new Error('TODO');
  } 
  back(): void {
    throw new Error('TODO');
  }
  match(path: string): MatchResult | null {
    throw new Error('TODO');
  }
  refresh(): void {
    throw new Error('TODO');
  }
}
