import React from 'react';

export const escapeJsxText = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;');

export const stringifyPropValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `{${String(value)}}`;
  }
  if (value == null) {
    return '{null}';
  }
  return `{${JSON.stringify(value)}}`;
};

export const serializeReactNode = (node: React.ReactNode, depth = 0): string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') {
    return `${'  '.repeat(depth)}${escapeJsxText(String(node))}`;
  }
  if (Array.isArray(node)) {
    return node
      .map((child) => serializeReactNode(child, depth))
      .filter(Boolean)
      .join('\n');
  }
  if (!React.isValidElement(node)) {
    return `${'  '.repeat(depth)}{/* Unsupported React node */}`;
  }

  const tag =
    node.type === React.Fragment
      ? 'Fragment'
      : typeof node.type === 'string'
        ? node.type
        : node.type?.displayName || node.type?.name || 'Component';

  const props = Object.entries(node.props ?? {})
    .filter(([key]) => key !== 'children')
    .map(([key, value]) => `${key}=${stringifyPropValue(value)}`);

  const openTag = `<${tag}${props.length ? ` ${props.join(' ')}` : ''}>`;
  const closeTag = `</${tag}>`;
  const selfClosingTag = `<${tag}${props.length ? ` ${props.join(' ')}` : ''} />`;
  const children = serializeReactNode(node.props?.children, depth + 1);

  if (!children) {
    return `${'  '.repeat(depth)}${selfClosingTag}`;
  }

  return `${'  '.repeat(depth)}${openTag}\n${children}\n${'  '.repeat(depth)}${closeTag}`;
};
