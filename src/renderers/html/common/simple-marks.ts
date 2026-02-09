import type { MarkHandler } from '../../../core/ast-types';

/**
 * Standard HTML mark handlers shared between Quill and Semantic renderers.
 *
 * These marks have identical output in both renderers and are extracted
 * here to avoid duplication.
 */

export const boldMark: MarkHandler<string> = (content) => `<strong>${content}</strong>`;

export const italicMark: MarkHandler<string> = (content) => `<em>${content}</em>`;

export const underlineMark: MarkHandler<string> = (content) => `<u>${content}</u>`;

export const strikeMark: MarkHandler<string> = (content) => `<s>${content}</s>`;

export const codeMark: MarkHandler<string> = (content) => `<code>${content}</code>`;

export const scriptMark: MarkHandler<string> = (content, value) => {
  const tag = value === 'super' ? 'sup' : 'sub';
  return `<${tag}>${content}</${tag}>`;
};
