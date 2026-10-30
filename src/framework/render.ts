import type { VChild, VNode } from "../types"

// On note dans la WeakMap les éléments auxquels une fonction est accrochée (ex. onClick), pour que lors d'un re-rendu on puisse enlever l'ancienne fonction de l'élément et lui en donner une nouvelle si besoin.

const listeners = new WeakMap<HTMLElement, Record<string, EventListener>>();

// rend les props du vdom (h) afin qu'il deviennent des attributs des éléments du DOM.
export function setProp(el: HTMLElement, key: string, value: unknown): void {
  // key est seulement utile dans le DOM virtuel pour gérer diff. Mais l'attribut key ne sert à rien dans le "vrai" DOM donc on return la fonction
  if(key === "key") return

  // Événements : onClick → "click", onInput → "input"
  if(key.startsWith("on") && typeof value === "function") {
    const eventName = key.slice(2).toLowerCase()
    // on retire l'ancien addEventListener
    removeProp(el, key)
    const handler = value as EventListener
    el.addEventListener(eventName, handler)
    const saved = listeners.get(el) ?? {}
    saved[eventName] = handler
    listeners.set(el, saved)
    return
  }

    // Classe CSS : on accepte "className" (nom JS) ou "class" (nom HTML)
  if (key === "className" || key === "class") {
    el.className = String(value);
    return;
  }

  // on peut ajouter du style directement h('p', { style: 'color: red; margin: 10px' }, 'Texte'), même si c'est une mauvaise pratique
  if (key === "style") {
    if (typeof value === "string") {
      el.setAttribute("style", value);
    } else if (typeof value === "object" && value !== null) {
      Object.assign(el.style, value);
    }
    return;
  }

    // value / checked : posés comme PROPRIÉTÉS et non comme attributs.
  // L'attribut ne donne que la valeur initiale, la propriété reflète l'état actuel du champ.
  if (key === "value" && (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) {
    el.value = String(value);
    return;
  }
  if (key === "checked" && el instanceof HTMLInputElement) {
    el.checked = Boolean(value);
    return;
  }

  // Attributs booléens (hidden, disabled...) : true → présent, false/null/undefined → absent
  if (value === true) {
    el.setAttribute(key, "");
  } else if (value === false || value === null || value === undefined) {
    el.removeAttribute(key);
  } else {
    // Cas général : href, id, type, placeholder...
    el.setAttribute(key, String(value));
  }

}

// Retire UNE prop d'un élément DOM réel (utilisée par le patch quand une prop disparaît).
export function removeProp(el: HTMLElement, key: string): void {
  if (key.startsWith("on")) {
    const eventName = key.slice(2).toLowerCase();
    const saved = listeners.get(el);
    const old = saved?.[eventName];
    if (saved && old) {
      el.removeEventListener(eventName, old);
      delete saved[eventName];
    }
    return;
  }
  if (key === "className" || key === "class") {
    el.removeAttribute("class");
    return;
  }
  el.removeAttribute(key);
}

// RENDER : transforme récursivement un VNode en vrai nœud DOM.
// Complexité : O(n), chaque nœud de l'arbre est visité une seule fois.
export function render(vnode: VChild): Node {
  // Condition d'arrêt : un texte devient un nœud texte (il n'a pas d'enfants)
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  // 1. Créer l'élément HTML : 'div' → <div>
  const el = document.createElement(vnode.type);

  // 2. Appliquer chaque prop (attributs, classes, événements...)
  for (const [key, value] of Object.entries(vnode.props)) {
    setProp(el, key, value);
  }

  // 3. Appel récursif sur chaque enfant, puis on l'accroche à l'élément
  for (const child of vnode.children) {
    el.appendChild(render(child));
  }

  return el;
}

// MOUNT : vide le conteneur et y insère le rendu du VNode.
export function mount(vnode: VChild, container: HTMLElement): void {
  container.replaceChildren(render(vnode));
}
