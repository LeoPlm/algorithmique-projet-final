import type { VChild, Patch } from "../types"

export function diff(oldNode: VChild, newNode: VChild): Patch[] {
  throw new Error('TODO')
}

export function patch(root: Node, patches: Patch[]): void {
  throw new Error('TODO')
}