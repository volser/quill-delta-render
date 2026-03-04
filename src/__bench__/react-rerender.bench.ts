/**
 * Performance benchmarks: React re-render (reconciliation)
 *
 * Measures update performance when ops change, triggering React's
 * reconciliation against an already-mounted tree (jsdom).
 *
 * Run with:
 *   npx vitest bench src/__bench__/react-rerender.bench.ts
 *
 * @vitest-environment jsdom
 */

import { RenderDelta } from 'quill-delta-to-react';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { bench, describe } from 'vitest';
import type { Delta } from '../core/ast-types';
import { parseQuillDelta } from '../parse-quill-delta';
import { ReactRenderer } from '../renderers/react/react-renderer';
import { MEDIUM_FORMATTED, REALISTIC_DOC, SMALL_FORMATTED } from './bench-fixtures';

const reactRenderer = new ReactRenderer();

function OurRenderer({ delta }: { delta: Delta }) {
  const ast = parseQuillDelta(delta);
  return reactRenderer.render(ast);
}

function mountRoot(element: React.ReactElement): Root {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(element));
  return root;
}

/**
 * Tweak exactly 2 ops to simulate a small user edit:
 *  1. First op  — append " (edited)" to its text
 *  2. Last non-newline op — toggle the `bold` attribute
 */
function modifyDelta(delta: Delta): Delta {
  if (!delta.ops.length) {
    return delta;
  }
  const ops = [...delta.ops];
  const first = ops[0]!;
  if (typeof first.insert === 'string') {
    ops[0] = { ...first, insert: first.insert + ' (edited)' };
  }
  for (let i = ops.length - 1; i >= 0; i--) {
    if (typeof ops[i]?.insert === 'string' && ops[i]?.insert !== '\n') {
      ops[i] = {
        ...ops[i],
        attributes: {
          ...(ops[i]?.attributes ?? {}),
          bold: !ops[i]?.attributes?.bold,
        },
      };
      break;
    }
  }
  return { ops };
}

const SMALL_FORMATTED_V2 = modifyDelta(SMALL_FORMATTED);
const MEDIUM_FORMATTED_V2 = modifyDelta(MEDIUM_FORMATTED);
const REALISTIC_DOC_V2 = modifyDelta(REALISTIC_DOC);

const smallOurRoot = mountRoot(createElement(OurRenderer, { delta: SMALL_FORMATTED }));
const smallTheirRoot = mountRoot(createElement(RenderDelta, { ops: SMALL_FORMATTED.ops }));
const medOurRoot = mountRoot(createElement(OurRenderer, { delta: MEDIUM_FORMATTED }));
const medTheirRoot = mountRoot(createElement(RenderDelta, { ops: MEDIUM_FORMATTED.ops }));
const realOurRoot = mountRoot(createElement(OurRenderer, { delta: REALISTIC_DOC }));
const realTheirRoot = mountRoot(createElement(RenderDelta, { ops: REALISTIC_DOC.ops }));

let t1 = false;
let t2 = false;
let t3 = false;
let t4 = false;
let t5 = false;
let t6 = false;

describe('Re-render: formatted text (5 blocks)', () => {
  bench('ReactRenderer', () => {
    t1 = !t1;
    const delta = t1 ? SMALL_FORMATTED_V2 : SMALL_FORMATTED;
    flushSync(() => smallOurRoot.render(createElement(OurRenderer, { delta })));
  });

  bench('quill-delta-to-react', () => {
    t2 = !t2;
    const delta = t2 ? SMALL_FORMATTED_V2 : SMALL_FORMATTED;
    flushSync(() => smallTheirRoot.render(createElement(RenderDelta, { ops: delta.ops })));
  });
});

describe('Re-render: formatted text (50 blocks)', () => {
  bench('ReactRenderer', () => {
    t3 = !t3;
    const delta = t3 ? MEDIUM_FORMATTED_V2 : MEDIUM_FORMATTED;
    flushSync(() => medOurRoot.render(createElement(OurRenderer, { delta })));
  });

  bench('quill-delta-to-react', () => {
    t4 = !t4;
    const delta = t4 ? MEDIUM_FORMATTED_V2 : MEDIUM_FORMATTED;
    flushSync(() => medTheirRoot.render(createElement(RenderDelta, { ops: delta.ops })));
  });
});

describe('Re-render: realistic document', () => {
  bench('ReactRenderer', () => {
    t5 = !t5;
    const delta = t5 ? REALISTIC_DOC_V2 : REALISTIC_DOC;
    flushSync(() => realOurRoot.render(createElement(OurRenderer, { delta })));
  });

  bench('quill-delta-to-react', () => {
    t6 = !t6;
    const delta = t6 ? REALISTIC_DOC_V2 : REALISTIC_DOC;
    flushSync(() => realTheirRoot.render(createElement(RenderDelta, { ops: delta.ops })));
  });
});
