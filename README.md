# quill-delta-renderer

[![CI](https://github.com/volser/quill-delta-renderer/actions/workflows/ci.yml/badge.svg)](https://github.com/volser/quill-delta-renderer/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/quill-delta-renderer)](https://www.npmjs.com/package/quill-delta-renderer)
[![bundle size](https://img.shields.io/bundlephobia/minzip/quill-delta-renderer)](https://bundlephobia.com/package/quill-delta-renderer)
[![license](https://img.shields.io/npm/l/quill-delta-renderer)](./LICENSE)

**The modern, type-safe way to render Quill Deltas anywhere — server, client, or CLI.**

Render rich Quill content as HTML, React components, or Markdown without needing the Quill editor or a browser DOM. Fully tree-shakeable. Zero dependencies. Written in TypeScript.

## Why this library?

If you're using [Quill](https://quilljs.com/), you've likely hit one of these walls:

| Problem | How quill-delta-renderer helps |
| --- | --- |
| **"I need to render Deltas on the server."** Quill requires a browser DOM, so SSR in Next.js, Nuxt, or plain Node is painful. | Works in any JavaScript runtime — Node, Deno, Bun, edge functions — no DOM required. |
| **"I don't want `dangerouslySetInnerHTML` in React."** Injecting raw HTML is a security risk and blocks custom interactivity. | The React renderer produces a native `ReactNode` tree. Swap in your own `<CustomImage>`, `<LinkPreview>`, or any component. |
| **"I need to convert Deltas to Markdown."** Mapping rich formatting (colors, underlines, tables) to Markdown is surprisingly hard. | Three Markdown renderers handle this out of the box — strict, HTML-flavored, or bracket-tagged. |
| **"`quill-delta-to-html` is showing its age."** Older typings, no tree-shaking, and extending it with custom embeds is frustrating. | Modern ESM with subpath exports, strict TypeScript throughout, and an extensible renderer API that makes custom blocks trivial. |

## At a glance

```ts
import { parseQuillDelta } from 'quill-delta-renderer';
import { SemanticHtmlRenderer } from 'quill-delta-renderer/html';

const delta = {
  ops: [
    { insert: 'Hello' },
    { insert: ', world!', attributes: { bold: true } },
    { insert: '\n' },
  ],
};

const html = new SemanticHtmlRenderer().render(parseQuillDelta(delta));
// → '<p>Hello<strong>, world!</strong></p>'
```

Two lines. Delta in, HTML out. Works the same on the server and in the browser.

## Install

```bash
npm install quill-delta-renderer
```

The React renderer is optional — add React only if you use it:

```bash
npm install react react-dom
```

## Usage

### HTML (server or client)

```ts
import { parseQuillDelta } from 'quill-delta-renderer';
import { SemanticHtmlRenderer } from 'quill-delta-renderer/html';

const ast = parseQuillDelta(delta);
const html = new SemanticHtmlRenderer().render(ast);
```

### React — no `dangerouslySetInnerHTML`

Render Deltas directly into a React component tree. Override any block with your own component:

```tsx
import { parseQuillDelta } from 'quill-delta-renderer';
import { ReactRenderer } from 'quill-delta-renderer/react';

const renderer = new ReactRenderer({
  components: {
    image: ({ node }) => <CustomImage src={node.data} />,
    video: ({ node }) => <VideoPlayer url={node.data} />,
    paragraph: ({ children, className }) => (
      <p className={className}>{children}</p>
    ),
  },
});

const element = renderer.render(parseQuillDelta(delta));
// Use `element` directly in JSX — it's a ReactNode
```

Every block type (`paragraph`, `header`, `blockquote`, `code-block`, `list`, `list-item`, `image`, `video`, `table`, `table-row`, `table-cell`, `formula`, `mention`) can be overridden via `components`.

### Markdown

```ts
import { parseQuillDelta } from 'quill-delta-renderer';
import { MarkdownRenderer } from 'quill-delta-renderer/markdown';

const md = new MarkdownRenderer().render(parseQuillDelta(delta));
```

Three flavors are available:

| Renderer | Non-standard formats (underline, color, etc.) |
| --- | --- |
| `MarkdownRenderer` | Stripped — strict standard Markdown only |
| `HtmlMarkdownRenderer` | Rendered as inline HTML (`<u>`, `<sub>`, `<span>`) |
| `BracketMarkdownRenderer` | Rendered as bracket tags (`[STYLE color=red]...[/STYLE]`) |

See the format docs: [HTML Markdown](docs/markdown-html-format.md) · [Bracket Markdown](docs/markdown-bracket-format.md)

## Migrating from `quill-delta-to-html`

`SemanticHtmlRenderer` is designed to produce output compatible with `quill-delta-to-html`, so migration can be as simple as swapping the import:

**Before:**

```ts
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

const converter = new QuillDeltaToHtmlConverter(delta.ops, {});
const html = converter.convert();
```

**After:**

```ts
import { parseQuillDelta } from 'quill-delta-renderer';
import { SemanticHtmlRenderer } from 'quill-delta-renderer/html';

const html = new SemanticHtmlRenderer().render(parseQuillDelta(delta));
```

**What you gain immediately:**

- Full TypeScript autocomplete for every config option and custom handler
- Tree-shakeable — import only the renderer you use; unused code is never bundled
- The same extensibility API works across HTML, React, and Markdown renderers
- Significantly faster rendering (see [Performance](#performance))

> **Compatibility note:** Default configuration targets high compatibility with `quill-delta-to-html` output. For edge cases, see the config options (`inlineStyles`, `classPrefix`, `linkTarget`, etc.) and the [configuration reference](#configuration) below. We recommend comparing output on a few representative documents during migration.

## Configuration

All renderers accept an optional config object. Every option has a sensible default.

### SemanticHtmlRenderer

```ts
new SemanticHtmlRenderer({
  classPrefix: 'ql',       // CSS class prefix (default: 'ql')
  paragraphTag: 'p',       // Tag for paragraphs (default: 'p')
  linkTarget: '_blank',    // Link target attribute (default: '_blank')
  linkRel: 'noopener',     // Link rel attribute
  inlineStyles: false,     // Use inline styles instead of classes
  encodeHtml: true,        // HTML-encode text content (default: true)
  customTag: (fmt, node) => { /* return a custom tag string or undefined */ },
});
```

### ReactRenderer

```tsx
new ReactRenderer({
  classPrefix: 'ql',
  linkTarget: '_blank',
  linkRel: 'noopener',
  customTag: (fmt, node) => { /* return a custom tag string or undefined */ },
  components: {
    image: ({ node }) => <CustomImage src={node.data} />,
    // override any block type
  },
});
```

### MarkdownRenderer

````ts
new MarkdownRenderer({
  bulletChar: '*',         // Unordered list character (default: '*')
  fenceChar: '```',        // Fenced code block delimiter (default: '```')
  embedHandler: (node) => { /* return string for custom embeds */ },
  embedAttributesHandler: (node) => { /* return { key: value } for attribute-only embeds */ },
});
````

`HtmlMarkdownRenderer` and `BracketMarkdownRenderer` accept the same config.

### parseQuillDelta

```ts
parseQuillDelta(delta, {
  extraBlockAttributes: { ... },   // Additional block attribute handlers
  blockEmbeds: ['video'],          // Block-level embed types (default: ['video'])
  extraTransformers: [myGrouper],  // Appended after standard transformers
  transformers: [...],             // Replace standard transformers entirely
});
```

## Extending the library

### Custom block handling with transformers

A transformer is a function that receives the AST's children array and returns a new array. Use this to group, wrap, or reorganize nodes before rendering:

```ts
import type { TNode, Transformer } from 'quill-delta-renderer/core';

const imageGallery: Transformer = (children: TNode[]) => {
  // group adjacent images into a gallery container
  return groupImages(children);
};

const ast = parseQuillDelta(delta, {
  extraTransformers: [imageGallery],
});
```

### Writing a custom renderer

For output formats that need HTML-style attribute collection, extend `BaseRenderer`. For simpler formats (plain text, Markdown-like), extend `SimpleRenderer` — you only need two methods:

```ts
import { SimpleRenderer } from 'quill-delta-renderer/core';

class PlainTextRenderer extends SimpleRenderer<string> {
  protected joinChildren(children: string[]) {
    return children.join('');
  }
  protected renderText(text: string) {
    return text;
  }
}
```

## Tree-shakeable imports

Import only what you need — unused renderers are never bundled:

| Import path | Contents |
| --- | --- |
| `quill-delta-renderer` | Barrel export including `parseQuillDelta` |
| `quill-delta-renderer/core` | `parseDelta`, `BaseRenderer`, `SimpleRenderer`, types |
| `quill-delta-renderer/common` | Transformers, sanitizers, shared utilities |
| `quill-delta-renderer/html` | `SemanticHtmlRenderer`, `QuillHtmlRenderer` |
| `quill-delta-renderer/markdown` | `MarkdownRenderer`, `HtmlMarkdownRenderer`, `BracketMarkdownRenderer` |
| `quill-delta-renderer/react` | `ReactRenderer` |

<!-- TODO: measure and add exact minified+gzipped sizes per subpath -->

## Performance

For a single blog post, rendering speed is rarely a bottleneck. Where performance matters is **SSR throughput** — rendering hundreds of pages per second — and **bulk processing** large document sets.

In those scenarios, `quill-delta-renderer` delivers measurable gains:

- **HTML:** 2–5× faster than `quill-delta-to-html` (3.65× on a realistic mixed-content document)
- **React:** 1.5–2.9× faster than `quill-delta-to-react` (2.22× on a realistic mixed-content document)

Full methodology and results: [BENCHMARKS.md](./BENCHMARKS.md)

## Live demo

Try it in the browser: **[volser.github.io/quill-delta-renderer](https://volser.github.io/quill-delta-renderer/)**

Or run locally:

```bash
npm run demo:dev
```

## License

[MIT](./LICENSE)
