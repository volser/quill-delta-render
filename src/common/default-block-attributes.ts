import type { BlockAttributeHandler } from '../core/ast-types';

/**
 * Default block attribute handlers for standard Quill delta attributes.
 *
 * Each handler maps a Quill attribute name to an AST block type
 * and any attributes to carry over to the node.
 */
export const DEFAULT_BLOCK_ATTRIBUTES: Record<string, BlockAttributeHandler> = {
  header: (value) => ({
    blockType: 'header',
    blockAttrs: { header: value },
  }),

  blockquote: () => ({
    blockType: 'blockquote',
    blockAttrs: {},
  }),

  'code-block': () => ({
    blockType: 'code-block',
    blockAttrs: {},
  }),

  list: (value) => ({
    blockType: 'list-item',
    blockAttrs: { list: value },
  }),

  table: (value) => ({
    blockType: 'table-cell',
    blockAttrs: { table: value },
  }),

  // Passthrough attributes — keep on the block without changing its type
  align: (value) => ({
    blockType: '',
    blockAttrs: { align: value },
  }),

  direction: (value) => ({
    blockType: '',
    blockAttrs: { direction: value },
  }),

  indent: (value) => ({
    blockType: '',
    blockAttrs: { indent: value },
  }),
};
