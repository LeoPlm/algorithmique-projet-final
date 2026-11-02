import { h } from "../framework/vdom";
import type { RouteParams, VNode } from "../types";

export function productDetailPage(params: RouteParams): VNode {
  return h("h1", null, "Produit " + params.id);
}
