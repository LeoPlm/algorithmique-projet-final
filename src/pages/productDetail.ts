import { h } from "../framework/vdom";
import type { RouteParams, VNode, Compare, Product } from "../types";
import { router, link } from "../router/stackRouter";
import { products } from "../data/products";
import { mergeSort } from "../algorithms/sorting";
import { binarySearch } from "../algorithms/search";
import { imageUrl, categoryIcon, showIconOnError, showImageOnLoad } from "../data/images";

// Comparateur id
const byId: Compare<Product> = (a, b) => a.id - b.id;

// Produits triés par id
// Calculé une seule fois au chargement du module : O(n log n) une fois, puis chaque visite de la page O(log n)
// Les produits sont volontairement non triés
const productsById: Product[] = mergeSort(products, byId);

// Retrouve un produit à partir de son id avec une recherche binaire
// - Complexité : O(log n)
function findProductById(rawId: string | undefined): Product | undefined {
  const id = Number(rawId);

  if (rawId === undefined || rawId.trim() === '' || !Number.isInteger(id)) {
    return undefined;
  }

  const target = { id } as Product;
  const index = binarySearch(productsById, target, byId);

  return index === -1 ? undefined : productsById[index];
}

// Bouton retour
function backButton(): VNode {
  return h("button", { onClick: () => router.back() }, "Retour");
}

// Une ligne "nom : valeur" de la fiche
function infoRow(label: string, value: string): VNode[] {
  return [h("dt", null, label), h("dd", null, value)];
}

// Produit introuvable
function notFoundView(rawId: string | undefined): VNode {
  return h("div", null, backButton(),
      h("h1", null, "Produit introuvable"),
      h("p", null, `Aucun produit ne correspond à l'identifiant ${rawId ?? ""}`),
      link("/products", "Retour à la liste des produits")
  );
}

export function productDetailPage(params: RouteParams): VNode {
  const product = findProductById(params.id);

  if (!product) {
    return notFoundView(params.id);
  }

  return h("div", null, backButton(),
      h("h1", null, product.name),
      // Photo du produit, avec l'icône de la catégorie en secours si elle ne charge pas
      h("div", null,
        h("span", { hidden: true, style: "font-size: 200px" }, categoryIcon(product)),
        h("img", {
          src: imageUrl(product, 400),
          alt: product.name,
          width: "400",
          height: "400",
          onError: showIconOnError,
          onLoad: showImageOnLoad,
        })
      ),
      h("dl", null,
          infoRow("Identifiant", String(product.id)),
          infoRow("Catégorie", product.category),
          infoRow("Prix", `${product.price.toFixed(2)} €`),
          infoRow("Stock", product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"),
          infoRow("Note", `${product.rating.toFixed(1)} / 5`),
          infoRow("Description", product.description)
      )
  );
}

