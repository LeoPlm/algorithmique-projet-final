import type { Route } from "./types"
import { StackRouter } from "./router/stackRouter"
import { homePage } from "./pages/home"
import { productDetailPage } from "./pages/productDetail"
import { productListPage } from "./pages/productList"

type Attributes = Record<string, string>

interface VirtualString {
  type: "string"
  content: string
}

interface VirtualElement {
  type: "element"
  name: string
  attributes: Attributes
  children: Array<VirtualNode>
}

type VirtualNode =
  | VirtualElement
  | VirtualString


// Les routes
const routes: Route[] = [
  { path : "/", component : homePage },
  { path : "/products", component : productListPage },
  { path : "/product/:id", component : productDetailPage },
]

// Code final
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw Error("Root element not found");
}

const router = new StackRouter(routes, document.getElementById('root')!)