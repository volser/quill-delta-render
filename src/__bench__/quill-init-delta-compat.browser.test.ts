/**
 * Validates QuillHtmlRenderer output across three Quill initialization strategies:
 *
 *   A — setContents:         Quill processes Delta directly (baseline)
 *   B — pre-rendered init:   Renderer HTML → new Quill(container) (clipboard path)
 *   C — innerHTML + update:  Quill init empty → quill.root.innerHTML = html → quill.update()
 *
 * Run with:
 *   pnpm test:browser
 */

import Quill from 'quill';
import { describe, expect, it } from 'vitest';
import type { Delta } from '../core/ast-types';
import { normalizeHtml } from '../renderers/html/quill/__tests__/normalize-html';
import { QuillHtmlRenderer } from '../renderers/html/quill/quill-html-renderer';
import {
  CODE_BLOCKS,
  EMBEDS_DOC,
  HEADERS_DOC,
  NESTED_LIST,
  REALISTIC_DOC,
  SMALL_FORMATTED,
  SMALL_PLAIN,
  TABLE_DOC,
} from './bench-fixtures';

const renderer = new QuillHtmlRenderer();

function renderToHtml(delta: Delta): string {
  return renderer.renderDelta(delta);
}

function initWithSetContents(delta: Delta) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const quill = new Quill(container);
  quill.setContents(delta.ops);
  return { quill, container };
}

function initWithPreRenderedHtml(delta: Delta) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  container.innerHTML = renderToHtml(delta);
  const quill = new Quill(container);
  return { quill, container };
}

function initWithInnerHtmlUpdate(delta: Delta) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const quill = new Quill(container);
  quill.root.innerHTML = renderToHtml(delta);
  quill.update();
  return { quill, container };
}

// ─── A vs B: renderer HTML through Quill's clipboard path ───────────────────

function testAvsB(name: string, delta: Delta) {
  describe(name, () => {
    it('B (pre-rendered init) matches A (setContents)', () => {
      const a = initWithSetContents(delta);
      const b = initWithPreRenderedHtml(delta);

      expect(normalizeHtml(b.quill.root.innerHTML)).toEqual(normalizeHtml(a.quill.root.innerHTML));
      expect(b.quill.getContents().ops).toEqual(a.quill.getContents().ops);

      a.container.remove();
      b.container.remove();
    });
  });
}

testAvsB('Plain text — 5 paragraphs', SMALL_PLAIN);
testAvsB('Formatted text — 5 blocks', SMALL_FORMATTED);
testAvsB('Nested lists (5 levels × 4 items)', NESTED_LIST);
testAvsB('Headers with body text', HEADERS_DOC);
testAvsB('Embeds (20 images)', EMBEDS_DOC);
testAvsB('Tables (10 rows × 4 cols)', TABLE_DOC);

// ─── A vs B: known Quill limitation ────────────────────────────────────────
//
// Quill's clipboard.convert() strips leading whitespace from code block
// content (e.g. "  const x = 1;" → "const x = 1;"). Our renderer preserves
// the whitespace (matching the original Delta), but Quill normalizes it
// during re-parsing.

describe('Code blocks (5 × 10 lines) — A vs B', () => {
  it.skip('B matches A — skipped: Quill clipboard strips leading whitespace', () => {
    const a = initWithSetContents(CODE_BLOCKS);
    const b = initWithPreRenderedHtml(CODE_BLOCKS);
    expect(b.quill.root.innerHTML).toEqual(a.quill.root.innerHTML);
    a.container.remove();
    b.container.remove();
  });
});

describe('Realistic document — A vs B', () => {
  it.skip('B matches A — skipped: contains code blocks with leading whitespace', () => {
    const a = initWithSetContents(REALISTIC_DOC);
    const b = initWithPreRenderedHtml(REALISTIC_DOC);
    expect(b.quill.root.innerHTML).toEqual(a.quill.root.innerHTML);
    a.container.remove();
    b.container.remove();
  });
});

// ─── A vs C: innerHTML + update (MutationObserver path) ─────────────────────
//
// Strategy C is the fastest but Quill's MutationObserver doesn't reconstruct
// the full content model for all content types. These tests document exactly
// where it works and where it breaks.

function testAvsC(name: string, delta: Delta) {
  describe(`${name} — A vs C`, () => {
    it('C (innerHTML + update) matches A (setContents)', () => {
      const a = initWithSetContents(delta);
      const c = initWithInnerHtmlUpdate(delta);

      expect(normalizeHtml(c.quill.root.innerHTML)).toEqual(normalizeHtml(a.quill.root.innerHTML));
      expect(c.quill.getContents().ops).toEqual(a.quill.getContents().ops);

      a.container.remove();
      c.container.remove();
    });
  });
}

testAvsC('Plain text — 5 paragraphs', SMALL_PLAIN);
testAvsC('Formatted text — 5 blocks', SMALL_FORMATTED);
testAvsC('Headers with body text', HEADERS_DOC);
testAvsC('Embeds (20 images)', EMBEDS_DOC);
testAvsC('Tables (10 rows × 4 cols)', TABLE_DOC);

testAvsC('Nested lists (5 levels × 4 items)', NESTED_LIST);
