import type { VChild, Patch, Props } from "../types"
import { render, setProp, removeProp } from "../framework/renderer"

/**
 * DIFF : compare récursivement l'ancien et le nouvel arbre virtuel
 * et renvoie la liste des modifications à appliquer au vrai DOM.
 * Complexité : O(n), n = nombre de nœuds (chaque paire de nœuds est visitée une fois).
 */
export function diff(oldNode: VChild, newNode: VChild): Patch[] {
  const patches: Patch[] = []
  walk(oldNode, newNode, [0], patches)
  return patches
}

function walk(oldNode: VChild, newNode: VChild, path: number[], patches: Patch[]): void {
  // Cas 1 : deux textes, on compare leur contenu.
  if(typeof oldNode === "string" && typeof newNode === "string") {
    if(oldNode !== newNode) patches.push({ type: "TEXT", path, value: newNode })
    return
  }
  // Cas 2: text / balise ou 2 balises différentes = tout le noeud est remplacé.
  if(typeof oldNode === "string" || typeof newNode === "string" || oldNode.type !== newNode.type) {
    patches.push({ type: "REPLACE", path, node: newNode })
    return
  }

  // Cas 3 : si ce sont 2 mêmes balises, on compare les props.
  const propsPatch = diffProps(oldNode.props, newNode.props)
  if(propsPatch) patches.push({ type : "PROPS", path, ...propsPatch })

  // Puis les enfants
  const oldChildren = oldNode.children
  const newChildren = newNode.children
  const common = Math.min(oldChildren.length, newChildren.length)

  // Enfants présents des 2 côtés = appel récursif
  for(let i = 0 ; i < common ; i++) {
    walk(oldChildren[i], newChildren[i], [...path, i], patches )
  }

  // Enfant en plus dans le nouvel arbre = CREATE
  for(let i = common ; i < newChildren.length ; i++) {
    patches.push({ type: "CREATE", path: [...path,i], node: newChildren[i] })
  }

  // Enfants en trop dans l'ancien arbre = remove
  for(let i = oldChildren.length - 1 ; i >= common ; i--) {
    patches.push({ type: "REMOVE", path: [...path, i] })
  }
}

// Comparaison de 2 props
function diffProps(oldProps: Props, newProps: Props): { set: Props, remove: string[] } | null {
  const set: Props = {}
  const remove: string[] = []
  let changed = false

  // Nouvelle props ou modification
  for(const key of Object.keys(newProps)) {
    if(oldProps[key] !== newProps[key]) {
      set[key] = newProps[key]
      changed = true
    }
  }

  // Props disparues
  for(const key of Object.keys(oldProps)) {
    if(!(key in newProps)) {
      remove.push(key)
      changed = true
    }
  }

  return changed ? { set, remove } : null
}

/**
 * PATCH : applique au vrai DOM la liste de modifications produite par diff().
 * Complexité : O(p × d), p = nombre de patches, d = profondeur du chemin à suivre.
 */
export function patch(root: Node, patches: Patch[]): void {
  for(const p of patches) {
    switch(p.type) {
      case "TEXT": {
        // On change le contenu du noeud texte
        getNode(root, p.path).textContent = p.value
        break
      }
      case "REPLACE": {
        // On construit le nouveau noeud qui prend la place de l'ancien
        getNode(root, p.path).replaceWith(render(p.node))
        break
      }
      case "PROPS": {
        const el = getNode(root, p.path)
        if(!(el instanceof HTMLElement)) break //Sécurité pour etre sur que ce sont les balises qui ont des props
        for(const [key, value] of Object.entries(p.set)) setProp(el, key, value)
          for(const key of p.remove) removeProp(el, key)
        break
      } 
      case "CREATE": {
        const parent = getNode(root, p.path.slice(0,-1))
        parent.appendChild(render(p.node))
        break
      }
      case "REMOVE": {
        getNode(root, p.path).remove()
        break
      }
      default: {
        const unhandled: never = p
        throw new Error(`Patch inconnu : ${JSON.stringify(unhandled)}`)
      }
    }
  }
}

function getNode(root: Node, path: number[]): ChildNode {
  let node: Node = root
  for(const index of path) {
    const child: ChildNode | undefined = node.childNodes[index]
    if (!child) throw new Error(`Nœud introuvable au chemin [${path.join(", ")}]`)
    node = child
  }
  return node as ChildNode
}