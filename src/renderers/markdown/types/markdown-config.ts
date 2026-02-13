import type { TNode } from '../../../core/ast-types';

/**
 * Callback to render a custom embed node to Markdown (or extended format).
 * Receives the embed node (`node.type` is the embed key, e.g. `'myEmbed'`;
 * `node.data` is the embed payload). Return a string to emit, or `undefined`
 * to fall back to attribute-based rendering or empty.
 */
export type EmbedHandler = (node: TNode) => string | undefined;

/**
 * Callback to provide only attributes for an embed. The renderer builds the
 * tag (HTML or bracket) from these attributes. Use for a simple path when
 * you don't need full control. Ignored if {@link EmbedHandler} returns a string.
 */
export type EmbedAttributesHandler = (node: TNode) => Record<string, string> | undefined;

/**
 * Configuration options for the {@link MarkdownRenderer}.
 *
 * All options are optional and have sensible defaults matching
 * the output of the existing `convertDeltaToMarkdown()` function.
 */
export interface MarkdownConfig {
  /**
   * Character used for unordered (bullet) list items.
   * @default '*'
   */
  bulletChar?: string;

  /**
   * Padding after the bullet character.
   * @default '   ' (3 spaces — matches existing output)
   */
  bulletPadding?: string;

  /**
   * Indentation string for nested list levels.
   * @default '    ' (4 spaces)
   */
  indentString?: string;

  /**
   * String used for horizontal rules (thematic breaks).
   * @default '* * *'
   */
  hrString?: string;

  /**
   * Characters used for fenced code blocks.
   * @default '```'
   */
  fenceChar?: string;

  /**
   * Full override for custom embed nodes. Return the string to emit, or
   * `undefined` to fall back to attribute-based rendering (if configured) or empty.
   */
  embedHandler?: EmbedHandler;

  /**
   * Simple path: return only attributes for the embed; the renderer builds
   * a self-closing tag (HTML &lt;embed /&gt; or bracket [EMBED ...]). Used when no {@link embedHandler} result.
   */
  embedAttributesHandler?: EmbedAttributesHandler;
}

/**
 * Fully resolved configuration with all defaults applied.
 * @internal
 */
export interface ResolvedMarkdownConfig {
  bulletChar: string;
  bulletPadding: string;
  indentString: string;
  hrString: string;
  fenceChar: string;
  embedHandler?: EmbedHandler;
  embedAttributesHandler?: EmbedAttributesHandler;
}
