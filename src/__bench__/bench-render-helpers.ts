import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { RenderDelta } from 'quill-delta-to-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Delta } from '../core/ast-types';
import { parseQuillDelta } from '../parse-quill-delta';
import { SemanticHtmlRenderer } from '../renderers/html/semantic/semantic-html-renderer';
import { ReactRenderer } from '../renderers/react/react-renderer';

const semanticRenderer = new SemanticHtmlRenderer();
const reactRenderer = new ReactRenderer();

export function renderSemantic(delta: Delta): string {
  const ast = parseQuillDelta(delta);
  return semanticRenderer.render(ast);
}

export function renderReactElements(delta: Delta): void {
  const ast = parseQuillDelta(delta);
  reactRenderer.render(ast);
}

export function renderReactToHtml(delta: Delta): string {
  const ast = parseQuillDelta(delta);
  const element = reactRenderer.render(ast);
  return renderToStaticMarkup(createElement('div', null, element));
}

export function renderQuillDeltaToHtml(delta: Delta): string {
  const converter = new QuillDeltaToHtmlConverter(delta.ops);
  return converter.convert();
}

export function renderQuillDeltaToReactToHtml(delta: Delta): string {
  return renderToStaticMarkup(createElement(RenderDelta, { ops: delta.ops }));
}
