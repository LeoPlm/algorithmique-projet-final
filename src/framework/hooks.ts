// HOOKS façon React : on mémorise l'état d'une page entre ses rendus.
// Principe : chaque appel de hook occupe une "case" (index 0, 1, 2…) dans un tableau.
// ⚠️ Règle : toujours appeler les hooks dans le même ordre (jamais dans un if / une boucle).

type Cleanup = void | (() => void);
interface EffectSlot { deps: unknown[] | undefined; cleanup: Cleanup; }

let states: unknown[] = [];               // valeurs des useState
let stateIndex = 0;
let effects: EffectSlot[] = [];           // dépendances + nettoyage des useEffect
let effectIndex = 0;
let pendingEffects: (() => void)[] = [];  // effets à lancer APRÈS l'affichage
let rerender: () => void = () => {};      // fourni par le routeur (évite un import circulaire)

/** Le routeur indique quelle fonction appeler quand un état change */
export function setRerender(fn: () => void): void { rerender = fn; }

/** Avant chaque rendu : on repart de la case 0 */
export function prepareRender(): void { stateIndex = 0; effectIndex = 0; }

/** Changement de page : on nettoie les effets et on oublie tout l'état */
export function resetHooks(): void {
  for (const slot of effects) { if (typeof slot.cleanup === "function") slot.cleanup(); }
  states = []; effects = []; pendingEffects = [];
  prepareRender();
}

/** Après l'affichage : on lance les effets en attente */
export function runEffects(): void {
  const toRun = pendingEffects;
  pendingEffects = [];
  for (const run of toRun) run();
}

/** useState : renvoie [valeur actuelle, fonction pour la changer] */
export function useState<T>(initial: T): [T, (value: T) => void] {
  const i = stateIndex++;
  if (i >= states.length) states.push(initial); // 1er rendu : on crée la case
  const setState = (value: T): void => {
    if (Object.is(states[i], value)) return;     // même valeur → pas de rendu inutile
    states[i] = value;
    rerender();
  };
  return [states[i] as T, setState];
}

/** Vrai si au moins une dépendance a changé (ou s'il n'y a pas de tableau de deps) */
function depsChanged(oldDeps: unknown[] | undefined, newDeps: unknown[] | undefined): boolean {
  if (!oldDeps || !newDeps) return true;
  if (oldDeps.length !== newDeps.length) return true;
  for (let k = 0; k < newDeps.length; k++) { if (!Object.is(oldDeps[k], newDeps[k])) return true; }
  return false;
}

/** useEffect : lance `effect` après l'affichage, seulement si `deps` a changé */
export function useEffect(effect: () => Cleanup, deps?: unknown[]): void {
  const i = effectIndex++;
  const old = effects[i];
  if (old && !depsChanged(old.deps, deps)) return; // rien n'a changé → on ne relance pas
  pendingEffects.push(() => {
    const previous = effects[i];
    if (previous && typeof previous.cleanup === "function") previous.cleanup(); // nettoyage de l'ancien
    effects[i] = { deps, cleanup: effect() };
  });
}
