# Performance Benchmarks

Comparison of this library's renderers vs their alternatives:

- **`SemanticHtmlRenderer`** vs **`quill-delta-to-html`** (v0.12.1)
- **`ReactRenderer`** vs **`quill-delta-to-react`** (v1.2.0)

Benchmarks run with [Vitest bench](https://vitest.dev/guide/features.html#benchmarking) on Node.js. Each scenario converts the same Quill Delta to HTML, measuring throughput in operations per second.

## Run locally

```bash
pnpm bench
```

## HTML Renderer Results

### Plain text paragraphs

| Scenario | SemanticHtmlRenderer | quill-delta-to-html | Speedup |
| --- | ---: | ---: | ---: |
| 5 paragraphs | 245,973 ops/s | 77,029 ops/s | **3.19x** |
| 50 paragraphs | 27,454 ops/s | 8,128 ops/s | **3.38x** |
| 500 paragraphs | 2,219 ops/s | 773 ops/s | **2.87x** |

### Formatted text (bold, italic, links, colors)

| Scenario | SemanticHtmlRenderer | quill-delta-to-html | Speedup |
| --- | ---: | ---: | ---: |
| 5 blocks | 50,270 ops/s | 12,851 ops/s | **3.91x** |
| 50 blocks | 6,175 ops/s | 1,314 ops/s | **4.70x** |
| 200 blocks | 1,496 ops/s | 320 ops/s | **4.68x** |

### Structured content

| Scenario | SemanticHtmlRenderer | quill-delta-to-html | Speedup |
| --- | ---: | ---: | ---: |
| Nested lists (5 levels x 4 items) | 40,783 ops/s | 14,887 ops/s | **2.74x** |
| Headers with body text | 93,351 ops/s | 25,691 ops/s | **3.63x** |
| Code blocks (5 blocks x 10 lines) | 27,157 ops/s | 13,857 ops/s | **1.96x** |
| Embeds (20 images) | 34,988 ops/s | 8,132 ops/s | **4.30x** |
| Tables (10 rows x 4 cols) | 22,534 ops/s | 6,651 ops/s | **3.39x** |

### Realistic document (mixed content)

A single document combining headers, formatted paragraphs, checklists, blockquotes, links, code blocks, images, and ordered lists.

| Scenario | SemanticHtmlRenderer | quill-delta-to-html | Speedup |
| --- | ---: | ---: | ---: |
| Mixed-content document | 31,004 ops/s | 8,499 ops/s | **3.65x** |

### Key takeaways

- **2-5x faster** across all scenarios, with no regressions.
- The advantage **grows with formatting complexity** — 4.7x at 200 blocks of rich text — because the AST-based pipeline handles mark nesting more efficiently than direct string concatenation.
- Code blocks show the smallest gain (**1.96x**) due to the overhead of the `codeBlockGrouper` transformer pass, but the `code-block-container` node override renders all lines in a single `<pre>` without per-line handler dispatch.
- For a **realistic mixed-content document**, the renderer is **3.65x faster**.

## React Renderer Results

Comparison of **`ReactRenderer`** (this library) vs **`quill-delta-to-react`** (v1.2.0).

Two measurements for `ReactRenderer`:

- **elements** — just creating React element trees (no serialization)
- **→ HTML** — elements + `renderToStaticMarkup()` (apples-to-apples comparison with `quill-delta-to-react`)

Speedup is computed from the **→ HTML** columns (same serialization path).

### Plain text paragraphs

| Scenario | ReactRenderer (elements) | ReactRenderer → HTML | quill-delta-to-react | Speedup |
| --- | ---: | ---: | ---: | ---: |
| 5 paragraphs | 88,936 ops/s | 59,282 ops/s | 23,649 ops/s | **2.51x** |
| 50 paragraphs | 8,744 ops/s | 7,186 ops/s | 3,011 ops/s | **2.39x** |
| 500 paragraphs | 810 ops/s | 761 ops/s | 266 ops/s | **2.86x** |

### Formatted text (bold, italic, links, colors)

| Scenario | ReactRenderer (elements) | ReactRenderer → HTML | quill-delta-to-react | Speedup |
| --- | ---: | ---: | ---: | ---: |
| 5 blocks | 15,532 ops/s | 11,238 ops/s | 7,271 ops/s | **1.55x** |
| 50 blocks | 1,605 ops/s | 1,212 ops/s | 804 ops/s | **1.51x** |
| 200 blocks | 394 ops/s | 336 ops/s | 173 ops/s | **1.94x** |

### Realistic document (mixed content)

| Scenario | ReactRenderer (elements) | ReactRenderer → HTML | quill-delta-to-react | Speedup |
| --- | ---: | ---: | ---: | ---: |
| Mixed-content document | 11,432 ops/s | 8,371 ops/s | 3,766 ops/s | **2.22x** |

### Key takeaways

- **1.5-2.9x faster** across all scenarios when comparing HTML output end-to-end.
- Creating React elements alone (without serialization) is **2-3.8x faster** than `quill-delta-to-react`'s full render, showing efficient AST-to-element conversion.
- The `renderToStaticMarkup()` serialization step adds ~30-50% overhead on top of element creation, yet the pipeline still outperforms the alternative.
- For a **realistic mixed-content document**, the renderer is **2.22x faster** (or **3.04x** comparing elements only).

## Methodology

- Both libraries convert the same `Delta` object to an HTML string (or React elements where noted).
- `SemanticHtmlRenderer` includes the full pipeline: `parseQuillDelta()` (parsing + transformers) followed by `renderer.render()`.
- `ReactRenderer` uses the same parsing pipeline, producing React elements; HTML output uses `renderToStaticMarkup()`.
- `quill-delta-to-html` uses `new QuillDeltaToHtmlConverter(ops).convert()`.
- `quill-delta-to-react` uses `renderToStaticMarkup(createElement(RenderDelta, { ops }))`.
- The renderer instance is reused across iterations (matching real-world usage). The converters are instantiated per call (required by their API).
- Measured with Vitest's built-in benchmarking (tinybench under the hood), with default warm-up and iteration settings.
