import { BaseRenderer } from '../../core/base-renderer';

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Shared base for all HTML string renderers.
 *
 * Handles HTML-specific concerns:
 * - Text escaping
 * - String concatenation of children
 *
 * Subclasses provide their own `RendererConfig<string>` to control
 * how blocks and marks are rendered.
 */
export abstract class BaseHtmlRenderer extends BaseRenderer<string> {
  protected joinChildren(children: string[]): string {
    return children.join('');
  }

  protected renderText(text: string): string {
    return escapeHtml(text);
  }
}
