import { describe, expect, it } from 'vitest';
import type { TNode, Transformer } from './ast-types';
import { applyTransformers, composeTransformers } from './transformer';

function makeRoot(children: TNode[]): TNode {
  return {
    type: 'root',
    attributes: {},
    children,
    isInline: false,
  };
}

function makeTextBlock(text: string): TNode {
  return {
    type: 'paragraph',
    attributes: {},
    children: [
      {
        type: 'text',
        attributes: {},
        children: [],
        data: text,
        isInline: true,
      },
    ],
    isInline: false,
  };
}

describe('applyTransformers', () => {
  it('should return the root unchanged when no transformers are given', () => {
    const root = makeRoot([makeTextBlock('hello')]);
    const result = applyTransformers(root, []);

    expect(result.children).toEqual(root.children);
  });

  it('should apply a single transformer', () => {
    const root = makeRoot([makeTextBlock('hello')]);

    const addBlock: Transformer = (children) => [...children, makeTextBlock('world')];

    const result = applyTransformers(root, [addBlock]);

    expect(result.children).toHaveLength(2);
    expect(result.children[1]!.children[0]!.data).toBe('world');
  });

  it('should pipe transformers left to right', () => {
    const root = makeRoot([]);

    const addFirst: Transformer = (children) => [...children, makeTextBlock('first')];
    const addSecond: Transformer = (children) => [...children, makeTextBlock('second')];

    const result = applyTransformers(root, [addFirst, addSecond]);

    expect(result.children).toHaveLength(2);
    expect(result.children[0]!.children[0]!.data).toBe('first');
    expect(result.children[1]!.children[0]!.data).toBe('second');
  });
});

describe('composeTransformers', () => {
  it('should compose multiple transformers into one', () => {
    const addA: Transformer = (children) => [...children, makeTextBlock('A')];
    const addB: Transformer = (children) => [...children, makeTextBlock('B')];

    const composed = composeTransformers(addA, addB);
    const result = composed([]);

    expect(result).toHaveLength(2);
    expect(result[0]!.children[0]!.data).toBe('A');
    expect(result[1]!.children[0]!.data).toBe('B');
  });
});
