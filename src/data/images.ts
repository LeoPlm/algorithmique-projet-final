import type { Product } from "../types";

const imageKeywords: Record<string, string> = {
    "Clavier": "keyboard", "Souris": "computer-mouse", "Écran": "monitor",
    "Webcam": "webcam", "Disque SSD": "ssd", "Hub USB": "usb",
    "Casque": "headphones", "Enceinte": "speaker", "Micro": "microphone",
    "Écouteurs": "earphones", "Ampli": "amplifier",
    "Lampe": "lamp", "Bouilloire": "kettle", "Ventilateur": "fan",
    "Grille-pain": "toaster", "Aspirateur": "vacuum-cleaner",
}

export function imageUrl(p: Product, size: number): string {
  let keyword = "product"
  for(const type in imageKeywords) {
    if(p.name.startsWith(type)) keyword = imageKeywords[type]
  }
  return `https://loremflickr.com/${size}/${size}/${keyword}?lock=${p.id}`
}


// Icône de secours par catégorie, affichée si la photo ne charge pas (service en panne, pas d'Internet)
const categoryIcons: Record<string, string> = {
    Informatique: "💻",
    Audio: "🎧",
    Maison: "🏠",
}

export function categoryIcon(p: Product): string {
  return categoryIcons[p.category] ?? "📦"
}

// L'icône est toujours placée juste AVANT l'image, dans le même parent
function iconOf(img: HTMLImageElement): HTMLElement | null {
  return img.previousElementSibling as HTMLElement | null
}

// Erreur de chargement : on cache l'image et on affiche l'icône
export function showIconOnError(e: Event): void {
  const img = e.target as HTMLImageElement
  img.hidden = true
  const icon = iconOf(img)
  if (icon) icon.hidden = false
}

// Image chargée : on l'affiche et on cache l'icône.
// Utile car le diff réutilise les lignes du tableau par index : après un tri, une <img>
// cachée peut recevoir un nouveau src qui, lui, se charge correctement.
export function showImageOnLoad(e: Event): void {
  const img = e.target as HTMLImageElement
  img.hidden = false
  const icon = iconOf(img)
  if (icon) icon.hidden = true
}
