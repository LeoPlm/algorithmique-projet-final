import type { Compare, SortAlgorithm } from "../types"

// TRI PAR INSERTION
// - Pour chaque nouvel élément, le décale vers la gauche jusqu'à sa bonne place
// - Complexité temps : 0(n²) en moyenne et pire cas, O(n) en meilleur cas si déjà trié
// - Complexité espace : O(n) à cause de la copie initiale
export function insertionSort<T>(arr: readonly T[], compare: Compare<T>): T[] {
  const result = [...arr]; // Copie pour ne pas muter l'entrée

  for (let i = 1; i < result.length; i++) {
    const key = result[i]; // À insérer
    let j = i - 1;

    // On décale vers la droite tous les éléments strictement plus grands que key
    while (j >= 0 && compare(result[j], key) > 0) {
      result[j + 1] = result[j];
      j--;
    }

    result[j + 1] = key;
  }

  return result;
}

// TRI RAPIDE
// - Choisit comme point la médiane des valeurs de début, milieu et fin
// - Évite le pire cas O(n²) sur les tableaux déjà triés ou inversés
function median<T>(a: T, b: T, c: T, compare: Compare<T>): T {
  if (compare(a, b) < 0) {
    if (compare(b, c) < 0) {
      return b;
    }
    return compare(a, c) < 0 ? c : a;
  }

  if (compare(a, c) < 0) {
    return a;
  }
  return compare(b, c) < 0 ? c : b;
}

// Tri rapide récursif, partition en trois zones et efficace avec beaucoup de doublons
function quickSortRecursive<T>(a: T[], low: number, high: number, compare: Compare<T>): void {
  // Boucle sur la plus grande partie et récurse sur la plus petite : la profondeur de pile reste en 0(log n) même dans un pire cas
  while (low < high) {
    // Choix du point (médiane)
    const middle = low + ((high - low) >> 1);
    const point = median(a[low], a[middle], a[high], compare);

    // Partition
    let lessThan = low;
    let i = low;
    let greaterThan = high;

    while (i <= greaterThan) {
      const c = compare(a[i], point);

      if (c < 0) { // Plus petit, l'envoie à gauche
        const temp = a[lessThan++];
        a[lessThan++] = a[i++];
        a[i++] = temp;
      } else if (c > 0) { // Plus grand : l'envoie à droite
        const temp = a[i];
        a[i] = a[greaterThan--];
        a[greaterThan--] = temp;
      } else { // Égal au point, reste au milieu
        i++;
      }
    }

    // Récursion sur la plus petite zone, itération sur la plus grande
    if (lessThan - low < high - greaterThan) {
      quickSortRecursive(a, low, lessThan - 1, compare);
      low = greaterThan + 1;
    } else {
      quickSortRecursive(a, greaterThan + 1, high, compare);
      high = lessThan - 1;
    }
  }
}

// - Choisit un point, partionne en < point, = point et > point, puis trie récursivement les parties < et >
// - Complexité temps : O(n log n) en moyenne, O(n²) au pire cas
// - Complexité espace : O(n) pour la copie + O(log n) de pile de récursion
export function quickSort<T>(arr: readonly T[], compare: Compare<T>): T[] {
  const result = [...arr];
  quickSortRecursive(result, 0, result.length - 1, compare);
  return result;
}

// TRI FUSION
// - Fusionne deux tableaux déjà triés en un seul tableau trié
function merge<T>(left: T[], right: T[], compare: Compare<T>): T[] {
  const out: T[] = [];
  let i = 0;
  let j = 0;

  // Tant que les deux côtés ont des éléments, on prend le plus petit des deux têtes
  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      out.push(left[i++]); // Left d'abord en cas d'égalité, pour la stabilité
    } else {
      out.push(right[j++]);
    }
  }

  // Un des deux côtés est épuisé : recopie le reste de l'autre, déjà trié
  while (i < left.length) {
    out.push(left[i++]);
  }

  while (j < right.length) {
    out.push(right[j++]);
  }

  return out;
}

// - Couper le tableau en deux moitiés, trier chacune récursivement, puis les fusionner
// - Complexité temps : 0(n log n) dans tous les cas (log n niveaux de découpe, 0(n) de fusion par niveau)
// - Complexité espace : O(n) pour les tableaux auxiliaires de fusion
export function mergeSort<T>(arr: readonly T[], compare: Compare<T>): T[] {
  // Cas de base : 0 ou 1 élement, déjà trié
  if (arr.length <= 1) {
    return [...arr];
  }

  // Diviser en deux moitiés, slice crée de nouveaux tableaux
  const middle = Math.floor(arr.length / 2);
  const left = arr.slice(0, middle);
  const right = arr.slice(middle);

  // Trier chaque moitié récursivement
  const sortedLeft = mergeSort(left, compare);
  const sortedRight = mergeSort(right, compare);

  // Fusionner les deux moitiés triées
  return merge(sortedLeft, sortedRight, compare);
}

// HELPER (CHOIX DE L'ALGORITHME)
// - Trie avec l'algorithme demandé
export function sortBy<T>(algo: SortAlgorithm, arr: readonly T[], compare: Compare<T>): T[] {
  switch (algo) {
    case 'insertion':
      return insertionSort<T>(arr, compare);
    case 'quick':
      return quickSort(arr, compare);
    case 'merge':
      return mergeSort<T>(arr, compare);
    default:
      throw new Error(`Algorithme de tri inconnu : ${JSON.stringify(algo)}`);
  }
}