import type { Compare, SortAlgorithm } from "../types"

// TRI PAR INSERTION
export function insertionSort<T>(arr: readonly T[], compare: Compare<T>): T[] {
  const result = [...arr];

  for (let i = 1; i < result.length; i++) {
    const key = result[i];
    let j = i - 1;

    while (j >= 0 && compare(result[j], key) > 0) {
      result[j + 1] = result[j];
      j--;
    }

    result[j + 1] = key;
  }

  return result;
}

// TRI RAPIDE
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

function quickSortRecursive<T>(a: T[], low: number, high: number, compare: Compare<T>): void {
  while (low < high) {
    const middle = low + ((high - low) >> 1);
    const point = median(a[low], a[middle], a[high], compare);

    let lessThan = low;
    let i = low;
    let greaterThan = high;

    while (i <= greaterThan) {
      const c = compare(a[i], point);

      if (c < 0) {
        const temp = a[lessThan++];
        a[lessThan++] = a[i++];
        a[i++] = temp;
      } else if (c > 0) {
        const temp = a[i];
        a[i] = a[greaterThan--];
        a[greaterThan--] = temp;
      } else {
        i++;
      }
    }

    if (lessThan - low < high - greaterThan) {
      quickSortRecursive(a, low, lessThan - 1, compare);
      low = greaterThan + 1;
    } else {
      quickSortRecursive(a, greaterThan + 1, high, compare);
      high = lessThan - 1;
    }
  }
}

export function quickSort<T>(arr: readonly T[], compare: Compare<T>): T[] {
  const result = [...arr];
  quickSortRecursive(result, 0, result.length - 1, compare);
  return result;
}

// TRI FUSION
function merge<T>(left: T[], right: T[], compare: Compare<T>): T[] {
  const out: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      out.push(left[i++]);
    } else {
      out.push(right[j++]);
    }
  }

  while (i < left.length) {
    out.push(left[i++]);
  }

  while (j < right.length) {
    out.push(right[j++]);
  }

  return out;
}

export function mergeSort<T>(arr: readonly T[], compare: Compare<T>): T[] {
  if (arr.length <= 1) {
    return [...arr];
  }

  const middle = Math.floor(arr.length / 2);
  const left = arr.slice(0, middle);
  const right = arr.slice(middle);

  const sortedLeft = mergeSort(left, compare);
  const sortedRight = mergeSort(right, compare);

  return merge(sortedLeft, sortedRight, compare);
}

// HELPER (CHOIX DE L'ALGORITHME)
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