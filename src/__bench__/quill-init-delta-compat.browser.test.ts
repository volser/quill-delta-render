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

function normalizeAttrOrder(html: string): string {
  return html.replace(/<(\w+)((?:\s+[\w-]+="[^"]*")+)/g, (_match, tag, attrs: string) => {
    const sorted = attrs
      .trim()
      .match(/[\w-]+="[^"]*"/g)!
      .sort()
      .join(' ');
    return `<${tag} ${sorted}`;
  });
}

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

      expect(b.quill.root.innerHTML).toEqual(a.quill.root.innerHTML);
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

      expect(c.quill.root.innerHTML).toEqual(a.quill.root.innerHTML);
      expect(c.quill.getContents().ops).toEqual(a.quill.getContents().ops);

      a.container.remove();
      c.container.remove();
    });
  });
}

testAvsC('Plain text — 5 paragraphs', SMALL_PLAIN);
testAvsC('Headers with body text', HEADERS_DOC);
testAvsC('Embeds (20 images)', EMBEDS_DOC);
testAvsC('Tables (10 rows × 4 cols)', TABLE_DOC);

// These content types fail with innerHTML + update because Quill's
// MutationObserver doesn't fully reconstruct block structure from raw DOM.

// Renderer places color on <a> instead of <strong> wrapper, causing Quill's
// optimize to merge adjacent <strong> blots that should stay separate.
// This is a renderer issue to fix separately.
describe('Formatted text — A vs C', () => {
  it.fails('C differs due to color style placement on <a> vs <strong>', () => {
    const a = initWithSetContents(SMALL_FORMATTED);
    const c = initWithInnerHtmlUpdate(SMALL_FORMATTED);
    expect(c.quill.root.innerHTML).toEqual(a.quill.root.innerHTML);
    a.container.remove();
    c.container.remove();
  });
});

// Content is identical — only attribute order on <li> differs
// (class before data-list vs data-list before class).
describe('Nested lists — A vs C', () => {
  it('C matches A (normalizing attribute order)', () => {
    const a = initWithSetContents(NESTED_LIST);
    const c = initWithInnerHtmlUpdate(NESTED_LIST);

    expect(normalizeAttrOrder(c.quill.root.innerHTML)).toEqual(
      normalizeAttrOrder(a.quill.root.innerHTML),
    );
    expect(c.quill.getContents().ops).toEqual(a.quill.getContents().ops);

    a.container.remove();
    c.container.remove();
  });
});
