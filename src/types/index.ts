export interface Product {
  id : number,
  name : string,
  category : string,
  price : number,
  stock : number,
  rating : number,
  description : string
}

export type Props = Record<string, unknown> & { key?: string | number }

// VNode peut être une string car les engant d'une balise html peuvent être une balise ou du simple texte
export type VChild = VNode | string;

export interface VNode {
  type: string;        // 'div', 'table', ...
  props: Props;        // attributs + handlers onClick, onInput...
  children: VChild[];
}


export type Compare<T> = (a: T, b: T) => number; 
export type SortAlgorithm = 'insertion' | 'quick' | 'merge';
export type SearchAlgorithm = 'linear' | 'binary';

export type RouteParams = Record<string, string>;
export type PageComponent = (params: RouteParams) => VNode;
export interface Route { path: string; component: PageComponent; }
export interface MatchResult { route: Route; params: RouteParams; }

export type Patch =
  | { type: 'CREATE';  path: number[]; node: VChild }   // ajouter un nœud
  | { type: 'REMOVE';  path: number[] }                 // supprimer un nœud
  | { type: 'REPLACE'; path: number[]; node: VChild }   // remplacer (balise différente)
  | { type: 'TEXT';    path: number[]; value: string }  // changer un texte
  | { type: 'PROPS';   path: number[]; set: Props; remove: string[] }; // changer des attributs

