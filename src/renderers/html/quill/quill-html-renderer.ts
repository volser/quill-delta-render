import type { Delta } from '../../../core/ast-types';
import type { ParseQuillDeltaOptions } from '../../../parse-quill-delta';
import { parseQuillDelta } from '../../../parse-quill-delta';
import { BaseHtmlRenderer } from '../base-html-renderer';
import { buildQuillConfig } from './functions/build-quill-config';

/**
 * Renders an AST into Quill's native HTML format.
 *
 * Produces markup that exactly matches Quill editor's output, including:
 * - `ql-*` CSS classes for indentation, alignment, direction, fonts, and sizes
 * - `<br>` for empty blocks
 * - `spellcheck="false"` on code blocks
 * - `rel="noopener noreferrer"` on links
 * - `data-row` on table cells
 * - `data-list` and `.ql-ui` markers on list items
 * - Formula and video embed support
 *
 * For a configurable HTML renderer (with custom class prefix, inline styles,
 * hooks, etc.), use `SemanticHtmlRenderer` instead.
 *
 * Use `withBlock()` and `withMark()` to override specific handlers
 * without subclassing.
 *
 * @example
 * ```ts
 * const renderer = new QuillHtmlRenderer();
 * const html = renderer.renderDelta(delta);
 * ```
 */
export class QuillHtmlRenderer extends BaseHtmlRenderer {
  constructor() {
    super(buildQuillConfig());
  }

  /**
   * Convenience method: parses a Quill Delta and renders it to HTML
   * that exactly matches Quill editor output.
   *
   * Unlike `parseQuillDelta()` + `render()`, this disables paragraph
   * merging (`multiLineParagraph: false`) so each `\n` produces a
   * separate `<p>` — matching Quill's native behavior.
   *
   * @example
   * ```ts
   * const renderer = new QuillHtmlRenderer();
   * const html = renderer.renderDelta(delta);
   * ```
   */
  renderDelta(delta: Delta, options?: ParseQuillDeltaOptions): string {
    const ast = parseQuillDelta(delta, {
      ...options,
      blockMerger: { multiLineParagraph: false, ...options?.blockMerger },
    });
    return this.render(ast);
  }
}
