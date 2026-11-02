import { h } from "../framework/vdom"
import type { VNode } from "../types/index"

export function homePage(): VNode {
  return h("h1", null, "Accueil");
}