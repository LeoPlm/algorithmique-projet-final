import { h } from "../framework/vdom";
import type { VNode, Compare, Product, SortAlgorithm } from "../types";
import { products } from "../data/products";
import { link, router } from "../router/stackRouter";
import { sortBy } from "../algorithms/sorting";
import { linearSearch, binarySearchPrefix } from "../algorithms/search";

type SearchMode = "linear" | "binary";
type Criteria = "name" | "price" | "rating";
type Order = "asc" | "desc";

let query = ""; // Recherche
let searchMode: SearchMode = "linear"; // Algorithme de recherche
let sortAlgorithm: SortAlgorithm = "merge"; // Algorithme de tri
let criteria: Criteria = "name"; // Colonne de tri
let order: Order = "asc"; // Sens du tri

// Normalise le texte en minuscules et suppression d'accents pour comparaison brute des caractères
const norm = (s: string): string => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Comparaison des chaînes simples
const compare = (x: string, y: string): number => (x < y ? -1 : x > y ? 1 : 0);

// Tri par nom normalisé car demandé par binarySearchPrefix
const byName: Compare<Product> = (a, b) => compare(norm(a.name), norm(b.name));
const byPrice: Compare<Product> = (a, b) => a.price - b.price;
const byRating: Compare<Product> = (a, b) => a.rating - b.rating;

const comparators: Record<Criteria, Compare<Product>> = {
    name: byName,
    price: byPrice,
    rating: byRating
};

// Comparateur final
function buildComparator(criteria: Criteria, order: Order): Compare<Product> {
    const base = comparators[criteria];

    return order === "asc" ? base : (a, b) => base(b, a);
}

// Retourne le temps d'exécution de la recherche et du tri
function timed<T>(fn: () => T): { value: T, ms: number } {
    const start = performance.now();
    const value = fn();

    return { value, ms: performance.now() - start };
}

// Format pour mieux voir la durée
const format = (ms: number): string => `${ms.toFixed(3)} ms`;

// Re-rendu de la page. mount() vide le conteneur et recrée tout le DOM : la barre de recherche est donc un nouvel élément qui n'a pas le focus, et on le lui rend avec le curseur là où l'utilisateur tapait, pour continuer
function refreshKeepingSearchFocus(pos: number | null): void {
    router.refresh();

    const input = document.getElementById("search-input") as HTMLInputElement | null;

    if (input) {
        input.focus();

        const position = pos ?? input.value.length;
        input.setSelectionRange(position, position);
    }
}

const onSearchInput = (e: Event): void => {
    const input = e.target as HTMLInputElement;

    query = input.value;
    refreshKeepingSearchFocus(input.selectionStart);
};

const onSearchModeChange = (e: Event): void => {
    searchMode = (e.target as HTMLSelectElement).value as SearchMode;
    router.refresh();
};

const onSortAlgoChange = (e: Event): void => {
    sortAlgorithm = (e.target as HTMLSelectElement).value as SortAlgorithm;
    router.refresh();
};

const onCriteriaChange = (e: Event): void => {
    criteria = (e.target as HTMLSelectElement).value as Criteria;
    router.refresh();
};

const onOrderChange = (e: Event): void => {
    order = (e.target as HTMLSelectElement).value as Order;
    router.refresh();
};

// Liste déroulante
function selectField(
    id: string,
    label: string,
    current: string,
    options: Array<[value: string, text: string]>,
    onChange: (e: Event) => void
): VNode {
    return h("label", null, `${label}`,
        h("select", { id, onChange },
            options.map(([value, text]) =>
                h("option", value === current ? { value, selected: true } : { value }, text)
            )
        )
    );
}

// Ligne du tableau
function productRow(p: Product): VNode {
    return h("tr", { key: p.id },
        h("td", null, link(`/product/${p.id}`, p.name)),
        h("td", null, p.category),
        h("td", null, `${p.price.toFixed(2)} €`),
        h("td", null, String(p.stock)),
        h("td", null, `${p.rating.toFixed(1)} / 5`)
    );
}

export function productListPage(): VNode {
    const q = query.trim();
    const qn = norm(q);

    let found: Product[] = products;
    let searchMs: number | null = null;
    let prepMs: number | null = null;

    if (q !== "") {
        if (searchMode === "linear") {
            const r = timed(() => linearSearch(products, (p) => norm(p.name).includes(qn)));

            found = r.value;
            searchMs = r.ms;
        } else {
            // Recherche binaire, le tableau doit d'abord être trié par nom normalisé

            // On mesure ce tri à part pour montrer que la recherche seule est très rapide mais son prérequis a un coût
            const prep = timed(() => sortBy(sortAlgorithm, products, byName));
            prepMs = prep.ms;

            const r = timed(() => binarySearchPrefix(prep.value, qn, (p) => norm(p.name)));

            found = r.value;
            searchMs = r.ms;
        }
    }

    const sortResult = timed(() => sortBy(sortAlgorithm, found, buildComparator(criteria, order)));
    const displayed = sortResult.value;

    const modeLabel = searchMode == "linear" ? "linéaire" : "binaire";
    const algoLabel: Record<SortAlgorithm, string> = {
        insertion: "insertion",
        quick: "rapide",
        merge: "fusion"
    };

    const stats: string[] = [];

    if (searchMs !== null) {
        stats.push(`Recherche ${modeLabel} : ${format(searchMs)}`);
    }

    if (prepMs !== null) {
        stats.push(`Tri préalable par nom (${algoLabel[sortAlgorithm]}) : ${format(prepMs)}`);
    }

    stats.push(`Tri ${algoLabel[sortAlgorithm]} : ${format(sortResult.ms)}`);
    stats.push(`${displayed.length} résultat(s) sur ${products.length}`);

    return h("div", null, h("h1", null, "Liste des produits"),
        h("div", null,
            h("label", null, "Recherche ",
                h("input", {
                    id: "search-input",
                    type: "text",
                    value: query,
                    placeholder: "Nom du produit...",
                    onInput: onSearchInput
                })
            ),
            selectField(
                "search-mode", "Algorithme de recherche : ", searchMode,
                [
                    [ "linear", "Linéaire (contient)" ],
                    [ "binary", "Binaire (commence par)" ]
                ],
                onSearchModeChange
            )
        ),
        h("div", null,
            selectField(
                "sort-algorithm", "Algorithme de tri : ", sortAlgorithm,
                [
                    [ "insertion", "Insertion" ],
                    [ "quick", "Rapide" ],
                    [ "merge", "Fusion" ]
                ],
                onSortAlgoChange
            ),
            selectField(
                "sort-criteria", "Critère : ", criteria,
                [
                    [ "name", "Nom" ],
                    [ "price", "Prix" ],
                    [ "rating", "Note" ]
                ],
                onCriteriaChange
            ),
            selectField(
                "sort-order", "Ordre : ", order,
                [
                    [ "asc", "Croissant" ],
                    [ "desc", "Décroissant" ]
                ],
                onOrderChange
            )
        ),
        h("p", null, stats.join(' - ')),
        displayed.length === 0
            ? h("p", null, "Aucun résultat")
            : h("table", null,
                h("thead", null,
                    h("tr", null, ["Nom", "Catégorie", "Prix", "Stock", "Note"].map((title) => h("th", null, title)))
                ),
                h("tbody", null, displayed.map(productRow))
            )
    );
}
