import type { TNode } from '../../../../core/ast-types';
import { getLayoutClasses } from '../../common/get-layout-classes';
import type { ResolvedConfig } from '../types/resolved-config';

/**
 * Get CSS classes for block-level layout attributes (indent, align, direction).
 * Returns empty when inlineStyles mode is active.
 *
 * Delegates to the shared `getLayoutClasses` for the actual class generation.
 */
export function getBlockClasses(node: TNode, cfg: ResolvedConfig): string[] {
  if (cfg.inlineStyles !== false) return [];
  return getLayoutClasses(node, cfg.classPrefix);
}
