import type { Product } from "../types";

// Jeu de données de test : volontairement NON trié (ni par id, ni par prix, ni par nom)
// pour pouvoir vérifier visuellement que les algorithmes de tri fonctionnent.
export const baseProducts: Product[] = [
  { id: 4, name: "Clavier mécanique", category: "Informatique", price: 89.9, stock: 12, rating: 4.5, description: "Clavier mécanique switches rouges, rétroéclairage RGB." },
  { id: 1, name: "Casque audio", category: "Audio", price: 59.99, stock: 30, rating: 4.1, description: "Casque circum-auriculaire sans fil, 30 h d'autonomie." },
  { id: 7, name: "Lampe de bureau", category: "Maison", price: 24.5, stock: 0, rating: 3.8, description: "Lampe LED orientable avec 3 niveaux de luminosité." },
  { id: 2, name: "Souris sans fil", category: "Informatique", price: 19.99, stock: 54, rating: 4.3, description: "Souris ergonomique 2.4 GHz, 1600 DPI." },
  { id: 8, name: "Enceinte Bluetooth", category: "Audio", price: 39.0, stock: 8, rating: 4.0, description: "Enceinte portable étanche IPX7." },
  { id: 3, name: "Écran 27 pouces", category: "Informatique", price: 229.0, stock: 5, rating: 4.7, description: "Écran IPS 27\", résolution QHD, 144 Hz." },
  { id: 6, name: "Bouilloire", category: "Maison", price: 29.9, stock: 17, rating: 3.5, description: "Bouilloire électrique 1,7 L, arrêt automatique." },
  { id: 5, name: "Micro USB", category: "Audio", price: 69.0, stock: 3, rating: 4.4, description: "Microphone à condensateur USB pour streaming et podcast." },
];

const catalog: Record<string, string[]> = {
  Informatique: ["Clavier", "Souris", "Écran", "Webcam", "Disque SSD", "Hub USB"],
  Audio: ["Casque", "Enceinte", "Micro", "Écouteurs", "Ampli"],
  Maison: ["Lampe", "Bouilloire", "Ventilateur", "Grille-pain", "Aspirateur"],
}

const adjectives = ["Pro", "Mini", "Max", "Lite", "Ultra", "Eco", "Plus"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Élément aléatoire d'un tableau
function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export function generateProducts(count: number, firstId: number): Product[] {
  const categories = Object.keys(catalog)
  const result: Product[] = []
  for(let i = 0 ; i < count ; i++) {
    const id = firstId + i
    const category = pick(categories)
    const type = pick(catalog[category])

    result.push({
      id,
      name: `${type} ${pick(adjectives)} ${id}`,
      category,
      price: randomInt(500, 50000) / 100,
      stock: randomInt(0, 100),
      rating: randomInt(0, 50) / 10,
      description: `${type} de la catégorie ${category}, modèle n°${id}`
    })
  }
  return result
}

// Catalogue final

export const products: Product[] = [
    ...baseProducts,
    ...generateProducts(500, baseProducts.length + 1)  
]
