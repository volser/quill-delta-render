/**
 * Compatibility tests: SemanticHtmlRenderer vs ReactRenderer
 *
 * Verifies that both renderers produce identical HTML from the same
 * Quill Delta input when processed through the same parser pipeline.
 *
 * Both renderers share the same AST parsing and transformation pipeline
 * (listGrouper, tableGrouper, codeBlockGrouper, blockMerger). The only
 * difference should be the rendering output format.
 *
 * Known structural differences (tested separately at the bottom):
 *   - Empty blocks: Semantic renders `<br/>` inside empty blocks; React renders nothing
 *   - Code block containers: Semantic renders `<pre>`, React renders `<pre><code class="ql-syntax">`
 *   - Images: Semantic adds `ql-image` class and omits alt; React has no class but adds `alt=""`
 *   - Videos: Boolean attribute `allowfullscreen="true"` (Semantic) vs `allowfullscreen=""` (React)
 *   - Block layout attributes: Semantic adds `ql-indent-*`, `ql-align-*`, `ql-direction-*` classes;
 *     React does not resolve block attributes by default
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Delta, DeltaOp } from '../core/ast-types';
import { parseQuillDelta } from '../parse-quill-delta';
import { SemanticHtmlRenderer } from '../renderers/html/semantic/semantic-html-renderer';
import { ReactRenderer } from '../renderers/react/react-renderer';

// ─── Shared rendering pipeline ──────────────────────────────────────────────

/**
 * Both renderers use the same AST from `parseQuillDelta` which includes
 * listGrouper, tableGrouper, codeBlockGrouper, and blockMerger.
 */

const semanticRenderer = new SemanticHtmlRenderer();
const reactRenderer = new ReactRenderer();

function renderSemantic(delta: Delta): string {
  const ast = parseQuillDelta(delta);
  return semanticRenderer.render(ast);
}

function renderReact(delta: Delta): string {
  const ast = parseQuillDelta(delta);
  const element = reactRenderer.render(ast);
  return renderToStaticMarkup(createElement('div', null, element));
}

// ─── HTML normalization ─────────────────────────────────────────────────────

/**
 * Strip the outer `<div>...</div>` wrapper that the React test helper adds
 * via `renderToStaticMarkup(createElement('div', null, element))`.
 */
function stripReactWrapper(html: string): string {
  const match = html.match(/^<div>(.*)<\/div>$/s);
  return match ? match[1]! : html;
}

/**
 * Normalize trivial HTML differences between the two renderers:
 * - `<br>` → `<br/>` (ensure consistent self-closing)
 * - Remove space before `/>` in self-closing tags
 * - Lowercase attribute names (React may emit camelCase: `frameBorder` → `frameborder`)
 * - Normalize boolean attributes: `allowfullscreen=""` → `allowfullscreen="true"`
 * - Sort class names alphabetically within each `class="..."`
 * - Sort attributes alphabetically within each opening tag
 */
function normalizeHtml(html: string): string {
  return (
    html
      .replace(/<br\s*\/?>/g, '<br/>')
      .replace(/\s+\/>/g, '/>')
      // Lowercase attribute names (handles React camelCase → HTML lowercase)
      .replace(/\s([a-zA-Z][a-zA-Z-]*)=/g, (_match, attr: string) => ` ${attr.toLowerCase()}=`)
      .replace(/allowfullscreen=""/g, 'allowfullscreen="true"')
      .replace(/class="([^"]*)"/g, (_match, classes: string) => {
        const sorted = classes.split(/\s+/).filter(Boolean).sort().join(' ');
        return `class="${sorted}"`;
      })
      .replace(/<(\w+)((?:\s+[\w-]+="[^"]*")+)(\/?)>/g, (_match, tag, attrs: string, slash) => {
        const attrList = attrs
          .trim()
          .match(/[\w-]+="[^"]*"/g)!
          .sort();
        return `<${tag} ${attrList.join(' ')}${slash}>`;
      })
      .trim()
  );
}

// ─── Assertion helpers ──────────────────────────────────────────────────────

function assertSameHtml(delta: Delta): void {
  const semanticHtml = normalizeHtml(renderSemantic(delta));
  const reactHtml = normalizeHtml(stripReactWrapper(renderReact(delta)));
  expect(reactHtml).toBe(semanticHtml);
}

/** Shorthand to build a Delta from ops. */
function d(...ops: DeltaOp[]): Delta {
  return { ops };
}

// ═════════════════════════════════════════════════════════════════════════════
// Tests for features where both renderers SHOULD produce identical HTML
// ═════════════════════════════════════════════════════════════════════════════

// ─── Plain text & paragraphs ────────────────────────────────────────────────

describe('Compat: plain text & paragraphs', () => {
  it('single paragraph', () => {
    assertSameHtml(d({ insert: 'Hello world\n' }));
  });

  it('multiple paragraphs', () => {
    assertSameHtml(d({ insert: 'First paragraph\n' }, { insert: 'Second paragraph\n' }));
  });

  it('paragraph with special characters', () => {
    assertSameHtml(d({ insert: 'a < b & c > d "quoted"\n' }));
  });

  it('multiple lines in single insert (blockMerger joins with <br/>)', () => {
    assertSameHtml(d({ insert: 'Line 1\nLine 2\nLine 3\n' }));
  });
});

// ─── Headers ────────────────────────────────────────────────────────────────

describe('Compat: headers', () => {
  it('h1', () => {
    assertSameHtml(d({ insert: 'Title' }, { insert: '\n', attributes: { header: 1 } }));
  });

  it('h2', () => {
    assertSameHtml(d({ insert: 'Subtitle' }, { insert: '\n', attributes: { header: 2 } }));
  });

  it('h3 through h6', () => {
    for (let level = 3; level <= 6; level++) {
      assertSameHtml(
        d({ insert: `Heading ${level}` }, { insert: '\n', attributes: { header: level } }),
      );
    }
  });

  it('header with inline formatting', () => {
    assertSameHtml(
      d(
        { insert: 'Plain and ' },
        { insert: 'bold header', attributes: { bold: true } },
        { insert: '\n', attributes: { header: 1 } },
      ),
    );
  });
});

// ─── Blockquotes ────────────────────────────────────────────────────────────

describe('Compat: blockquotes', () => {
  it('simple blockquote', () => {
    assertSameHtml(d({ insert: 'A quote' }, { insert: '\n', attributes: { blockquote: true } }));
  });

  it('blockquote with formatting', () => {
    assertSameHtml(
      d(
        { insert: 'A ' },
        { insert: 'bold', attributes: { bold: true } },
        { insert: ' quote' },
        { insert: '\n', attributes: { blockquote: true } },
      ),
    );
  });
});

// ─── Inline marks ───────────────────────────────────────────────────────────

describe('Compat: inline marks', () => {
  it('bold', () => {
    assertSameHtml(d({ insert: 'bold', attributes: { bold: true } }, { insert: '\n' }));
  });

  it('italic', () => {
    assertSameHtml(d({ insert: 'italic', attributes: { italic: true } }, { insert: '\n' }));
  });

  it('underline', () => {
    assertSameHtml(d({ insert: 'underline', attributes: { underline: true } }, { insert: '\n' }));
  });

  it('strikethrough', () => {
    assertSameHtml(d({ insert: 'strike', attributes: { strike: true } }, { insert: '\n' }));
  });

  it('inline code', () => {
    assertSameHtml(d({ insert: 'code', attributes: { code: true } }, { insert: '\n' }));
  });

  it('subscript', () => {
    assertSameHtml(d({ insert: 'sub', attributes: { script: 'sub' } }, { insert: '\n' }));
  });

  it('superscript', () => {
    assertSameHtml(d({ insert: 'sup', attributes: { script: 'super' } }, { insert: '\n' }));
  });

  it('link', () => {
    assertSameHtml(
      d({ insert: 'click', attributes: { link: 'https://example.com' } }, { insert: '\n' }),
    );
  });

  it('bold + italic combined', () => {
    assertSameHtml(
      d({ insert: 'both', attributes: { bold: true, italic: true } }, { insert: '\n' }),
    );
  });

  it('strike + underline combined', () => {
    assertSameHtml(
      d({ insert: 'combo', attributes: { strike: true, underline: true } }, { insert: '\n' }),
    );
  });

  it('bold + link combined', () => {
    assertSameHtml(
      d(
        { insert: 'bold link', attributes: { bold: true, link: 'https://example.com' } },
        { insert: '\n' },
      ),
    );
  });

  it('bold + code combined', () => {
    assertSameHtml(
      d({ insert: 'bold code', attributes: { code: true, bold: true } }, { insert: '\n' }),
    );
  });

  it('link + italic + code combined', () => {
    assertSameHtml(
      d(
        { insert: 'Top', attributes: { italic: true, link: '#top', code: true } },
        { insert: '\n' },
      ),
    );
  });
});

// ─── Inline attributors (color, background, font, size) ─────────────────────

describe('Compat: inline attributors', () => {
  it('color', () => {
    assertSameHtml(d({ insert: 'red', attributes: { color: '#e60000' } }, { insert: '\n' }));
  });

  it('background', () => {
    assertSameHtml(
      d({ insert: 'highlight', attributes: { background: '#ffebcc' } }, { insert: '\n' }),
    );
  });

  it('font class', () => {
    assertSameHtml(d({ insert: 'mono', attributes: { font: 'monospace' } }, { insert: '\n' }));
  });

  it('size class', () => {
    assertSameHtml(d({ insert: 'big', attributes: { size: 'large' } }, { insert: '\n' }));
  });

  it('color on bold text', () => {
    assertSameHtml(
      d({ insert: 'styled', attributes: { color: '#e60000', bold: true } }, { insert: '\n' }),
    );
  });

  it('background on italic text', () => {
    assertSameHtml(
      d(
        { insert: 'styled', attributes: { background: '#ffebcc', italic: true } },
        { insert: '\n' },
      ),
    );
  });
});

// ─── Lists ──────────────────────────────────────────────────────────────────

describe('Compat: lists', () => {
  it('bullet list', () => {
    assertSameHtml(
      d(
        { insert: 'Item 1' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'Item 2' },
        { insert: '\n', attributes: { list: 'bullet' } },
      ),
    );
  });

  it('ordered list', () => {
    assertSameHtml(
      d(
        { insert: 'First' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'Second' },
        { insert: '\n', attributes: { list: 'ordered' } },
      ),
    );
  });

  it('checked list', () => {
    assertSameHtml(d({ insert: 'Done' }, { insert: '\n', attributes: { list: 'checked' } }));
  });

  it('unchecked list', () => {
    assertSameHtml(d({ insert: 'Not done' }, { insert: '\n', attributes: { list: 'unchecked' } }));
  });

  it('mixed checked/unchecked list', () => {
    assertSameHtml(
      d(
        { insert: 'Done' },
        { insert: '\n', attributes: { list: 'checked' } },
        { insert: 'Not done' },
        { insert: '\n', attributes: { list: 'unchecked' } },
      ),
    );
  });

  it('nested bullet list', () => {
    assertSameHtml(
      d(
        { insert: 'Parent' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'Child' },
        { insert: '\n', attributes: { list: 'bullet', indent: 1 } },
      ),
    );
  });

  it('nested ordered list', () => {
    assertSameHtml(
      d(
        { insert: 'Parent' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'Child' },
        { insert: '\n', attributes: { list: 'ordered', indent: 1 } },
      ),
    );
  });

  it('deeply nested list', () => {
    assertSameHtml(
      d(
        { insert: 'L0' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'L1' },
        { insert: '\n', attributes: { list: 'bullet', indent: 1 } },
        { insert: 'L2' },
        { insert: '\n', attributes: { list: 'bullet', indent: 2 } },
        { insert: 'Back to L0' },
        { insert: '\n', attributes: { list: 'bullet' } },
      ),
    );
  });

  it('mixed list types (ordered then bullet)', () => {
    assertSameHtml(
      d(
        { insert: 'ordered' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'bullet' },
        { insert: '\n', attributes: { list: 'bullet' } },
      ),
    );
  });

  it('mixed list types (ordered with bullet child)', () => {
    assertSameHtml(
      d(
        { insert: 'ordered root' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'bullet child' },
        { insert: '\n', attributes: { list: 'bullet', indent: 1 } },
      ),
    );
  });

  it('list item with formatted text', () => {
    assertSameHtml(
      d(
        { insert: 'Bold item', attributes: { bold: true } },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'Link item', attributes: { link: 'https://example.com' } },
        { insert: '\n', attributes: { list: 'ordered' } },
      ),
    );
  });
});

// ─── Tables ─────────────────────────────────────────────────────────────────

describe('Compat: tables', () => {
  it('single-cell table', () => {
    assertSameHtml(d({ insert: 'cell' }, { insert: '\n', attributes: { table: 'row-1' } }));
  });

  it('single row with two cells', () => {
    assertSameHtml(
      d(
        { insert: 'A' },
        { insert: '\n', attributes: { table: 'r1' } },
        { insert: 'B' },
        { insert: '\n', attributes: { table: 'r1' } },
      ),
    );
  });

  it('2x2 table', () => {
    assertSameHtml(
      d(
        { insert: 'A1' },
        { insert: '\n', attributes: { table: 'r1' } },
        { insert: 'A2' },
        { insert: '\n', attributes: { table: 'r1' } },
        { insert: 'B1' },
        { insert: '\n', attributes: { table: 'r2' } },
        { insert: 'B2' },
        { insert: '\n', attributes: { table: 'r2' } },
      ),
    );
  });

  it('table with formatted content', () => {
    assertSameHtml(
      d(
        { insert: 'Bold', attributes: { bold: true } },
        { insert: '\n', attributes: { table: 'r1' } },
        { insert: 'Normal' },
        { insert: '\n', attributes: { table: 'r1' } },
      ),
    );
  });

  it('table surrounded by paragraphs', () => {
    assertSameHtml(
      d(
        { insert: 'Before\n' },
        { insert: 'Cell A' },
        { insert: '\n', attributes: { table: 'r1' } },
        { insert: 'Cell B' },
        { insert: '\n', attributes: { table: 'r1' } },
        { insert: 'After\n' },
      ),
    );
  });
});

// ─── Formulas ───────────────────────────────────────────────────────────────

describe('Compat: formulas', () => {
  it('simple formula', () => {
    assertSameHtml(d({ insert: { formula: 'E=mc^2' } }, { insert: '\n' }));
  });

  it('formula with surrounding text', () => {
    assertSameHtml(
      d({ insert: 'The equation ' }, { insert: { formula: 'x=data' } }, { insert: ' is key.\n' }),
    );
  });
});

// ─── Complex mixed content ──────────────────────────────────────────────────

describe('Compat: complex mixed content', () => {
  it('paragraph + header + list + blockquote', () => {
    assertSameHtml(
      d(
        { insert: 'Normal text ' },
        { insert: 'bold', attributes: { bold: true } },
        { insert: ' and ' },
        { insert: 'italic', attributes: { italic: true } },
        { insert: '\n' },
        { insert: 'My Header' },
        { insert: '\n', attributes: { header: 2 } },
        { insert: 'Item A' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'Item B' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'A famous quote' },
        { insert: '\n', attributes: { blockquote: true } },
        { insert: 'Final paragraph\n' },
      ),
    );
  });

  it('paragraph with link + color', () => {
    assertSameHtml(
      d(
        { insert: 'Visit ' },
        { insert: 'this site', attributes: { link: 'https://example.com', bold: true } },
        { insert: ' for ' },
        { insert: 'red info', attributes: { color: '#e60000' } },
        { insert: '\n' },
      ),
    );
  });

  it('header followed by ordered list', () => {
    assertSameHtml(
      d(
        { insert: 'Steps' },
        { insert: '\n', attributes: { header: 2 } },
        { insert: 'Step one' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'Step two' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'Step three' },
        { insert: '\n', attributes: { list: 'ordered' } },
      ),
    );
  });

  it('list with inline formatting and colors', () => {
    assertSameHtml(
      d(
        { insert: 'Regular item' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'Bold', attributes: { bold: true } },
        { insert: ' and ' },
        { insert: 'italic', attributes: { italic: true } },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'Colored', attributes: { color: '#e60000' } },
        { insert: ' item' },
        { insert: '\n', attributes: { list: 'bullet' } },
      ),
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Known structural differences between renderers
//
// These tests document and verify the expected divergences. Each test
// renders the same delta through both pipelines and asserts the specific
// difference, so we'll catch if either renderer changes behavior.
// ═════════════════════════════════════════════════════════════════════════════

describe('Known differences: empty blocks', () => {
  // Semantic renders <br/> inside empty blocks; React renders nothing.

  it('empty paragraph differs', () => {
    const delta = d({ insert: '\n' });
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    expect(semantic).toBe('<p><br/></p>');
    expect(react).toBe('<p></p>');
    expect(semantic).not.toBe(react);
  });

  it('empty header differs', () => {
    const delta = d({ insert: '\n', attributes: { header: 1 } });
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    expect(semantic).toBe('<h1><br/></h1>');
    expect(react).toBe('<h1></h1>');
    expect(semantic).not.toBe(react);
  });

  it('empty list item differs', () => {
    const delta = d({ insert: '\n', attributes: { list: 'bullet' } });
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    expect(semantic).toContain('<br/>');
    expect(react).not.toContain('<br/>');
  });
});

describe('Known differences: code block containers', () => {
  // Semantic: <pre>content</pre>
  // React: <pre><code class="ql-syntax">content</code></pre>

  it('single code block has different structure', () => {
    const delta = d(
      { insert: 'const x = 1;' },
      { insert: '\n', attributes: { 'code-block': true } },
    );
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    // Semantic renders as <pre> directly
    expect(semantic).toBe('<pre>const x = 1;</pre>');
    // React wraps in <pre><code class="ql-syntax">
    expect(react).toBe('<pre><code class="ql-syntax">const x = 1;</code></pre>');
    expect(semantic).not.toBe(react);
  });

  it('multi-line code block has different structure', () => {
    const delta = d(
      { insert: 'line 1' },
      { insert: '\n', attributes: { 'code-block': true } },
      { insert: 'line 2' },
      { insert: '\n', attributes: { 'code-block': true } },
    );
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    expect(semantic).toContain('line 1\nline 2');
    expect(react).toContain('line 1\nline 2');
    // Both have single <pre> but React has the <code> wrapper
    expect(react).toContain('<code');
    expect(semantic).not.toContain('<code');
  });

  it('code block with language has different class placement', () => {
    const delta = d(
      { insert: 'const x = 1;' },
      { insert: '\n', attributes: { 'code-block': 'javascript' } },
    );
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    // Semantic: class and data-language on <pre>
    expect(semantic).toContain('<pre');
    expect(semantic).toContain('language-javascript');
    expect(semantic).toContain('data-language="javascript"');
    // React: class on <code> inside <pre>
    expect(react).toContain('<code class="language-javascript ql-syntax"');
  });
});

describe('Known differences: images', () => {
  // Semantic (defaults): adds ql-image class, no alt attribute
  // React: no ql-image class, adds alt=""

  it('image attributes differ', () => {
    const delta = d({ insert: { image: 'https://example.com/img.png' } }, { insert: '\n' });
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    // Semantic has ql-image class, no alt
    expect(semantic).toContain('class="ql-image"');
    expect(semantic).not.toContain('alt=');
    // React has alt="", no ql-image class
    expect(react).toContain('alt=""');
    expect(react).not.toContain('ql-image');
  });
});

describe('Known differences: videos', () => {
  // Semantic: frameborder="0" allowfullscreen="true"  (lowercase attrs, explicit true)
  // React:    frameBorder="0" allowFullScreen=""       (camelCase attrs, empty boolean)
  // The trailing \n also produces an empty paragraph which differs (empty block issue).

  it('video iframe — both renderers produce equivalent iframe element', () => {
    const delta = d({ insert: { video: 'https://youtube.com/embed/abc' } }, { insert: '\n' });
    const rawSemantic = renderSemantic(delta);
    const rawReact = stripReactWrapper(renderReact(delta));

    // Both contain iframe with ql-video class
    expect(rawSemantic).toContain('class="ql-video"');
    expect(rawReact).toContain('class="ql-video"');

    // Both contain the src
    expect(rawSemantic).toContain('src="https://youtube.com/embed/abc"');
    expect(rawReact).toContain('src="https://youtube.com/embed/abc"');
  });

  it('video iframe — attribute casing and boolean style differ before normalization', () => {
    const delta = d({ insert: { video: 'https://youtube.com/embed/abc' } }, { insert: '\n' });
    const rawSemantic = renderSemantic(delta);
    const rawReact = stripReactWrapper(renderReact(delta));

    // Semantic uses lowercase attributes
    expect(rawSemantic).toContain('frameborder="0"');
    expect(rawSemantic).toContain('allowfullscreen="true"');

    // React uses camelCase attributes and empty-string boolean
    expect(rawReact).toContain('frameBorder="0"');
    expect(rawReact).toContain('allowFullScreen=""');
  });

  it('video iframe — normalization brings iframe attrs to parity (empty paragraph still differs)', () => {
    const delta = d({ insert: { video: 'https://youtube.com/embed/abc' } }, { insert: '\n' });
    const normalizedSemantic = normalizeHtml(renderSemantic(delta));
    const normalizedReact = normalizeHtml(stripReactWrapper(renderReact(delta)));

    // Extract just the iframe portion (before the trailing paragraph)
    const iframeSemantic = normalizedSemantic.match(/<iframe[^>]*><\/iframe>/)?.[0];
    const iframeReact = normalizedReact.match(/<iframe[^>]*><\/iframe>/)?.[0];

    expect(iframeReact).toBe(iframeSemantic);

    // Full HTML still differs because of the empty trailing paragraph
    expect(normalizedReact).not.toBe(normalizedSemantic);
  });
});

describe('Known differences: block layout attributes', () => {
  // Semantic renderer adds ql-indent-*, ql-align-*, ql-direction-* classes.
  // React renderer does not resolve block attributes by default.

  it('indent class only in semantic', () => {
    const delta = d({ insert: 'indented' }, { insert: '\n', attributes: { indent: 2 } });
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    expect(semantic).toContain('ql-indent-2');
    expect(react).not.toContain('ql-indent');
  });

  it('align class only in semantic', () => {
    const delta = d({ insert: 'centered' }, { insert: '\n', attributes: { align: 'center' } });
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    expect(semantic).toContain('ql-align-center');
    expect(react).not.toContain('ql-align');
  });

  it('direction class only in semantic', () => {
    const delta = d({ insert: 'rtl' }, { insert: '\n', attributes: { direction: 'rtl' } });
    const semantic = normalizeHtml(renderSemantic(delta));
    const react = normalizeHtml(stripReactWrapper(renderReact(delta)));

    expect(semantic).toContain('ql-direction-rtl');
    expect(react).not.toContain('ql-direction');
  });
});
