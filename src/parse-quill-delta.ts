import { DEFAULT_BLOCK_ATTRIBUTES } from './common/default-block-attributes';
import type { BlockMergerConfig } from './common/transformers/block-merger';
import { blockMerger } from './common/transformers/block-merger';
import { codeBlockGrouper } from './common/transformers/code-block-grouper';
import { listGrouper } from './common/transformers/list-grouper';
import { tableGrouper } from './common/transformers/table-grouper';
import type { Delta, ParserConfig, TNode, Transformer } from './core/ast-types';
import { parseDelta } from './core/parser';
import { applyTransformers } from './core/transformer';

/**
 * Options for {@link parseQuillDelta}.
 */
export interface ParseQuillDeltaOptions {
  /**
   * Additional block attribute handlers merged on top of the defaults.
   * Use this to support custom block-level formats.
   */
  extraBlockAttributes?: ParserConfig['blockAttributes'];

  /**
   * Embed types that are block-level (rendered as standalone blocks
   * instead of being placed inside a paragraph).
   * @default ['video']
   */
  blockEmbeds?: string[];

  /**
   * Configuration for the {@link blockMerger} transformer that merges
   * consecutive same-style blocks (paragraphs, blockquotes, headers,
   * code blocks) into single blocks with `<br/>` separators.
   *
   * Pass `false` to disable the block merger entirely.
   *
   * @default { multiLineParagraph: true, multiLineBlockquote: true, multiLineHeader: true, multiLineCodeblock: true }
   */
  blockMerger?: BlockMergerConfig | false;

  /**
   * Additional transformers appended after the standard ones
   * (listGrouper, tableGrouper, codeBlockGrouper, blockMerger).
   */
  extraTransformers?: Transformer[];

  /**
   * Replace the standard transformer pipeline entirely.
   * When provided, `extraTransformers` is ignored.
   */
  transformers?: Transformer[];
}

function buildStandardTransformers(mergerConfig?: BlockMergerConfig | false): Transformer[] {
  const transformers: Transformer[] = [listGrouper, tableGrouper, codeBlockGrouper];
  if (mergerConfig !== false) {
    transformers.push(blockMerger(mergerConfig));
  }
  return transformers;
}

/**
 * One-call convenience function: parses a Quill Delta into a fully
 * transformed AST ready for rendering.
 *
 * Bundles `DEFAULT_BLOCK_ATTRIBUTES`, `listGrouper`, `tableGrouper`,
 * `codeBlockGrouper`, and `blockMerger` so the 80% use case is a single
 * function call.
 *
 * @example
 * ```ts
 * import { parseQuillDelta } from 'quill-delta-render';
 * import { SemanticHtmlRenderer } from 'quill-delta-render/renderers/html';
 *
 * const ast = parseQuillDelta(delta);
 * const html = new SemanticHtmlRenderer().render(ast);
 * ```
 *
 * @example
 * ```ts
 * // With custom block attributes and extra transformers
 * const ast = parseQuillDelta(delta, {
 *   extraBlockAttributes: {
 *     'my-widget': (value) => ({ blockType: 'widget', blockAttrs: { widgetId: value } }),
 *   },
 *   extraTransformers: [myCustomGrouper],
 * });
 * ```
 */
export function parseQuillDelta(delta: Delta, options?: ParseQuillDeltaOptions): TNode {
  const config: ParserConfig = {
    blockAttributes: {
      ...DEFAULT_BLOCK_ATTRIBUTES,
      ...options?.extraBlockAttributes,
    },
    blockEmbeds: options?.blockEmbeds ?? ['video'],
  };

  const rawAst = parseDelta(delta, config);

  const transformers = options?.transformers ?? [
    ...buildStandardTransformers(options?.blockMerger),
    ...(options?.extraTransformers ?? []),
  ];

  return applyTransformers(rawAst, transformers);
}
