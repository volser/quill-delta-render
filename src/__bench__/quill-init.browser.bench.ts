/**
 * Browser benchmarks: Quill setContents vs pre-rendered HTML + Quill init
 *
 * Requires Vitest browser mode (Playwright).
 * Run with:
 *   pnpm bench:browser
 */

import Quill from 'quill';
import { bench, describe } from 'vitest';
import type { Delta } from '../core/ast-types';
import { parseQuillDelta } from '../parse-quill-delta';
import { QuillHtmlRenderer } from '../renderers/html/quill/quill-html-renderer';
import {
  CODE_BLOCKS,
  EMBEDS_DOC,
  HEADERS_DOC,
  LARGE_FORMATTED,
  LARGE_PLAIN,
  MEDIUM_FORMATTED,
  MEDIUM_PLAIN,
  NESTED_LIST,
  REALISTIC_DOC,
  SMALL_FORMATTED,
  SMALL_PLAIN,
  TABLE_DOC,
} from './bench-fixtures';

const renderer = new QuillHtmlRenderer();

function renderToHtml(delta: Delta): string {
  const ast = parseQuillDelta(delta);
  return renderer.render(ast);
}

function benchSuite(name: string, delta: Delta) {
  const preRenderedHtml = renderToHtml(delta);

  describe(name, () => {
    bench('Quill setContents', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const quill = new Quill(container);
      quill.setContents(delta.ops);
      container.remove();
    });

    bench('QuillHtmlRenderer — render only', () => {
      renderToHtml(delta);
    });

    bench('Init Quill on pre-rendered HTML', () => {
      const container = document.createElement('div');
      container.innerHTML = preRenderedHtml;
      document.body.appendChild(container);
      new Quill(container);
      container.remove();
    });

    bench('Render + Init Quill (total)', () => {
      const container = document.createElement('div');
      const html = renderToHtml(delta);
      container.innerHTML = html;
      document.body.appendChild(container);
      new Quill(container);
      container.remove();
    });
  });
}

benchSuite('Plain text — 5 paragraphs', SMALL_PLAIN);
benchSuite('Plain text — 50 paragraphs', MEDIUM_PLAIN);
benchSuite('Plain text — 500 paragraphs', LARGE_PLAIN);

benchSuite('Formatted text — 5 blocks', SMALL_FORMATTED);
benchSuite('Formatted text — 50 blocks', MEDIUM_FORMATTED);
benchSuite('Formatted text — 200 blocks', LARGE_FORMATTED);

benchSuite('Nested lists (5 levels × 4 items)', NESTED_LIST);
benchSuite('Headers with body text', HEADERS_DOC);
benchSuite('Code blocks (5 blocks × 10 lines)', CODE_BLOCKS);
benchSuite('Embeds (20 images)', EMBEDS_DOC);
benchSuite('Tables (10 rows × 4 cols)', TABLE_DOC);
benchSuite('Realistic document (mixed content)', REALISTIC_DOC);
