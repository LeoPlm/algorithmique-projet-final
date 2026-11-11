import type { Product } from "../types";

// Jeu de données écrit à la main (ids 1 à 40) : volontairement NON trié (ni par id, ni par prix,
// ni par nom) pour pouvoir vérifier visuellement que les algorithmes de tri fonctionnent.
// Cas utiles pour la démo :
//  - accents (Écran, Théière, Poêle…) → la recherche « ecran » doit trouver « Écran » ;
//  - prix en double (29,90 € ×5, 19,99 € ×3, 39 € ×2…) et notes en double (4,5 ×5…)
//    → montrent que le tri rapide n'est pas stable, contrairement à l'insertion et la fusion ;
//  - stock à 0 (ids 7, 13, 20, 24, 32) ;
//  - valeurs extrêmes : note 0 (id 15) et 5 (id 16), prix 4,99 € (id 12) et 1 299 € (id 11) ;
//  - noms au même début (« Clavier… », « Souris… », « Casque… ») pour la recherche binaire par préfixe.
// Le premier produit sert d'exemple de fiche sur la page d'accueil.
const baseProducts: Product[] = [
  { id: 4, name: "Clavier mécanique", category: "Informatique", price: 89.9, stock: 12, rating: 4.5, description: "Clavier mécanique switches rouges, rétroéclairage RGB." },
  { id: 22, name: "Tapis de souris XXL", category: "Gaming", price: 19.99, stock: 80, rating: 4.4, description: "Tapis 90 × 40 cm, surface en tissu, bords cousus anti-effilochage." },
  { id: 1, name: "Casque audio", category: "Audio", price: 59.99, stock: 30, rating: 4.1, description: "Casque circum-auriculaire sans fil, 30 h d'autonomie." },
  { id: 34, name: "Robot pâtissier", category: "Cuisine", price: 449.0, stock: 5, rating: 4.7, description: "Robot 1 200 W, bol 5 L, crochet pétrisseur, batteur et fouet." },
  { id: 7, name: "Lampe de bureau", category: "Maison", price: 24.5, stock: 0, rating: 3.8, description: "Lampe LED orientable avec 3 niveaux de luminosité." },
  { id: 17, name: "Écouteurs intra-auriculaires", category: "Audio", price: 29.9, stock: 65, rating: 3.9, description: "Écouteurs sans fil avec boîtier de charge, réduction de bruit active." },
  { id: 11, name: "Ordinateur portable 15\"", category: "Informatique", price: 1299.0, stock: 2, rating: 4.6, description: "Processeur 8 cœurs, 16 Go de RAM, SSD 1 To, écran 15,6\" Full HD." },
  { id: 29, name: "Casserole en inox", category: "Cuisine", price: 24.5, stock: 25, rating: 4.4, description: "Casserole 18 cm avec couvercle en verre, compatible induction." },
  { id: 2, name: "Souris sans fil", category: "Informatique", price: 19.99, stock: 54, rating: 4.3, description: "Souris ergonomique 2.4 GHz, 1600 DPI." },
  { id: 38, name: "Poêle antiadhésive", category: "Cuisine", price: 29.9, stock: 31, rating: 4.5, description: "Poêle Ø 28 cm, revêtement céramique sans PFAS, tous feux dont induction." },
  { id: 15, name: "Volant de course", category: "Gaming", price: 249.0, stock: 4, rating: 0, description: "Volant à retour de force avec pédalier. Nouveauté : pas encore d'avis." },
  { id: 8, name: "Enceinte Bluetooth", category: "Audio", price: 39.0, stock: 8, rating: 4.0, description: "Enceinte portable étanche IPX7." },
  { id: 25, name: "Disque SSD 1 To", category: "Informatique", price: 89.9, stock: 33, rating: 4.7, description: "SSD NVMe M.2, lecture jusqu'à 3 500 Mo/s." },
  { id: 12, name: "Bougie parfumée", category: "Maison", price: 4.99, stock: 120, rating: 4.0, description: "Bougie à la cire de soja, parfum vanille, 25 h de combustion." },
  { id: 3, name: "Écran 27 pouces", category: "Informatique", price: 229.0, stock: 5, rating: 4.7, description: "Écran IPS 27\", résolution QHD, 144 Hz." },
  { id: 30, name: "Clavier gaming", category: "Gaming", price: 119.0, stock: 10, rating: 4.5, description: "Clavier mécanique switches optiques, touches programmables, repose-poignet." },
  { id: 20, name: "Mixeur plongeant", category: "Cuisine", price: 39.0, stock: 0, rating: 4.1, description: "Mixeur 800 W, pied inox, fouet et hachoir fournis." },
  { id: 6, name: "Bouilloire", category: "Cuisine", price: 29.9, stock: 17, rating: 3.5, description: "Bouilloire électrique 1,7 L, arrêt automatique." },
  { id: 36, name: "Clé USB 64 Go", category: "Informatique", price: 9.99, stock: 200, rating: 4.3, description: "Clé USB 3.2, boîtier en métal, lecture 150 Mo/s." },
  { id: 16, name: "Platine vinyle", category: "Audio", price: 189.0, stock: 6, rating: 5.0, description: "Platine 33/45 tours à entraînement par courroie, préampli intégré." },
  { id: 24, name: "Ventilateur colonne", category: "Maison", price: 64.9, stock: 0, rating: 3.4, description: "Ventilateur oscillant 3 vitesses, télécommande, minuterie 7 h." },
  { id: 10, name: "Manette sans fil", category: "Gaming", price: 54.99, stock: 40, rating: 4.5, description: "Manette Bluetooth compatible PC et mobile, vibrations, 20 h d'autonomie." },
  { id: 39, name: "Lampe de chevet", category: "Maison", price: 19.99, stock: 37, rating: 4.2, description: "Lampe tactile à intensité variable, lumière chaude 2 700 K." },
  { id: 5, name: "Micro USB", category: "Audio", price: 69.0, stock: 3, rating: 4.4, description: "Microphone à condensateur USB pour streaming et podcast." },
  { id: 27, name: "Ampli de salon", category: "Audio", price: 279.0, stock: 3, rating: 4.2, description: "Amplificateur stéréo 2 × 50 W, entrée phono, Bluetooth aptX." },
  { id: 13, name: "Clavier compact", category: "Informatique", price: 49.9, stock: 0, rating: 4.0, description: "Clavier 60 % sans pavé numérique, connexion USB-C." },
  { id: 31, name: "Plaid en laine", category: "Maison", price: 39.0, stock: 15, rating: 4.9, description: "Plaid 130 × 170 cm en laine mérinos, fabriqué en Écosse." },
  { id: 9, name: "Cafetière à piston", category: "Cuisine", price: 29.9, stock: 22, rating: 4.2, description: "Cafetière en verre borosilicaté, 1 L (8 tasses), filtre inox." },
  { id: 40, name: "Écran gaming 24\"", category: "Gaming", price: 199.0, stock: 12, rating: 4.4, description: "Écran 24\" Full HD, 165 Hz, temps de réponse 1 ms." },
  { id: 18, name: "Aspirateur balai", category: "Maison", price: 159.0, stock: 11, rating: 4.3, description: "Aspirateur sans fil 2-en-1, 45 min d'autonomie, filtre HEPA." },
  { id: 33, name: "Enceinte connectée", category: "Audio", price: 99.0, stock: 21, rating: 3.8, description: "Enceinte Wi-Fi avec assistant vocal, compatible multiroom." },
  { id: 21, name: "Webcam HD", category: "Informatique", price: 44.9, stock: 27, rating: 3.7, description: "Webcam 1080p à 30 images/s, micro stéréo, clip universel." },
  { id: 37, name: "Manette filaire", category: "Gaming", price: 24.99, stock: 52, rating: 3.5, description: "Manette USB filaire, câble de 3 m, compatible PC." },
  { id: 14, name: "Théière en fonte", category: "Cuisine", price: 34.5, stock: 9, rating: 4.8, description: "Théière japonaise en fonte émaillée, 0,8 L, filtre inox inclus." },
  { id: 32, name: "Souris verticale", category: "Informatique", price: 34.9, stock: 0, rating: 4.1, description: "Souris ergonomique verticale qui réduit les tensions du poignet." },
  { id: 26, name: "Console portable", category: "Gaming", price: 349.0, stock: 7, rating: 4.6, description: "Console de jeu portable, écran OLED 7\", 64 Go de stockage." },
  { id: 23, name: "Grille-pain 2 fentes", category: "Cuisine", price: 29.9, stock: 14, rating: 3.6, description: "Grille-pain inox, 7 niveaux de brunissage, fonction décongélation." },
  { id: 35, name: "Miroir rond", category: "Maison", price: 59.0, stock: 8, rating: 4.0, description: "Miroir mural Ø 60 cm, cadre en métal doré." },
  { id: 19, name: "Casque gaming", category: "Gaming", price: 79.99, stock: 18, rating: 4.5, description: "Casque son surround 7.1, micro antibruit rétractable." },
  { id: 28, name: "Hub USB-C 7-en-1", category: "Informatique", price: 34.5, stock: 46, rating: 4.0, description: "HDMI 4K, 3 ports USB-A, lecteur de cartes SD et microSD." },
];

// Types de produits par catégorie, pour que les noms générés restent cohérents.
// Chaque type doit avoir un mot-clé d'image dans images.ts (imageKeywords).
const catalog: Record<string, string[]> = {
  Informatique: ["Clavier", "Souris", "Écran", "Webcam", "Disque SSD", "Hub USB", "Clé USB"],
  Audio: ["Casque", "Enceinte", "Micro", "Écouteurs", "Ampli"],
  Maison: ["Lampe", "Ventilateur", "Aspirateur", "Miroir", "Plaid"],
  Cuisine: ["Bouilloire", "Grille-pain", "Cafetière", "Mixeur", "Théière"],
  Gaming: ["Manette", "Console", "Volant", "Tapis de souris"],
};

// Suffixes ajoutés au nom ("Clavier Pro 42")
const adjectives = ["Pro", "Mini", "Max", "Lite", "Ultra", "Eco", "Plus"];

// Générateur de nombres pseudo-aléatoires : renvoie un nombre dans [0, 1[ à chaque appel
type Random = () => number;

// Générateur congruentiel linéaire (LCG) : seed = (a × seed + c) mod m.
// Même graine → même suite de nombres → mêmes produits à chaque rechargement (contrairement à Math.random).
// Constantes de « Numerical Recipes » : m = 2³², a = 1664525, c = 1013904223.
// a × seed reste < 2⁵³, donc le calcul est exact avec les nombres JavaScript.
// Complexité : O(1) par tirage.
function createRandom(seed: number): Random {
  const m = 4294967296; // 2³²
  const a = 1664525;
  const c = 1013904223;
  let state = Math.abs(Math.floor(seed)) % m;
  return () => {
    state = (a * state + c) % m;
    return state / m;
  };
}

// Entier pseudo-aléatoire entre min et max (inclus) — O(1)
function randomInt(random: Random, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

// Élément pseudo-aléatoire d'un tableau — O(1)
function pick<T>(random: Random, arr: readonly T[]): T {
  return arr[randomInt(random, 0, arr.length - 1)];
}

// Génère `count` produits fictifs, avec des ids qui commencent à `firstId`.
// Déterministe : un nouveau générateur est créé à chaque appel à partir de `seed`,
// donc deux appels avec les mêmes arguments renvoient exactement les mêmes produits.
// Complexité : O(n), un seul tour de boucle par produit
export function generateProducts(count: number, firstId: number, seed: number = 42): Product[] {
  const random = createRandom(seed);
  const categories = Object.keys(catalog);
  const result: Product[] = [];
  for (let i = 0; i < count; i++) {
    const id = firstId + i;
    const category = pick(random, categories);
    const type = pick(random, catalog[category]);

    result.push({
      id,
      name: `${type} ${pick(random, adjectives)} ${id}`,
      category,
      price: randomInt(random, 500, 50000) / 100,
      stock: randomInt(random, 0, 100),
      rating: randomInt(random, 0, 50) / 10,
      description: `${type} de la catégorie ${category}, modèle n°${id}`,
    });
  }
  return result;
}

// Nombre total de produits du catalogue : assez grand pour voir la différence
// entre le tri par insertion O(n²) et les tris rapide / fusion O(n log n)
const CATALOG_SIZE = 5000;

// Catalogue final : les produits écrits à la main (ids 1 à 40), puis les produits générés (ids 41, 42…)
export const products: Product[] = [
  ...baseProducts,
  ...generateProducts(CATALOG_SIZE - baseProducts.length, baseProducts.length + 1),
];

// Vérifie la cohérence d'une liste de produits et renvoie la liste des erreurs (vide si tout va bien) :
//  - ids uniques : indispensable car la fiche produit retrouve un produit par recherche binaire sur l'id ;
//    avec deux produits de même id, on ne saurait pas lequel est renvoyé ;
//  - note entre 0 et 5, prix strictement positif, stock ≥ 0.
// Les conditions sont écrites « à l'envers » (!(x >= 0) plutôt que x < 0) pour rejeter aussi NaN,
// car toute comparaison avec NaN vaut false.
// Complexité : O(n) — un seul parcours ; Set.has / Set.add sont en O(1) (en moyenne).
export function validateProducts(list: readonly Product[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<number>();

  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const where = `Produit n°${i} (id ${p.id}, « ${p.name} »)`;

    if (seenIds.has(p.id)) errors.push(`${where} : id en double`);
    seenIds.add(p.id);

    if (!(p.rating >= 0 && p.rating <= 5)) errors.push(`${where} : note ${p.rating} hors de [0, 5]`);
    if (!(p.price > 0)) errors.push(`${where} : prix ${p.price} non positif`);
    if (!(p.stock >= 0)) errors.push(`${where} : stock ${p.stock} négatif`);
  }
  return errors;
}

// Contrôle au chargement : les erreurs éventuelles s'affichent dans la console du navigateur (F12)
const productErrors = validateProducts(products);
if (productErrors.length > 0) {
  console.error(`validateProducts : ${productErrors.length} erreur(s) dans les données`, productErrors);
}
