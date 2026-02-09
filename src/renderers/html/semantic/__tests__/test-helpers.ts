import { DEFAULT_BLOCK_ATTRIBUTES } from '../../../../common/default-block-attributes';
import type { BlockMergerConfig } from '../../../../common/transformers/block-merger';
import { blockMerger } from '../../../../common/transformers/block-merger';
import { listGrouper } from '../../../../common/transformers/list-grouper';
import { tableGrouper } from '../../../../common/transformers/table-grouper';
import type { Delta } from '../../../../core/ast-types';
import { DeltaParser } from '../../../../core/parser';
import { SemanticHtmlRenderer } from '../semantic-html-renderer';
import type { SemanticHtmlConfig } from '../types/semantic-html-config';

export const QUILL_CONFIG = { blockAttributes: DEFAULT_BLOCK_ATTRIBUTES };

export function renderDelta(delta: Delta, config?: SemanticHtmlConfig): string {
  const ast = new DeltaParser(delta, QUILL_CONFIG).use(listGrouper).use(tableGrouper).toAST();
  const renderer = new SemanticHtmlRenderer(config);
  return renderer.render(ast);
}

export function renderDeltaWithMerger(
  delta: Delta,
  mergerConfig?: BlockMergerConfig,
  rendererConfig?: SemanticHtmlConfig,
): string {
  const ast = new DeltaParser(delta, QUILL_CONFIG)
    .use(listGrouper)
    .use(tableGrouper)
    .use(blockMerger(mergerConfig))
    .toAST();
  const renderer = new SemanticHtmlRenderer(rendererConfig);
  return renderer.render(ast);
}
