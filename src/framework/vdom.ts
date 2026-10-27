import type { Props, VChild, VNode } from "../types";

// HYPERSCRIPT : construit un VNode (simple objet JS, aucun DOM créé ici)
export function h(type: string, props?: Props | null, ...children: (VChild | VChild[] | null | false)[]): VNode {
  const flat: VChild[] = [];

  for (const child of children) {
    // Un enfant peut être un tableau (ex. résultat d'un .map()) : on le déplie d'un niveau
    const items = Array.isArray(child) ? child : [child];

    // Si on itère sur un array, il est applatti. 
    for (const item of items) {
      if (item !== null && item !== false) {
        flat.push(item);
      }
    }
  }
  return { type, props: props ?? {}, children: flat };
}
