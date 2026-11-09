# Algo Framework

Mini-framework frontend écrit en TypeScript **from scratch** (sans React ni aucune librairie),
réalisé pour l'examen d'algorithmique ESGI, avec une petite application de catalogue produits.

## Lancer le projet

```bash
npm install
npm run dev          # serveur de dev : http://localhost:5173
npx tsc --noEmit     # vérification des types
npm run build        # build de production
```

## Ce qui est implémenté

| Concept du cours | Où | Fichier |
|---|---|---|
| Pile | Routeur : `navigate` (push), `back` (pop), History API | `src/router/stackRouter.ts` |
| Récursivité | Virtual DOM `h()`, rendu VNode → DOM, diff / patch | `src/framework/`, `src/algorithms/diff.ts` |
| Recherche | Linéaire O(n), binaire O(log n) (+ par préfixe) | `src/algorithms/search.ts` |
| Tri | Insertion O(n²), rapide et fusion O(n log n) | `src/algorithms/sorting.ts` |

Bonus : diff / patch, temps d'exécution affichés, hooks `useState` / `useEffect` maison,
catalogue de 5000 produits générés, photos avec icône de secours.

## Pages

- `/` : accueil
- `/products` : liste avec recherche, choix de l'algorithme de tri et temps d'exécution
- `/product/:id` : fiche détaillée d'un produit
