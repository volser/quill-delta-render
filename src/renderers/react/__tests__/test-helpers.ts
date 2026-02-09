import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_BLOCK_ATTRIBUTES } from '../../../common/default-block-attributes';
import { codeBlockGrouper } from '../../../common/transformers/code-block-grouper';
import { listGrouper } from '../../../common/transformers/list-grouper';
import { tableGrouper } from '../../../common/transformers/table-grouper';
import type { Delta } from '../../../core/ast-types';
import { DeltaParser } from '../../../core/parser';
import { ReactRenderer } from '../react-renderer';
import type { ReactRendererConfig } from '../types/react-config';

export const PARSER_CONFIG = {
  blockAttributes: DEFAULT_BLOCK_ATTRIBUTES,
  blockEmbeds: ['video', 'divider'],
};

/** Shorthand: create a Delta from ops. */
export function d(...ops: Delta['ops']): Delta {
  return { ops };
}

function parseDelta(delta: Delta) {
  return new DeltaParser(delta, PARSER_CONFIG)
    .use(listGrouper)
    .use(tableGrouper)
    .use(codeBlockGrouper)
    .toAST();
}

/**
 * End-to-end helper: Delta -> parse -> transform -> render React -> static HTML string.
 *
 * Wraps the rendered output in a `<div>` to ensure `renderToStaticMarkup`
 * always receives a single root element.
 */
export function renderDelta(delta: Delta, config?: ReactRendererConfig): string {
  const ast = parseDelta(delta);
  const renderer = new ReactRenderer(config);
  const element = renderer.render(ast);
  return renderToStaticMarkup(createElement('div', null, element));
}

/** Same as {@link renderDelta} but with a pre-configured renderer instance. */
export function renderDeltaWith(delta: Delta, renderer: ReactRenderer): string {
  const ast = parseDelta(delta);
  const element = renderer.render(ast);
  return renderToStaticMarkup(createElement('div', null, element));
}
