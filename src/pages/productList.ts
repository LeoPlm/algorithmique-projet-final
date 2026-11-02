import { h } from "../framework/vdom";
import type { VNode } from "../types";
import { products } from "../data/products";

export function productListPage(): VNode {
  return h("div", null, 
    h("h1", null, "Liste des produits"),
    h("ul", null, products.map(p => h("li", {key: p.id}, p.name)))
  )
}
