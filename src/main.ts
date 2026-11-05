import type { Route } from "./types"
import { createRouter } from "./router/stackRouter"
import { homePage } from "./pages/home"
import { productDetailPage } from "./pages/productDetail"
import { productListPage } from "./pages/productList"

// Les routes
const routes: Route[] = [
  { path : "/", component : homePage },
  { path : "/products", component : productListPage },
  { path : "/product/:id", component : productDetailPage },
]

// Point de montage de l'application (index.html)
const rootElement = document.getElementById("root")

if (!rootElement) {
  throw Error("Root element not found")
}

// Démarre le routeur : il affiche la page correspondant à l'URL actuelle
createRouter(routes, rootElement)
