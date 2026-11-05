import { h } from "../framework/vdom"
import type { VNode } from "../types/index"
import { link } from "../router/stackRouter"
import { products } from "../data/products"

// Une ligne "concept du cours → où il est utilisé dans l'app"
function conceptItem(title: string, description: string): VNode {
  return h("li", null, h("strong", null, title), ` : ${description}`)
}

// PAGE D'ACCUEIL : présentation de l'application + liens vers les autres pages
export function homePage(): VNode {
  return h("div", null,
    h("h1", null, "Algo Framework"),
    h("p", null,
      "Mini-framework frontend écrit en TypeScript from scratch, sans aucune librairie, ",
      "pour mettre en pratique les algorithmes du cours sur un catalogue de ",
      `${products.length} produits.`
    ),

    h("h2", null, "Ce qui est implémenté"),
    h("ul", null,
      conceptItem("Pile", "navigation avec historique et bouton retour (History API)"),
      conceptItem("Récursivité", "Virtual DOM (h), rendu VNode → DOM, diffing / patching"),
      conceptItem("Recherche", "linéaire (le nom contient…) et binaire (le nom commence par…)"),
      conceptItem("Tri", "par insertion, rapide et fusion, avec le temps d'exécution affiché")
    ),

    h("h2", null, "Navigation"),
    h("ul", null,
      h("li", null, link("/products", "Voir la liste des produits")),
      h("li", null, link(`/product/${products[0].id}`, `Exemple de fiche produit : ${products[0].name}`))
    )
  )
}
