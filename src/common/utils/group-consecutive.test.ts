import { describe, expect, it } from 'vitest';
import { groupConsecutiveElementsWhile } from './group-consecutive';

describe('groupConsecutiveElementsWhile', () => {
  it('should return empty array for empty input', () => {
    const result = groupConsecutiveElementsWhile([], () => true);
    expect(result).toEqual([]);
  });

  it('should return single element unwrapped', () => {
    const result = groupConsecutiveElementsWhile([1], () => true);
    expect(result).toEqual([1]);
  });

  it('should group consecutive elements matching the predicate', () => {
    const result = groupConsecutiveElementsWhile(
      [1, 'a', 'b', 2, 'c'],
      (curr, prev) => typeof curr === typeof prev,
    );
    expect(result).toEqual([1, ['a', 'b'], 2, 'c']);
  });

  it('should group all elements into one array when predicate always matches', () => {
    const result = groupConsecutiveElementsWhile([1, 2, 3], () => true);
    expect(result).toEqual([[1, 2, 3]]);
  });
});
