import { h } from "../framework/vdom";
import type { VNode, Compare, Product, SortAlgorithm, SearchAlgorithm } from "../types";
import { products, generateProducts } from "../data/products";
import { link } from "../router/stackRouter";
import { sortBy } from "../algorithms/sorting";
import { linearSearch, binarySearchPrefix } from "../algorithms/search";
import { useState, useEffect } from "../framework/hooks";
import { imageUrl, categoryIcon, showIconOnError, showImageOnLoad } from "../data/images";

type Criteria = "name" | "category" | "price" | "stock" | "rating";
type Order = "asc" | "desc";

// Normalise le texte en minuscules et suppression d'accents pour comparaison brute des caractères
const norm = (s: string): string => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Comparaison des chaînes simples
const compare = (x: string, y: string): number => (x < y ? -1 : x > y ? 1 : 0);

// Cache des noms / catégories normalisés : chaque valeur est calculée UNE seule fois,
// à la première utilisation, puis relue dans le cache.
// Sinon norm() serait recalculé à chaque comparaison : avec 5000 produits, le tri par insertion
// en fait des millions (environ 7x plus lent mesuré).
// WeakMap : quand un produit n'est plus utilisé (ex. les 5000 produits générés par "Comparer les 3 tris"),
// son entrée est libérée automatiquement → pas de fuite mémoire.
const normalizedNames = new WeakMap<Product, string>();
const normalizedCategories = new WeakMap<Product, string>();

const normName = (p: Product): string => {
    let key = normalizedNames.get(p);

    if (key === undefined) {
        key = norm(p.name);
        normalizedNames.set(p, key);
    }

    return key;
}

const normCategory = (p: Product): string => {
    let key = normalizedCategories.get(p);

    if (key === undefined) {
        key = norm(p.category);
        normalizedCategories.set(p, key);
    }

    return key;
}

// Tri par nom normalisé car demandé par binarySearchPrefix
const byName: Compare<Product> = (a, b) => compare(normName(a), normName(b));
const byCategory: Compare<Product> = (a, b) => compare(normCategory(a), normCategory(b));
const byPrice: Compare<Product> = (a, b) => a.price - b.price;
const byStock: Compare<Product> = (a, b) => a.stock - b.stock;
const byRating: Compare<Product> = (a, b) => a.rating - b.rating;

const comparators: Record<Criteria, Compare<Product>> = {
    name: byName,
    category: byCategory,
    price: byPrice,
    stock: byStock,
    rating: byRating
};

// Comparateur final
function buildComparator(criteria: Criteria, order: Order): Compare<Product> {
    const base = comparators[criteria];

    return order === "asc" ? base : (a, b) => base(b, a);
}

// Valeurs autorisées (valide aussi dans l'URL)
const searchModes: readonly SearchAlgorithm[] = ["linear", "binary"];
const sortAlgorithms: readonly SortAlgorithm[] = ["insertion", "quick", "merge"];
const orders: readonly Order[] = ["asc", "desc"];
const pageSizes: readonly number[] = [10, 20];

// Colonnes triables : chaque en-tête est cliquable et trie sur sa clé (sauf Photo)
const columns: Array<{ key: Criteria; label: string }> = [
    { key: "name", label: "Nom" },
    { key: "category", label: "Catégorie" },
    { key: "price", label: "Prix" },
    { key: "stock", label: "Stock"},
    { key: "rating", label: "Note" }
];

const criteria: readonly Criteria[] = columns.map((col) => col.key);

// Catégories distinctes, triées sans Array.prototype.sort
const categories: string[] = sortBy("merge", [...new Set(products.map((p) => p.category))], compare);

const algoLabel: Record<SortAlgorithm, string> = {
    insertion: "insertion",
    quick: "rapide",
    merge: "fusion"
};

// État de la page
// Un seul objet : un changement = un seul setState = un seul rendu, et la page repart à 1 en même temps que la recherche/le filtre/le tri change
interface ListState {
    query: string; // Recherche
    searchMode: SearchAlgorithm; // Algorithme de recherche
    sortAlgorithm: SortAlgorithm; // Algorithme de tri
    criteria: Criteria; // Colonne de tri
    order: Order; // Sens du tri
    category: string; // Filtre de catégorie
    page: number; // Page demandée
    pageSize: number; // Produits par page
}

// Valeurs par défaut : un paramètre égal à son défaut n'est pas écrit dans l'URL
const defaults: ListState = {
    query: "",
    searchMode: "linear",
    sortAlgorithm: "merge",
    criteria: "name",
    order: "asc",
    category: "",
    page: 1,
    pageSize: 10
};

// Persistance de l'état dans l'URL
function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
    return allowed.includes(value as T) ? (value as T) : fallback;
}

// Lit l'URL et construit l'état initial. Sert de valeur initiale à useState : ouverture directe d'un lien /products?q=, rechargement, ou retour depuis une fiche produit
// (le retour remet les hooks à zéro à chaque chargement de page)
function readStateFromUrl(): ListState {
    const params = new URLSearchParams(location.search);

    const category = params.get("category") ?? "";
    const size = Number(params.get("size"));
    const pageNumber = Number(params.get("page"));

    return {
        query: params.get("q") ?? defaults.query,
        searchMode: pick(params.get("mode"), searchModes, defaults.searchMode),
        sortAlgorithm: pick(params.get("algo"), sortAlgorithms, defaults.sortAlgorithm),
        criteria: pick(params.get("sort"), criteria, defaults.criteria),
        order: pick(params.get("dir"), orders, defaults.order),
        category: categories.includes(category) ? category : defaults.category,
        page: Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber : defaults.page,
        pageSize: pageSizes.includes(size) ? size : defaults.pageSize
    };
}

// Écrit l'état dans l'URL sans créer d'entrée historique (replaceState) : le bouton Retour ne passe donc pas par toutes les frappes de la recherche
function syncUrl(state: ListState): void {
    const params = new URLSearchParams();

    if (state.query.trim() !== "") {
        params.set("q", state.query);
    }

    if (state.searchMode !== defaults.searchMode) {
        params.set("mode", state.searchMode);
    }

    if (state.sortAlgorithm !== defaults.sortAlgorithm) {
        params.set("algo", state.sortAlgorithm);
    }

    if (state.criteria !== defaults.criteria) {
        params.set("sort", state.criteria);
    }

    if (state.order !== defaults.order) {
        params.set("dir", state.order);
    }

    if (state.category !== defaults.category) {
        params.set("category", state.category);
    }

    if (state.page !== defaults.page) {
        params.set("page", String(state.page));
    }

    if (state.pageSize !== defaults.pageSize) {
        params.set("size", String(state.pageSize));
    }

    const qs = params.toString();
    history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : ""));
}

// Retourne le temps d'exécution de la recherche et du tri
function timed<T>(fn: () => T): { value: T, ms: number } {
    const start = performance.now();
    const value = fn();

    return { value, ms: performance.now() - start };
}

// Format pour mieux voir la durée
const format = (ms: number): string => `${ms.toFixed(3)} ms`;

// Comparaison des 3 tris sur 5000 produits
interface Comparison {
    label: string;
    count: number;
    times: Array<{ algo: SortAlgorithm, ms: number }>;
    identical: boolean;
}

function compareSorts(criteria: Criteria, order: Order): Comparison {
    const data = generateProducts(5000, 1);
    const cmp = buildComparator(criteria, order);

    const sample = data.slice(0, 300);
    for (const algo of sortAlgorithms) {
        sortBy(algo, sample, cmp);
    }

    const times: Comparison['times'] = [];
    const outputs: Product[][] = [];

    for (const algo of sortAlgorithms) {
        const r = timed(() => sortBy(algo, data, cmp));

        times.push({ algo, ms: r.ms });
        outputs.push(r.value);
    }

    // Même ordre à chaque position, les éléments sont égaux selon le comparateur
    // (le tri rapide n'est pas stable : des produits ex æquo peuvent changer de place, c'est normal)
    const identical = outputs.every((out) => out.every((p, i) => cmp(p, outputs[0][i]) === 0));

    const column = columns.find((col) => col.key === criteria);

    return {
        label: `${column ? column.label : criteria} ${order === "asc" ? "↑" : "↓"}`,
        count: data.length,
        times,
        identical,
    };
}

// Résultat de "Comparer les 3 tris" : les temps côte à côte
function comparisonView(comparison: Comparison | null): VNode | null {
    if (!comparison) {
        return null;
    }

    const fastest = Math.min(...comparison.times.map((t) => t.ms));

    return h("div", { className: "comparison" },
        h("h2", null, `Comparaison des 3 tris : ${comparison.count} produits, critère ${comparison.label}`),
        h("table", null,
            h("thead", null,
                h("tr", null, comparison.times.map((t) =>
                h("th", null, `Tri ${algoLabel[t.algo]}`)))
            ),
            h("tbody", null,
                h("tr", null, comparison.times.map((t) =>
                    h("td", null, t.ms === fastest ? `${format(t.ms)} (le plus rapide)` : format(t.ms))
                ))
            )
        ),
        h("p", null, comparison.identical ? "Les 3 tris donnent le même ordre" : "Attention : les 3 tris ne donnent pas le même ordre !")
    );
}

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
        h("td", null,
            // Icône de secours, cachée tant que la photo se charge correctement
            h("span", { hidden: true, style: "font-size: 40px" }, categoryIcon(p)),
            h("img", {
                src: imageUrl(p, 60),
                alt: p.name,
                width: "60",
                height: "60",
                loading: "lazy", // ne charge l'image que quand la ligne devient visible
                onError: showIconOnError,
                onLoad: showImageOnLoad,
            })
        ),
        h("td", null, link(`/product/${p.id}`, p.name)),
        h("td", null, p.category),
        h("td", null, `${p.price.toFixed(2)} €`),
        h("td", null, String(p.stock)),
        h("td", null, `${p.rating.toFixed(1)} / 5`)
    );
}

export function productListPage(): VNode {
    const [state, setState] = useState<ListState>(readStateFromUrl());
    const [comparison, setComparison] = useState<Comparison | null>(null);
    const { query, searchMode, sortAlgorithm, criteria, order, category, pageSize } = state;

    // Handlers : un seul setState par action. Tout changement revient à la page 1, sauf si 'changes' précise la page (boutons Précédent / Suivant)
    // Grâce à diff/patch, l'input n'est pas recréé : il garde le focus et la position du curseur
    const update = (changes: Partial<ListState>): void => setState({
        ...state, page: 1, ...changes });

    const onSearchInput = (e: Event): void => update({ query: (e.target as HTMLInputElement).value });
    const onSearchModeChange = (e: Event): void => update({ searchMode: (e.target as HTMLSelectElement).value as SearchAlgorithm });
    const onSortAlgoChange = (e: Event): void => update({ sortAlgorithm: (e.target as HTMLSelectElement).value as SortAlgorithm });
    const onCriteriaChange = (e: Event): void => update({ criteria: (e.target as HTMLSelectElement).value as Criteria });
    const onOrderChange = (e: Event): void => update({ order: (e.target as HTMLSelectElement).value as Order });
    const onCategoryChange = (e: Event): void => update({ category: (e.target as HTMLSelectElement).value });
    const onPageSizeChange = (e: Event): void => update({ pageSize: Number((e.target as HTMLSelectElement).value) });

    // Clic sur un en-tête : même colonne = on inverse le sens ; autre colonne = on trie dessus en croissant
    const onHeaderClick = (key: Criteria) => (): void => {
        if (criteria === key) {
            update({ order: order === "asc" ? "desc" : "asc" });
        } else {
            update({ criteria: key, order: "asc" });
        }
    };

    const onCompareClick = (): void => setComparison(compareSorts(criteria, order));

    const q = query.trim();
    const qn = norm(q);

    // 1. Filtre par catégorie (linearSearch avec un prédicat)
    let base: Product[] = products;
    let filterMs: number | null = null;

    if (category !== "") {
        const r=  timed(() => linearSearch(products, (p) => p.category === category));

        base = r.value;
        filterMs = r.ms;
    }

    // 2. Recherche sur les produits filtrés
    let found: Product[] = base;
    let searchMs: number | null = null;
    let prepMs: number | null = null;

    if (q !== "") {
        if (searchMode === "linear") {
            const r = timed(() => linearSearch(base, (p) => normName(p).includes(qn)));

            found = r.value;
            searchMs = r.ms;
        } else {
            // Recherche binaire, le tableau doit d'abord être trié par nom normalisé

            // On mesure ce tri à part pour montrer que la recherche seule est très rapide mais son prérequis a un coût
            const prep = timed(() => sortBy(sortAlgorithm, base, byName));

            prepMs = prep.ms;

            const r = timed(() => binarySearchPrefix(prep.value, qn, normName));

            found = r.value;
            searchMs = r.ms;
        }
    }

    // 3. Tri selon la colonne et le sens choisis
    const sortResult = timed(() => sortBy(sortAlgorithm, found, buildComparator(criteria, order)));
    const sorted = sortResult.value;

    // 4. Pagination : la page demandée est bornée (valeur dérivée, on ne modifie pas l'état pendant le rendu)
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(Math.max(1, state.page), totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const displayed = sorted.slice(startIndex, startIndex + pageSize);

    // Effet : après un affichage où "query" a changé, on met à jour le titre de l'onglet
    useEffect(() => {
        document.title = query.trim() === "" ? "Produits" : `Produits : " ${query.trim()} "`
    }, [query]);

    // Effet : après chaque changement d'état, l'URL reflète l'état courant
    useEffect(() => {
        syncUrl({ ...state, page: currentPage });
    }, [state, currentPage]);

    const modeLabel = searchMode === "linear" ? "linéaire" : "binaire";
    const stats: string[] = [];

    if (filterMs !== null) {
        stats.push(`Filtre catégorie : ${format(filterMs)}`);
    }

    if (searchMs !== null) {
        stats.push(`Recherche ${modeLabel} : ${format(searchMs)}`);
    }

    if (prepMs !== null) {
        stats.push(`Tri préalable par nom (${algoLabel[sortAlgorithm]}) : ${format(prepMs)}`);
    }

    stats.push(`Tri ${algoLabel[sortAlgorithm]} : ${format(sortResult.ms)}`);

    const range = sorted.length === 0 ? "" : `, affichage ${startIndex + 1}-${startIndex + displayed.length}`;

    stats.push(`${sorted.length} résultat(s) sur ${products.length}${range}`);

    // En-tête cliquable avec une flèche sur la colonne triée
    const headerCell = (col: { key: Criteria; label: string }): VNode => {
        const arrow = criteria === col.key ? (order === "asc" ? " ↑" : " ↓") : "";

        return h("th", {
            onClick: onHeaderClick(col.key),
            className: criteria === col.key ? "sorted" : "", // colonne triée mise en couleur (style.css)
            style: "cursor: pointer; user-select: none"
        }, col.label + arrow);
    };

    return h("div", null, h("h1", null, "Liste des produits"),
        h("div", { className: "toolbar" },
            h("label", null, "Recherche ",
                h("input", {
                    id: "search-input",
                    type: "text",
                    value: query,
                    placeholder: "Nom du produit",
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
            ),
            selectField(
                "category-filter", "Catégorie : ", category,
                [
                    [ "", "Toutes les catégories" ],
                    ...categories.map((c): [string, string] => [ c, c ])
                ],
                onCategoryChange
            )
        ),
        h("div", { className: "toolbar" },
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
                columns.map((col): [string, string] => [ col.key, col.label ]),
                onCriteriaChange
            ),
            selectField(
                "sort-order", "Ordre : ", order,
                [
                    [ "asc", "Croissant" ],
                    [ "desc", "Décroissant" ]
                ],
                onOrderChange
            ),
            selectField(
                "page-size", "Par page : ", String(pageSize),
                pageSizes.map((n): [string, string] => [ String(n), String(n)]),
                onPageSizeChange
            )
        ),
        h("p", { className: "stats" }, stats.join(' - ')),
        sorted.length === 0
            ? h("p", null, "Aucun résultat")
            : h("div", null,
                // Conteneur du tableau : bordure arrondie + défilement horizontal sur petit écran
                h("div", { className: "table-wrapper" },
                    h("table", null,
                        h("thead", null,
                            h("tr", null, h("th", null, "Photo"), columns.map(headerCell))
                        ),
                        h("tbody", null, displayed.map(productRow))
                    )
                ),
                h("div", { className: "pagination" },
                    h("button", { onClick: () => update({ page: currentPage - 1 }), disabled: currentPage <= 1 }, "← Précédent"), ` Page ${currentPage} / ${totalPages}`,
                    h("button", { onClick: () => update({ page: currentPage + 1 }), disabled: currentPage >= totalPages }, "Suivant →")
                )
            ),
            h("p", { className: "compare" },
                h("button", { onClick: onCompareClick }, "Comparer les 3 tris sur 5000 produits")
            ),
        comparisonView(comparison)
    );
}