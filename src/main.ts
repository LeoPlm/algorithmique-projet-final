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

function render(parent: HTMLElement, virtualNode: VirtualNode): void {
  switch (virtualNode.type) {
    case "string": {
      const element = document.createTextNode(virtualNode.content);
      parent.appendChild(element);
      return;
    }

    case "element": {
      const element = document.createElement(virtualNode.name);

      for (const attributeName in virtualNode.attributes) {
        const attributeValue = virtualNode.attributes[attributeName];
        element.setAttribute(attributeName, attributeValue);
      }

      for (const child of virtualNode.children) {
        render(element, child);
      }

      parent.appendChild(element);

      return;
    }

    default:
      const unhandled: never = virtualNode;
      throw new Error(`Unhandled case: ${JSON.stringify(unhandled)}`);
  }
}

function diff(oldVirtualNode: VirtualNode, newVirtualNode: VirtualNode) {
  function patch(parent: HTMLElement) {
    if (oldVirtualNode.type === "string") {
      if (newVirtualNode.type === "string") {
        if (oldVirtualNode.content !== newVirtualNode.content) {
          parent.firstChild?.replaceWith(document.createTextNode(newVirtualNode.content))
        }
      }
    }
  }

  return patch;
}

const oldVirtualNode: VirtualNode = {
  type: "string",
  content: "Hello"
};

const newVirtualNode: VirtualNode = {
  type: "string",
  content: "Bye"
};

// Code final

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw Error("Root element not found");
}

render(rootElement, oldVirtualNode);

const patch = diff(oldVirtualNode, newVirtualNode);

patch(rootElement);
