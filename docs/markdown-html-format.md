# HTML Markdown Format

HTML markdown is standard Markdown extended with **inline HTML** for formats that have no native Markdown syntax. Use it when your output is rendered by a processor that allows raw HTML (e.g. GitHub Flavored Markdown, CommonMark).

## Renderer

```ts
import { parseQuillDelta } from 'quill-delta-renderer';
import { HtmlMarkdownRenderer } from 'quill-delta-renderer/markdown';

const ast = parseQuillDelta(delta);
const md = new HtmlMarkdownRenderer().render(ast);
```

## What is rendered

- All **standard Markdown** (blocks and inline): paragraphs, headers, lists, blockquotes, code blocks, **bold**, *italic*, ~~strike~~, `code`, [links](url).
- **Non-standard inline formats** are emitted as HTML so they are preserved:

| Format           | Output                              | Example input   | Example output                                              |
| --------------- | ----------------------------------- | --------------- | ----------------------------------------------------------- |
| Underline       | `<u>...</u>`                        | underlined      | `<u>underlined</u>`                                         |
| Subscript       | `<sub>...</sub>`                    | H₂O             | `H<sub>2</sub>O`                                            |
| Superscript     | `<sup>...</sup>`                    | E=mc²           | `E=mc<sup>2</sup>`                                          |
| Color           | `<span color="...">...</span>`      | red text        | `<span color="#e60000">red text</span>`                     |
| Background      | `<span background-color="...">...</span>` | highlighted | `<span background-color="#ffebcc">highlighted</span>`        |
| Font            | `<span font="...">...</span>`       | mono            | `<span font="monospace">mono</span>`                        |
| Size            | `<span size="...">...</span>`       | large           | `<span size="large">large</span>`                            |

When multiple of these apply (color, background, font, size), they are merged into **one** `<span>` tag (e.g. `<span color="red" font="mono">text</span>`). When **bold**, *italic*, or other standard Markdown marks apply together with color/font/etc., the Markdown syntax is kept inside the span: `<span color="red">**bold text**</span>`.

## When to use

- **Use HtmlMarkdownRenderer** when the Markdown will be rendered by a viewer that supports inline HTML (most modern Markdown engines do).
- **Use MarkdownRenderer** when you need strict standard Markdown only (e.g. for a spec-compliant export or a processor that strips HTML).

## Custom embeds

For delta inserts like `{ insert: { myEmbed: { ... } } }`, you can either fully control the output or only supply attributes.

### Full override: embedHandler

Provide an **embedHandler** in config. It receives the embed node (`node.type` is the embed key, `node.data` is the payload) and returns the HTML string to emit, or `undefined` to fall back to attribute-based rendering or empty.

```ts
new HtmlMarkdownRenderer({
  embedHandler: (node) => {
    if (node.type === 'widget' && node.data && typeof node.data === 'object') {
      const d = node.data as Record<string, unknown>;
      return `<span data-widget-id="${d.id}">${String(d.title)}</span>`;
    }
    return undefined;
  },
});
```

### Attributes-only: embedAttributesHandler

For a simpler path, provide **embedAttributesHandler**. The renderer emits a self-closing **`<embed data-embed-type="..." data-*="..." />`** tag. The `data-embed-type` attribute is the embed node type (e.g. `widget`, `myEmbed`); your handler returns the rest as key/value pairs (each becomes `data-<key>="<value>"`).

```ts
new HtmlMarkdownRenderer({
  embedAttributesHandler: (node) => {
    if (node.type === 'widget' && node.data && typeof node.data === 'object') {
      const d = node.data as Record<string, unknown>;
      return { type: String(d.type), id: String(d.id) };
    }
    return undefined;
  },
});
// Renders: <embed data-embed-type="widget" data-type="chart" data-id="c1" />
```

If both **embedHandler** and **embedAttributesHandler** are set, **embedHandler** is tried first; its result is used when it returns a string.

## Configuration

`HtmlMarkdownRenderer` accepts the same optional config as `MarkdownRenderer` (e.g. `bulletChar`, `fenceChar`, `hrString`, `embedHandler`, `embedAttributesHandler`). See the main [README](../README.md#markdownrenderer) for options.
