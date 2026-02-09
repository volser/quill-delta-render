/**
 * Default mark nesting priorities.
 * Higher value = wraps outer (applied first in nesting order).
 *
 * The element mark order matches quill-delta-to-html:
 *   bold(outer) > italic > strike > underline > code(inner)
 *
 * Example with priorities: link(100) > color(40) > bold(30)
 * Result: `<a><span style="color:red"><strong>text</strong></span></a>`
 */
export const DEFAULT_MARK_PRIORITIES: Record<string, number> = {
  link: 100,
  background: 50,
  color: 40,
  bold: 30,
  italic: 25,
  strike: 20,
  underline: 15,
  code: 10,
  script: 5,
};
