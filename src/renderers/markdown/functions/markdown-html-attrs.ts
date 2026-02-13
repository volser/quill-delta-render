import { escapeHtml } from '../../html/base-html-renderer';
import type { MarkdownHtmlAttrs } from '../types/markdown-html-attrs';

const EMPTY: MarkdownHtmlAttrs = Object.freeze({});

export function emptyMarkdownHtmlAttrs(): MarkdownHtmlAttrs {
  return EMPTY;
}

export function mergeMarkdownHtmlAttrs(
  target: MarkdownHtmlAttrs,
  source: MarkdownHtmlAttrs,
): MarkdownHtmlAttrs {
  const t = target.attrs;
  const s = source.attrs;
  if (!t && !s) return EMPTY;
  return { attrs: { ...t, ...s } };
}

export function hasMarkdownHtmlAttrs(a: MarkdownHtmlAttrs | undefined): boolean {
  return Boolean(a?.attrs && Object.keys(a.attrs).length > 0);
}

export function serializeMarkdownHtmlAttrs(attrs: Record<string, string> | undefined): string {
  if (!attrs || Object.keys(attrs).length === 0) return '';
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${escapeHtml(k)}="${escapeHtml(String(v).trim())}"`)
    .join(' ');
}
