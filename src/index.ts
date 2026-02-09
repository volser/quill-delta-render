// ─── Convenience API ────────────────────────────────────────────────────────
//
// The root barrel exports only the high-level convenience function and the
// minimal set of types consumers need to call it. For everything else, use
// the dedicated subpath exports:
//
//   import { parseDelta, DeltaParser, ... } from 'quill-delta-renderer/core';
//   import { listGrouper, tableGrouper, ... } from 'quill-delta-renderer/common';
//   import { SemanticHtmlRenderer, ... } from 'quill-delta-renderer/renderers/html';
//   import { ReactRenderer } from 'quill-delta-renderer/renderers/react';
//   import { MarkdownRenderer } from 'quill-delta-renderer/renderers/markdown';

// Core types needed alongside parseQuillDelta
export type { Delta, TNode, Transformer } from './core/ast-types';
export { isEmbedNode, isTextNode } from './core/ast-types';
export type { ParseQuillDeltaOptions } from './parse-quill-delta';
export { parseQuillDelta } from './parse-quill-delta';
