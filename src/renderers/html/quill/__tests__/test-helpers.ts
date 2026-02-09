import { DEFAULT_BLOCK_ATTRIBUTES } from '../../../../common/default-block-attributes';
import type { BlockMergerConfig } from '../../../../common/transformers/block-merger';
import { blockMerger } from '../../../../common/transformers/block-merger';
import { listGrouper } from '../../../../common/transformers/list-grouper';
import { tableGrouper } from '../../../../common/transformers/table-grouper';
import type { Delta } from '../../../../core/ast-types';
import { DeltaParser } from '../../../../core/parser';
import { QuillHtmlRenderer } from '../quill-html-renderer';

export const QUILL_CONFIG = { blockAttributes: DEFAULT_BLOCK_ATTRIBUTES };

export function renderDelta(delta: Delta): string {
  const ast = new DeltaParser(delta, QUILL_CONFIG).use(listGrouper).use(tableGrouper).toAST();
  const renderer = new QuillHtmlRenderer();
  return renderer.render(ast);
}

export function renderDeltaWithMerger(delta: Delta, mergerConfig?: BlockMergerConfig): string {
  const ast = new DeltaParser(delta, QUILL_CONFIG)
    .use(listGrouper)
    .use(tableGrouper)
    .use(blockMerger(mergerConfig))
    .toAST();
  const renderer = new QuillHtmlRenderer();
  return renderer.render(ast);
}
