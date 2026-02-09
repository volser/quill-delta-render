import { describe, expect, it } from 'vitest';
import type { Delta, Transformer } from './core/ast-types';
import { parseQuillDelta } from './parse-quill-delta';

describe('parseQuillDelta', () => {
  it('should parse a simple delta with default config', () => {
    const delta: Delta = { ops: [{ insert: 'Hello world\n' }] };

    const ast = parseQuillDelta(delta);

    expect(ast.type).toBe('root');
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0]!.type).toBe('paragraph');
    expect(ast.children[0]!.children[0]!.data).toBe('Hello world');
  });

  it('should apply standard transformers (lists get grouped)', () => {
    const delta: Delta = {
      ops: [
        { insert: 'Item 1' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'Item 2' },
        { insert: '\n', attributes: { list: 'bullet' } },
      ],
    };

    const ast = parseQuillDelta(delta);

    // listGrouper should have grouped the list items into a list container
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0]!.type).toBe('list');
    expect(ast.children[0]!.children).toHaveLength(2);
  });

  it('should apply standard transformers (code blocks get grouped)', () => {
    const delta: Delta = {
      ops: [
        { insert: 'line 1' },
        { insert: '\n', attributes: { 'code-block': true } },
        { insert: 'line 2' },
        { insert: '\n', attributes: { 'code-block': true } },
      ],
    };

    const ast = parseQuillDelta(delta);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0]!.type).toBe('code-block-container');
    expect(ast.children[0]!.children).toHaveLength(2);
  });

  it('should support extraBlockAttributes', () => {
    const delta: Delta = {
      ops: [{ insert: 'content' }, { insert: '\n', attributes: { 'my-widget': 'abc' } }],
    };

    const ast = parseQuillDelta(delta, {
      extraBlockAttributes: {
        'my-widget': (value) => ({
          blockType: 'widget',
          blockAttrs: { widgetId: value },
        }),
      },
    });

    expect(ast.children[0]!.type).toBe('widget');
    expect(ast.children[0]!.attributes.widgetId).toBe('abc');
  });

  it('should support extraTransformers', () => {
    const delta: Delta = { ops: [{ insert: 'Hello\n' }] };

    const uppercaser: Transformer = (children) =>
      children.map((child) => ({
        ...child,
        children: child.children.map((t) => ({
          ...t,
          data: typeof t.data === 'string' ? t.data.toUpperCase() : t.data,
        })),
      }));

    const ast = parseQuillDelta(delta, { extraTransformers: [uppercaser] });

    expect(ast.children[0]!.children[0]!.data).toBe('HELLO');
  });

  it('should support replacing transformers entirely', () => {
    const delta: Delta = {
      ops: [
        { insert: 'Item 1' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'Item 2' },
        { insert: '\n', attributes: { list: 'bullet' } },
      ],
    };

    // No transformers = list items stay flat (not grouped)
    const ast = parseQuillDelta(delta, { transformers: [] });

    expect(ast.children).toHaveLength(2);
    expect(ast.children[0]!.type).toBe('list-item');
    expect(ast.children[1]!.type).toBe('list-item');
  });

  it('should treat video as block embed by default', () => {
    const delta: Delta = {
      ops: [
        { insert: 'before' },
        { insert: { video: 'https://example.com/v.mp4' } },
        { insert: 'after\n' },
      ],
    };

    const ast = parseQuillDelta(delta);

    // video is a block embed → flushed as separate block
    expect(ast.children.length).toBeGreaterThanOrEqual(2);
    const videoNode = ast.children.find((c) => c.type === 'video');
    expect(videoNode).toBeDefined();
  });
});
