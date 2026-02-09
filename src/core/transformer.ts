import type { TNode, Transformer } from './ast-types';

/**
 * Runs a sequence of transformers against an AST root node.
 * Each transformer receives the children array from the previous step.
 *
 * Returns a new root node with the transformed children.
 *
 * @example
 * ```ts
 * const finalAst = applyTransformers(rawAst, [listGrouper, tableGrouper]);
 * ```
 */
export function applyTransformers(root: TNode, transformers: Transformer[]): TNode {
  const children = transformers.reduce(
    (currentChildren, transformer) => transformer(currentChildren),
    root.children,
  );
  return { ...root, children };
}

/**
 * Composes multiple transformers into a single transformer function.
 *
 * @example
 * ```ts
 * const combined = composeTransformers(listGrouper, tableGrouper);
 * const finalChildren = combined(rawChildren);
 * ```
 */
export function composeTransformers(...transformers: Transformer[]): Transformer {
  return (children: TNode[]) =>
    transformers.reduce((currentChildren, transformer) => transformer(currentChildren), children);
}
