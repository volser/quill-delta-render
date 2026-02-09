# Performance Benchmarks

Comparison of **`SemanticHtmlRenderer`** (this library) vs **`quill-delta-to-html`** (v0.12.1).

Benchmarks run with [Vitest bench](https://vitest.dev/guide/features.html#benchmarking) on Node.js. Each scenario converts the same Quill Delta to HTML, measuring throughput in operations per second.

## Run locally

```bash
pnpm bench
```

## Results

### Plain text paragraphs

| Scenario | SemanticHtmlRenderer | quill-delta-to-html | Speedup |
| --- | ---: | ---: | ---: |
| 5 paragraphs | 218,939 ops/s | 76,078 ops/s | **2.88x** |
| 50 paragraphs | 24,241 ops/s | 7,868 ops/s | **3.08x** |
| 500 paragraphs | 2,099 ops/s | 711 ops/s | **2.95x** |

### Formatted text (bold, italic, links, colors)

| Scenario | SemanticHtmlRenderer | quill-delta-to-html | Speedup |
| --- | ---: | ---: | ---: |
| 5 blocks | 48,480 ops/s | 12,553 ops/s | **3.86x** |
| 50 blocks | 6,186 ops/s | 1,301 ops/s | **4.76x** |
| 200 blocks | 1,521 ops/s | 316 ops/s | **4.81x** |

### Structured content

| Scenario | SemanticHtmlRenderer | quill-delta-to-html | Speedup |
| --- | ---: | ---: | ---: |
| Nested lists (5 levels x 4 items) | 39,627 ops/s | 13,792 ops/s | **2.87x** |
| Headers with body text | 92,782 ops/s | 25,662 ops/s | **3.62x** |
| Code blocks (5 blocks x 10 lines) | 13,751 ops/s | 14,774 ops/s | 0.93x |
| Embeds (20 images) | 34,205 ops/s | 8,376 ops/s | **4.08x** |
| Tables (10 rows x 4 cols) | 22,406 ops/s | 7,330 ops/s | **3.06x** |

### Realistic document (mixed content)

A single document combining headers, formatted paragraphs, checklists, blockquotes, links, code blocks, images, and ordered lists.

| Scenario | SemanticHtmlRenderer | quill-delta-to-html | Speedup |
| --- | ---: | ---: | ---: |
| Mixed-content document | 29,013 ops/s | 8,879 ops/s | **3.27x** |

## Key takeaways

- **3-5x faster** across all typical scenarios (plain text, formatted text, lists, tables, embeds).
- The advantage **grows with formatting complexity** — 4.8x at 200 blocks of rich text — because the AST-based pipeline handles mark nesting more efficiently than direct string concatenation.
- The only near-parity is **code blocks** (0.93x) where `quill-delta-to-html` is marginally faster, likely due to the overhead of the code-block-container grouping transformer in the AST pipeline.
- For a **realistic mixed-content document**, the renderer is **3.27x faster**.

## Methodology

- Both libraries convert the same `Delta` object to an HTML string.
- `SemanticHtmlRenderer` includes the full pipeline: `parseQuillDelta()` (parsing + transformers) followed by `renderer.render()`.
- `quill-delta-to-html` uses `new QuillDeltaToHtmlConverter(ops).convert()`.
- The renderer instance is reused across iterations (matching real-world usage). The converter is instantiated per call (required by its API).
- Measured with Vitest's built-in benchmarking (tinybench under the hood), with default warm-up and iteration settings.
