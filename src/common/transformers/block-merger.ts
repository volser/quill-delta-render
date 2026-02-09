import type { TNode, Transformer } from '../../core/ast-types';
import { groupConsecutiveElementsWhile } from '../utils/group-consecutive';

// ─── Config ─────────────────────────────────────────────────────────────────

/**
 * Configuration for the blockMerger transformer.
 *
 * Each flag controls whether consecutive blocks of that type
 * should be merged into a single block (with `<br>`-equivalent
 * newline separators between their inline children).
 *
 * Defaults match quill-delta-to-html behavior:
 * - blockquote: merged
 * - header: merged
 * - code-block: merged
 * - paragraph: NOT merged (each paragraph stays separate)
 */
export interface BlockMergerConfig {
  /** Merge consecutive blockquotes. Default: `true` */
  multiLineBlockquote?: boolean;
  /** Merge consecutive same-level headers. Default: `true` */
  multiLineHeader?: boolean;
  /** Merge consecutive same-language code blocks. Default: `true` */
  multiLineCodeblock?: boolean;
  /** Merge consecutive paragraphs (same indent/align/direction). Default: `false` */
  multiLineParagraph?: boolean;
}

const DEFAULT_CONFIG: Required<BlockMergerConfig> = {
  multiLineBlockquote: true,
  multiLineHeader: true,
  multiLineCodeblock: true,
  multiLineParagraph: false,
};

// ─── Merge Logic ────────────────────────────────────────────────────────────

/**
 * Returns a TNode that represents a line-break between merged blocks.
 * Renderers should handle this as a `<br/>` or newline separator.
 */
function createNewlineNode(): TNode {
  return {
    type: 'text',
    attributes: {},
    children: [],
    data: '\n',
    isInline: true,
  };
}

function isMergeableType(type: string, cfg: Required<BlockMergerConfig>): boolean {
  switch (type) {
    case 'blockquote':
      return cfg.multiLineBlockquote;
    case 'header':
      return cfg.multiLineHeader;
    case 'code-block':
      return cfg.multiLineCodeblock;
    case 'paragraph':
      return cfg.multiLineParagraph;
    default:
      return false;
  }
}

function haveSameBlockStyle(a: TNode, b: TNode): boolean {
  if (a.type !== b.type) return false;

  switch (a.type) {
    case 'header':
      return a.attributes.header === b.attributes.header;
    case 'code-block':
      return a.attributes['code-block'] === b.attributes['code-block'];
    case 'paragraph':
      return (
        a.attributes.indent === b.attributes.indent &&
        a.attributes.align === b.attributes.align &&
        a.attributes.direction === b.attributes.direction
      );
    case 'blockquote':
      return true;
    default:
      return false;
  }
}

function mergeBlocks(blocks: TNode[]): TNode {
  const first = blocks[0]!;
  if (blocks.length === 1) return first;

  const mergedChildren: TNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    if (i > 0) {
      mergedChildren.push(createNewlineNode());
    }
    mergedChildren.push(...blocks[i]!.children);
  }

  return {
    ...first,
    children: mergedChildren,
  };
}

// ─── Transformer ────────────────────────────────────────────────────────────

/**
 * Creates a transformer that merges consecutive same-style blocks.
 *
 * For example, consecutive blockquotes become one blockquote with
 * newline separators between their content. Same for headers and code blocks.
 *
 * @param config - Controls which block types are merged
 *
 * @example
 * ```ts
 * const ast = applyTransformers(rawAst, [listGrouper, blockMerger()]);
 * ```
 *
 * @example
 * ```ts
 * // Merge everything including paragraphs
 * const ast = applyTransformers(rawAst, [blockMerger({ multiLineParagraph: true })]);
 * ```
 */
export function blockMerger(config?: BlockMergerConfig): Transformer {
  const cfg: Required<BlockMergerConfig> = { ...DEFAULT_CONFIG, ...config };

  return (children: TNode[]): TNode[] => {
    const grouped = groupConsecutiveElementsWhile(children, (curr, prev) => {
      return (
        isMergeableType(curr.type, cfg) &&
        isMergeableType(prev.type, cfg) &&
        haveSameBlockStyle(curr, prev)
      );
    });

    return grouped.map((item) => {
      if (Array.isArray(item)) {
        return mergeBlocks(item);
      }
      return item;
    });
  };
}
