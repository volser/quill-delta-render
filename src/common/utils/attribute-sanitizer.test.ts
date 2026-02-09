import { describe, expect, it } from 'vitest';
import {
  isValidColor,
  isValidColorLiteral,
  isValidFontFamily,
  isValidSize,
  isValidWidth,
} from './attribute-sanitizer';

describe('isValidColor', () => {
  it('should accept hex colors', () => {
    expect(isValidColor('#fff')).toBe(true);
    expect(isValidColor('#ffffff')).toBe(true);
    expect(isValidColor('#FF0000')).toBe(true);
    expect(isValidColor('#ff000080')).toBe(true);
  });

  it('should accept named colors', () => {
    expect(isValidColor('red')).toBe(true);
    expect(isValidColor('transparent')).toBe(true);
    expect(isValidColor('inherit')).toBe(true);
  });

  it('should accept rgb/rgba/hsl/hsla', () => {
    expect(isValidColor('rgb(255, 0, 0)')).toBe(true);
    expect(isValidColor('rgba(255, 0, 0, 0.5)')).toBe(true);
    expect(isValidColor('hsl(120, 50%, 50%)')).toBe(true);
  });

  it('should reject invalid values', () => {
    expect(isValidColor('')).toBe(false);
    expect(isValidColor(null)).toBe(false);
    expect(isValidColor(123)).toBe(false);
    expect(isValidColor('#gg0000')).toBe(false);
  });
});

describe('isValidColorLiteral', () => {
  it('should accept named colors', () => {
    expect(isValidColorLiteral('red')).toBe(true);
    expect(isValidColorLiteral('blue')).toBe(true);
  });

  it('should reject hex colors', () => {
    expect(isValidColorLiteral('#fff')).toBe(false);
  });

  it('should reject non-strings', () => {
    expect(isValidColorLiteral(123)).toBe(false);
  });
});

describe('isValidFontFamily', () => {
  it('should accept valid font families', () => {
    expect(isValidFontFamily('serif')).toBe(true);
    expect(isValidFontFamily('Times New Roman')).toBe(true);
    expect(isValidFontFamily('Times New Roman, serif')).toBe(true);
  });

  it('should reject values with special characters', () => {
    expect(isValidFontFamily('font;injection')).toBe(false);
    expect(isValidFontFamily('')).toBe(false);
  });
});

describe('isValidSize', () => {
  it('should accept size keywords', () => {
    expect(isValidSize('small')).toBe(true);
    expect(isValidSize('large')).toBe(true);
    expect(isValidSize('huge')).toBe(true);
  });

  it('should accept numeric sizes with units', () => {
    expect(isValidSize('14px')).toBe(true);
    expect(isValidSize('1.5em')).toBe(true);
    expect(isValidSize('100%')).toBe(true);
  });

  it('should reject invalid sizes', () => {
    expect(isValidSize('')).toBe(false);
    expect(isValidSize('not-a-size')).toBe(false);
  });
});

describe('isValidWidth', () => {
  it('should accept numeric widths', () => {
    expect(isValidWidth('200')).toBe(true);
    expect(isValidWidth('200px')).toBe(true);
    expect(isValidWidth('50%')).toBe(true);
    expect(isValidWidth('auto')).toBe(true);
  });

  it('should reject invalid widths', () => {
    expect(isValidWidth('')).toBe(false);
    expect(isValidWidth('abc')).toBe(false);
  });
});
