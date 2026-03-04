/**
 * Performance benchmarks: ReactRenderer vs quill-delta-to-react
 *
 * Both produce HTML via renderToStaticMarkup() for an apples-to-apples
 * comparison (quill-delta-to-react uses hooks and can only be executed
 * through React's rendering pipeline).
 *
 * Run with:
 *   npx vitest bench src/__bench__/react-vs-quill-delta-to-react.bench.ts
 */

import { bench, describe } from 'vitest';
import {
  LARGE_FORMATTED,
  LARGE_PLAIN,
  MEDIUM_FORMATTED,
  MEDIUM_PLAIN,
  REALISTIC_DOC,
  SMALL_FORMATTED,
  SMALL_PLAIN,
} from './bench-fixtures';
import { renderQuillDeltaToReactToHtml, renderReactToHtml } from './bench-render-helpers';

describe('Plain text paragraphs', () => {
  bench('ReactRenderer - 5 paragraphs', () => {
    renderReactToHtml(SMALL_PLAIN);
  });
  bench('quill-delta-to-react - 5 paragraphs', () => {
    renderQuillDeltaToReactToHtml(SMALL_PLAIN);
  });

  bench('ReactRenderer - 50 paragraphs', () => {
    renderReactToHtml(MEDIUM_PLAIN);
  });
  bench('quill-delta-to-react - 50 paragraphs', () => {
    renderQuillDeltaToReactToHtml(MEDIUM_PLAIN);
  });

  bench('ReactRenderer - 500 paragraphs', () => {
    renderReactToHtml(LARGE_PLAIN);
  });
  bench('quill-delta-to-react - 500 paragraphs', () => {
    renderQuillDeltaToReactToHtml(LARGE_PLAIN);
  });
});

describe('Formatted text (marks, colors, links)', () => {
  bench('ReactRenderer - 5 blocks', () => {
    renderReactToHtml(SMALL_FORMATTED);
  });
  bench('quill-delta-to-react - 5 blocks', () => {
    renderQuillDeltaToReactToHtml(SMALL_FORMATTED);
  });

  bench('ReactRenderer - 50 blocks', () => {
    renderReactToHtml(MEDIUM_FORMATTED);
  });
  bench('quill-delta-to-react - 50 blocks', () => {
    renderQuillDeltaToReactToHtml(MEDIUM_FORMATTED);
  });

  bench('ReactRenderer - 200 blocks', () => {
    renderReactToHtml(LARGE_FORMATTED);
  });
  bench('quill-delta-to-react - 200 blocks', () => {
    renderQuillDeltaToReactToHtml(LARGE_FORMATTED);
  });
});

describe('Realistic document (mixed content)', () => {
  bench('ReactRenderer', () => {
    renderReactToHtml(REALISTIC_DOC);
  });
  bench('quill-delta-to-react', () => {
    renderQuillDeltaToReactToHtml(REALISTIC_DOC);
  });
});
