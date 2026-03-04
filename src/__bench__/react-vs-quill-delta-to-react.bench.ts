/**
 * Performance benchmarks: ReactRenderer vs quill-delta-to-react
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
import {
  renderQuillDeltaToReactToHtml,
  renderReactElements,
  renderReactToHtml,
} from './bench-render-helpers';

describe('Plain text paragraphs', () => {
  bench('ReactRenderer elements - 5 paragraphs', () => {
    renderReactElements(SMALL_PLAIN);
  });
  bench('ReactRenderer -> HTML - 5 paragraphs', () => {
    renderReactToHtml(SMALL_PLAIN);
  });
  bench('quill-delta-to-react -> HTML - 5 paragraphs', () => {
    renderQuillDeltaToReactToHtml(SMALL_PLAIN);
  });

  bench('ReactRenderer elements - 50 paragraphs', () => {
    renderReactElements(MEDIUM_PLAIN);
  });
  bench('ReactRenderer -> HTML - 50 paragraphs', () => {
    renderReactToHtml(MEDIUM_PLAIN);
  });
  bench('quill-delta-to-react -> HTML - 50 paragraphs', () => {
    renderQuillDeltaToReactToHtml(MEDIUM_PLAIN);
  });

  bench('ReactRenderer elements - 500 paragraphs', () => {
    renderReactElements(LARGE_PLAIN);
  });
  bench('ReactRenderer -> HTML - 500 paragraphs', () => {
    renderReactToHtml(LARGE_PLAIN);
  });
  bench('quill-delta-to-react -> HTML - 500 paragraphs', () => {
    renderQuillDeltaToReactToHtml(LARGE_PLAIN);
  });
});

describe('Formatted text (marks, colors, links)', () => {
  bench('ReactRenderer elements - 5 blocks', () => {
    renderReactElements(SMALL_FORMATTED);
  });
  bench('ReactRenderer -> HTML - 5 blocks', () => {
    renderReactToHtml(SMALL_FORMATTED);
  });
  bench('quill-delta-to-react -> HTML - 5 blocks', () => {
    renderQuillDeltaToReactToHtml(SMALL_FORMATTED);
  });

  bench('ReactRenderer elements - 50 blocks', () => {
    renderReactElements(MEDIUM_FORMATTED);
  });
  bench('ReactRenderer -> HTML - 50 blocks', () => {
    renderReactToHtml(MEDIUM_FORMATTED);
  });
  bench('quill-delta-to-react -> HTML - 50 blocks', () => {
    renderQuillDeltaToReactToHtml(MEDIUM_FORMATTED);
  });

  bench('ReactRenderer elements - 200 blocks', () => {
    renderReactElements(LARGE_FORMATTED);
  });
  bench('ReactRenderer -> HTML - 200 blocks', () => {
    renderReactToHtml(LARGE_FORMATTED);
  });
  bench('quill-delta-to-react -> HTML - 200 blocks', () => {
    renderQuillDeltaToReactToHtml(LARGE_FORMATTED);
  });
});

describe('Realistic document (mixed content)', () => {
  bench('ReactRenderer elements', () => {
    renderReactElements(REALISTIC_DOC);
  });
  bench('ReactRenderer -> HTML', () => {
    renderReactToHtml(REALISTIC_DOC);
  });
  bench('quill-delta-to-react -> HTML', () => {
    renderQuillDeltaToReactToHtml(REALISTIC_DOC);
  });
});
