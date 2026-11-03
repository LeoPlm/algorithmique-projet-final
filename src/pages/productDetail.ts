import { h } from "../framework/vdom";
import type { RouteParams, VNode } from "../types";
import { router } from "../router/stackRouter";

export function productDetailPage(params: RouteParams): VNode {
  return h("div", null,
  h("h1", null, "Produit " + params.id),
  h("button", {onClick: () => router.back() }, "Retour" )
  )
}

