import { mount } from '../framework/renderer'
import { h } from "../framework/vdom"
import type { Route, MatchResult, RouteParams, VNode } from '../types'
import { diff, patch } from "../algorithms/diff"
import { prepareRender, resetHooks, runEffects, setRerender } from '../framework/hooks'


class StackRouter {
  private routes: Route[]
  private root: HTMLElement
  private stack: string[] = []
  private currentVNode: VNode | null = null

  constructor(routes: Route[], root: HTMLElement) {
    this.routes = routes
    this.root = root
    // Au démarage on empile la page accueil et on l'affiche
    this.stack.push(location.pathname)
    setRerender(() => this.refresh())
    this.renderCurrent()

    // Bouton retour du navigateur : on dépile et on affiche la page précédente
    window.addEventListener('popstate', () => {
      if(this.stack.length > 1) this.stack.pop()
      this.renderCurrent()
    })
  }

  // Empile la nouvelle page, met à jour l'URL (sans recharger) et l'affiche
  navigate(path: string): void {
    this.stack.push(path)
    history.pushState(null, '', path)
    this.renderCurrent()
  }

  // Retour : history.back() déclenche popstate, qui dépile et ré-affiche.
  // Si la pile n'a qu'une page (arrivée directe par l'URL), on va à l'accueil au lieu de quitter le site.
  back(): void {
    if(this.stack.length > 1) {
      history.back()
    } else {
      this.navigate('/')
    }
  }

  match(path: string): MatchResult | null {
    const pathParts = path.split("/")

    for(const route of this.routes) {
      // on boucle sur toutes les routes
      const routeParts = route.path.split("/")

      // pas le bon nombre de segments = pas la bonne route
      if(routeParts.length !== pathParts.length) continue

      const params : RouteParams = {}
      let ok = true

      for(let i = 0 ; i < routeParts.length ; i++) {
        const routePart = routeParts[i]
        const pathPart = pathParts[i]

        if(routePart.startsWith(":")) {
          // Segment dynamique → on enregistre le paramètre : params["id"] = "3"
          params[routePart.slice(1)] = decodeURIComponent(pathPart)
        } else if(routePart !== pathPart) {
          // route ne correspond pas
          ok = false
          break
        }
      }
      if(ok) return { route, params }
    }
    // Si aucune route ne correspond = 404
    return null
  }

  refresh(): void {
    if(!this.currentVNode) {
      this.renderCurrent()
      return
    }

    const newVNode = this.buildCurrent()
    const patches = diff(this.currentVNode, newVNode)
    patch(this.root, patches)
    this.currentVNode = newVNode
    runEffects()
  }

  // Construit le VNode de la page au sommet de la pile (n'affiche rien)
  private buildCurrent(): VNode {
    prepareRender()
    const path = this.stack[this.stack.length-1]
    const result = this.match(path)

    if(result) return result.route.component(result.params)
    return h("p", null, "Page introuvable")
  }

  // Changement de page : on reconstruit tout le DOM
  private renderCurrent(): void {
    resetHooks()
    const vnode = this.buildCurrent()
    mount(vnode, this.root)
    this.currentVNode = vnode //On le mémorise pour le prochain diff
    runEffects()
  }
}

// Instancier le router
export let router: StackRouter

export function createRouter(routes: Route[], root: HTMLElement): StackRouter {
  router = new StackRouter(routes, root)
  return router
}

// Helper pour les liens
/** Lien interne : navigue via le routeur au lieu de recharger la page */
export function link(path: string, label: string): VNode {
  return h("a", {
    href: path,                     // garde un vrai lien (survol, clic molette…)
    onClick: (e: Event) => {
      e.preventDefault();           // empêche le rechargement de la page
      router.navigate(path);        // push sur la pile + rendu
    },
  }, label);
}
