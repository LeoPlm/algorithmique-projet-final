# AGENTS.md — Algo Framework (examen d'algorithmique ESGI)

Ce fichier décrit le projet pour les assistants IA. **Le lire entièrement avant toute action.**

## 1. Contexte

Projet d'examen : construire un **mini-framework frontend en TypeScript from scratch** qui met en œuvre
les algorithmes du cours (pile, récursivité, recherche, tri), plus une petite app de catalogue produits.

## 2. Règles absolues (NE PAS ENFREINDRE)

- ❌ **Pas de React, Vue, Svelte, Preact, lit, ni aucune librairie runtime.** Le nom du dossier
  (`algo-react`) est trompeur : React est **interdit**. On réimplémente nous-mêmes `h()`, `render()`, `diff()`, etc.
- ❌ **Aucune dépendance npm à ajouter.** Seuls `vite` et `typescript` (devDependencies) sont autorisés.
  Ne jamais lancer `npm install <paquet>`.
- ❌ **Pas de JSX / TSX.** Les vues s'écrivent avec la fonction hyperscript `h(type, props, ...children)`.
- ❌ Dans `src/algorithms/`, **ne pas utiliser** `Array.prototype.sort`, `indexOf`, `find`, `findIndex`,
  `includes`, `filter` pour *implémenter* les tris et recherches : l'algorithme doit être écrit à la main.
- ✅ Le code doit compiler avec `npx tsc --noEmit` **sans erreur** (critère noté).
- ✅ Code **commenté** (en français) et **typé** (pas de `any`). Indiquer la complexité (Big-O) de chaque algorithme.

## 3. Mode pédagogique

L'étudiant apprend. Par défaut :
- **Expliquer et guider plutôt qu'écrire le code à sa place**, sauf demande explicite (« fais-le », « écris-le »).
- Quand du code est demandé, rester simple, lisible et proche de ce qui se fait en cours.
- Ne pas inventer d'exigences : en cas de doute, se référer au sujet (section 6) ou demander.

## 4. Stack & commandes

- Vite (template `vanilla-ts`) + TypeScript.
- `tsconfig.json` utilise `verbatimModuleSyntax` → importer les types avec **`import type { ... }`**.
- Imports relatifs (`../types`), pas d'alias de chemin.

```bash
npx vite            # serveur de dev
npx tsc --noEmit    # vérification des types
npx vite build      # build de production
```

## 5. Arborescence imposée

```
index.html
src/
├── main.ts                    # point d'entrée : déclare les routes, démarre le routeur
├── types/index.ts             # CONTRAT D'INTERFACE (voir §7) — source de vérité des types
├── data/products.ts           # export const products: Product[]
├── algorithms/
│   ├── sorting.ts             # insertionSort, quickSort, mergeSort
│   ├── search.ts              # linearSearch, binarySearch
│   └── diff.ts                # diff, patch (bonus)
├── framework/
│   ├── vdom.ts                # h() — hyperscript → VNode
│   └── renderer.ts            # render() — VNode → DOM réel (récursif)
├── router/stackRouter.ts      # navigate(), back(), match() — pile + History API
└── pages/
    ├── home.ts                # route "/"
    ├── productList.ts         # route "/products"
    └── productDetail.ts       # route "/product/:id"
```

Ne pas créer d'autres dossiers à la racine de `src/` sans raison.

## 6. Cahier des charges (résumé du sujet)

### Pages
| Page | Route | Contenu |
|---|---|---|
| Accueil | `/` | Présentation de l'app + liens |
| Liste | `/products` | Tableau avec **recherche** (linéaire ou binaire), **sélecteur de tri** (insertion / rapide / fusion), **temps d'exécution affiché**, **liens** vers le détail |
| Détail | `/product/:id` | Fiche complète d'un produit |

### Patterns ↔ cours
| Pattern | Fichier | Séance |
|---|---|---|
| Stack Navigation (History API) | `router/stackRouter.ts` | 2 — Pile |
| Virtual DOM `h()` | `framework/vdom.ts` | 3 — Récursivité |
| Renderer VNode → DOM | `framework/renderer.ts` | 3 — Récursivité |
| Diffing / Patching | `algorithms/diff.ts` | 3 — Récursivité |
| Tri insertion / rapide / fusion | `algorithms/sorting.ts` | 5 — Tri |
| Recherche linéaire / binaire | `algorithms/search.ts` | 4 — Recherche |

### Routeur en pile
- `navigate(path)` : **push** sur la pile + `history.pushState` + rendu.
- `back()` : **pop** de la pile + rendu (gérer aussi `popstate` du bouton retour navigateur).
- `match(path)` : trouve la route correspondante et extrait les params (`/product/:id` → `{ id: "3" }`).
  Retourne `MatchResult | null`.

### Barème (/16)
TS sans erreur /2 · 3 pages /3 · recherche linéaire + binaire /2 · 3 tris /3 · navigation pile /2 ·
diff/patch (bonus) /2 · code propre, commenté, typé /2.

### Bonus possibles
Diff/patch du VDOM · temps d'exécution par tri/recherche · tri sur colonnes cliquables · pagination ·
filtre par catégorie · état dans l'URL (query params) · hooks `useState` / `useEffect` maison.

## 7. Contrat d'interface — `src/types/index.ts`

Source de vérité. **Ne pas modifier ces types sans accord de l'étudiant.**

```ts
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;      // 0–5
  description: string;
}

export type Props = Record<string, unknown> & { key?: string | number };
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
```

## 8. Conventions d'implémentation

> Si le plan Notion de l'étudiant donne d'autres signatures, **le Notion prime**.

- **Tris** (signatures du Notion) — retournent un **nouveau** tableau, ne mutent jamais l'entrée (copie puis tri) :
  ```ts
  insertionSort<T>(arr: readonly T[], compare: Compare<T>): T[]
  quickSort<T>(arr: readonly T[], compare: Compare<T>): T[]
  mergeSort<T>(arr: readonly T[], compare: Compare<T>): T[]
  ```
- **Recherches** (signatures du Notion) :
  ```ts
  linearSearch<T>(arr: readonly T[], predicate: (item: T) => boolean): T[]          // tous les éléments qui matchent
  binarySearch<T, K>(sorted: readonly T[], target: K, compare: (item: T, target: K) => number): number  // index ou -1
  ```
  - `linearSearch` parcourt tout le tableau (fonctionne sur données non triées).
  - `binarySearch` **exige un tableau trié** selon le même critère que `compare` → trier avant.
- **Hyperscript** (signature du Notion) — dans `framework/vdom.ts` :
  ```ts
  h(type: string, props?: Props | null, ...children: (VChild | VChild[] | null | false)[]): VNode
  ```
  `h` aplatit les tableaux d'enfants et retire `null` / `false` (rendu conditionnel). `h` n'est pas récursive ;
  la récursion est dans `render()` / `diff()`.
- `types/index.ts` ne contient **que des types** (aucune fonction, aucune signature brute).
- **Événements** dans les props : clé `onXxx` → `addEventListener('xxx', handler)` (ex. `onClick` → `click`).
- **Mesure du temps** : `performance.now()` avant/après l'appel de l'algo, affiché en ms.
- `render()` est **récursif** (condition d'arrêt : enfant `string` → nœud texte).
- `diff(oldVNode, newVNode)` compare récursivement ; `patch()` applique les changements au DOM réel.
