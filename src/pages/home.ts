import { h } from "../framework/vdom"
import type { VNode } from "../types/index"
import { link } from "../router/stackRouter"

export function homePage(): VNode {
  return h("div", null, 
    h("h1", null, "Accueil"),
    link("/products", "Voir les produits")
  )
}