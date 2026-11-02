import { mount } from '../framework/render';
import { h } from "../framework/vdom"
import type { Route, MatchResult, RouteParams } from '../types';


export class StackRouter {
  private routes: Route[]
  private root: HTMLElement
  private stack: string[] = []

  constructor(routes: Route[], root: HTMLElement) {
    this.routes = routes
    this.root = root
    // Au démarage on empile la page accueil et on l'affiche
    this.stack.push(location.pathname)
    this.renderCurrent()
  }

  navigate(path: string): void {
    throw new Error('TODO');
  } 
  back(): void {
    throw new Error('TODO');
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
    throw new Error('TODO');
  }

  private renderCurrent(): void {
    // Le sommet de la pile = dernier élément du tableau.
    const path = this.stack[this.stack.length-1]
    const result = this.match(path)

    if(result) {
      mount(result.route.component(result.params), this.root)
    } else {
      // 404
      mount(h("p", null, "Page introuvable"), this.root)
    }
  }
}
