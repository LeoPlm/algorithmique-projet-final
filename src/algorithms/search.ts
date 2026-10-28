import type { Compare } from '../types';

// RECHERCHE LINÉAIRE
// Parcourt tout le tableau et retourne tous les éléments
// - Complexité temps : O(n), chaque élément est testé exactement une fois
// - Complexité espace : O(k) pour le résultat
export function linearSearch<T>(arr: readonly T[], predicate: (item: T) => boolean): T[] {
  const matches: T[] = [];

  // On teste chaque élément un par un, du premier au dernier
  for (const item of arr) {
    if (predicate(item)) {
      matches.push(item);
    }
  }

  return matches;
}

// RECHERCHE BINAIRE
// Retourne l'indice d'un élément égal à target ou -1
// - À chaque étape on compare target à l'élément du milieu, ce qui permet d'éliminer la moitié de l'intervalle de recherche
// - Complexité temps : O(log n), l'intervalle est divisé par 2 à chaque tour
// - Complexité espace : O(1)
export function binarySearch<T>(sorted: readonly T[], target: T, compare: Compare<T>): number  {
  let low = 0;
  let high = sorted.length - 1;

  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    const c = compare(sorted[middle], target);

    if (c === 0) {
      return middle;
    } else if (c < 0) {
      low = middle + 1; // Target à droite
    } else {
      high = middle - 1; // Target à gauche
    }
  }

   return -1; // Intervalle vide, absent
}

// RECHERCHE BINAIRE PAR PRÉFIXE
// Trouver tous les produits dont le nom commence par la saisie
// Recherche binaire du premier indice dont le début est supérieur ou égal au préfixe
// Depuis cet indice, on avance tant que la saisie commence bien par le préfixe
// - Complexité temps : O(log n + k), k étant le nombre de résultats ; O(log n) pour trouver le premier, et O(k) pour les collecter
// - Complexité espace : O(k) pour le résultat
export function binarySearchPrefix<T>(sorted: readonly T[], prefix: string, key: (item: T) => string): T[] {
  const p = prefix.toLowerCase();
  const n = p.length;

  // Début de la saisie en minuscules, tronquée à la longueur du préfixe
  const head = (i: number): string => key(sorted[i]).slice(0, n).toLowerCase();

  let low = 0;
  let high = sorted.length; // Aucun trouvé

  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);

    if (head(middle) < p) {
      low = middle + 1; // Trop petit, le match est à droite de middle
    } else {
      high = middle; // On cherche encore à gauche
    }
  }

  // On avance tant que la saisie commence bien par le préfixe
  const matches: T[] = [];

  for (let i = low; i < sorted.length && head(i) === p; i++) {
    matches.push(sorted[i]);
  }

  return matches;
}