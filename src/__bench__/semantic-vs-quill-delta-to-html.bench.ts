/**
 * Performance benchmarks: SemanticHtmlRenderer vs ReactRenderer vs quill-delta-to-html
 *
 * Run with:
 *   npx vitest bench
 *
 * Each benchmark converts the same Quill Delta to HTML using all three
 * renderers, measuring throughput (ops/sec) and relative performance.
 */

import { bench, describe } from 'vitest';
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
import {
  renderQuillDeltaToHtml,
  renderReactElements,
  renderReactToHtml,
  renderSemantic,
} from './bench-render-helpers';

// ─── Benchmarks ─────────────────────────────────────────────────────────────

describe('Plain text paragraphs', () => {
  bench('SemanticHtmlRenderer — 5 paragraphs', () => {
    renderSemantic(SMALL_PLAIN);
  });
  bench('ReactRenderer — 5 paragraphs', () => {
    renderReactElements(SMALL_PLAIN);
  });
  bench('ReactRenderer → HTML — 5 paragraphs', () => {
    renderReactToHtml(SMALL_PLAIN);
  });
  bench('quill-delta-to-html — 5 paragraphs', () => {
    renderQuillDeltaToHtml(SMALL_PLAIN);
  });

  bench('SemanticHtmlRenderer — 50 paragraphs', () => {
    renderSemantic(MEDIUM_PLAIN);
  });
  bench('ReactRenderer — 50 paragraphs', () => {
    renderReactElements(MEDIUM_PLAIN);
  });
  bench('ReactRenderer → HTML — 50 paragraphs', () => {
    renderReactToHtml(MEDIUM_PLAIN);
  });
  bench('quill-delta-to-html — 50 paragraphs', () => {
    renderQuillDeltaToHtml(MEDIUM_PLAIN);
  });

  bench('SemanticHtmlRenderer — 500 paragraphs', () => {
    renderSemantic(LARGE_PLAIN);
  });
  bench('ReactRenderer — 500 paragraphs', () => {
    renderReactElements(LARGE_PLAIN);
  });
  bench('ReactRenderer → HTML — 500 paragraphs', () => {
    renderReactToHtml(LARGE_PLAIN);
  });
  bench('quill-delta-to-html — 500 paragraphs', () => {
    renderQuillDeltaToHtml(LARGE_PLAIN);
  });
});

describe('Formatted text (bold, italic, links, colors)', () => {
  bench('SemanticHtmlRenderer — 5 blocks', () => {
    renderSemantic(SMALL_FORMATTED);
  });
  bench('ReactRenderer — 5 blocks', () => {
    renderReactElements(SMALL_FORMATTED);
  });
  bench('ReactRenderer → HTML — 5 blocks', () => {
    renderReactToHtml(SMALL_FORMATTED);
  });
  bench('quill-delta-to-html — 5 blocks', () => {
    renderQuillDeltaToHtml(SMALL_FORMATTED);
  });

  bench('SemanticHtmlRenderer — 50 blocks', () => {
    renderSemantic(MEDIUM_FORMATTED);
  });
  bench('ReactRenderer — 50 blocks', () => {
    renderReactElements(MEDIUM_FORMATTED);
  });
  bench('ReactRenderer → HTML — 50 blocks', () => {
    renderReactToHtml(MEDIUM_FORMATTED);
  });
  bench('quill-delta-to-html — 50 blocks', () => {
    renderQuillDeltaToHtml(MEDIUM_FORMATTED);
  });

  bench('SemanticHtmlRenderer — 200 blocks', () => {
    renderSemantic(LARGE_FORMATTED);
  });
  bench('ReactRenderer — 200 blocks', () => {
    renderReactElements(LARGE_FORMATTED);
  });
  bench('ReactRenderer → HTML — 200 blocks', () => {
    renderReactToHtml(LARGE_FORMATTED);
  });
  bench('quill-delta-to-html — 200 blocks', () => {
    renderQuillDeltaToHtml(LARGE_FORMATTED);
  });
});

describe('Nested lists (5 levels × 4 items)', () => {
  bench('SemanticHtmlRenderer', () => {
    renderSemantic(NESTED_LIST);
  });
  bench('ReactRenderer', () => {
    renderReactElements(NESTED_LIST);
  });
  bench('ReactRenderer → HTML', () => {
    renderReactToHtml(NESTED_LIST);
  });
  bench('quill-delta-to-html', () => {
    renderQuillDeltaToHtml(NESTED_LIST);
  });
});

describe('Headers with body text', () => {
  bench('SemanticHtmlRenderer', () => {
    renderSemantic(HEADERS_DOC);
  });
  bench('ReactRenderer', () => {
    renderReactElements(HEADERS_DOC);
  });
  bench('ReactRenderer → HTML', () => {
    renderReactToHtml(HEADERS_DOC);
  });
  bench('quill-delta-to-html', () => {
    renderQuillDeltaToHtml(HEADERS_DOC);
  });
});

describe('Code blocks (5 blocks × 10 lines)', () => {
  bench('SemanticHtmlRenderer', () => {
    renderSemantic(CODE_BLOCKS);
  });
  bench('ReactRenderer', () => {
    renderReactElements(CODE_BLOCKS);
  });
  bench('ReactRenderer → HTML', () => {
    renderReactToHtml(CODE_BLOCKS);
  });
  bench('quill-delta-to-html', () => {
    renderQuillDeltaToHtml(CODE_BLOCKS);
  });
});

describe('Embeds (20 images)', () => {
  bench('SemanticHtmlRenderer', () => {
    renderSemantic(EMBEDS_DOC);
  });
  bench('ReactRenderer', () => {
    renderReactElements(EMBEDS_DOC);
  });
  bench('ReactRenderer → HTML', () => {
    renderReactToHtml(EMBEDS_DOC);
  });
  bench('quill-delta-to-html', () => {
    renderQuillDeltaToHtml(EMBEDS_DOC);
  });
});

describe('Tables (10 rows × 4 cols)', () => {
  bench('SemanticHtmlRenderer', () => {
    renderSemantic(TABLE_DOC);
  });
  bench('ReactRenderer', () => {
    renderReactElements(TABLE_DOC);
  });
  bench('ReactRenderer → HTML', () => {
    renderReactToHtml(TABLE_DOC);
  });
  bench('quill-delta-to-html', () => {
    renderQuillDeltaToHtml(TABLE_DOC);
  });
});

describe('Realistic document (mixed content)', () => {
  bench('SemanticHtmlRenderer', () => {
    renderSemantic(REALISTIC_DOC);
  });
  bench('ReactRenderer', () => {
    renderReactElements(REALISTIC_DOC);
  });
  bench('ReactRenderer → HTML', () => {
    renderReactToHtml(REALISTIC_DOC);
  });
  bench('quill-delta-to-html', () => {
    renderQuillDeltaToHtml(REALISTIC_DOC);
  });
});
