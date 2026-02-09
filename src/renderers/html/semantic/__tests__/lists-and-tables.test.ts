import { describe, expect, it } from 'vitest';
import { renderDelta } from './test-helpers';

describe('SemanticHtmlRenderer integration: lists', () => {
  it('should render a bullet list', () => {
    const html = renderDelta({
      ops: [
        { insert: 'Item 1' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'Item 2' },
        { insert: '\n', attributes: { list: 'bullet' } },
      ],
    });
    expect(html).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
  });

  it('should render an ordered list', () => {
    const html = renderDelta({
      ops: [
        { insert: 'First' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'Second' },
        { insert: '\n', attributes: { list: 'ordered' } },
      ],
    });
    expect(html).toBe('<ol><li>First</li><li>Second</li></ol>');
  });

  it('should render checked items with data-checked="true"', () => {
    const html = renderDelta({
      ops: [{ insert: 'Done' }, { insert: '\n', attributes: { list: 'checked' } }],
    });
    expect(html).toContain('data-checked="true"');
  });

  it('should render unchecked items with data-checked="false"', () => {
    const html = renderDelta({
      ops: [{ insert: 'Not done' }, { insert: '\n', attributes: { list: 'unchecked' } }],
    });
    expect(html).toContain('data-checked="false"');
  });

  it('should render nested checked/unchecked lists with indent', () => {
    const html = renderDelta({
      ops: [
        { insert: 'hello' },
        { insert: '\n', attributes: { list: 'checked' } },
        { insert: 'there' },
        { insert: '\n', attributes: { list: 'unchecked' } },
        { insert: 'man' },
        { insert: '\n', attributes: { list: 'checked' } },
        { insert: 'not done' },
        { insert: '\n', attributes: { indent: 1, list: 'unchecked' } },
      ],
    });
    expect(html).toContain('data-checked="true">hello');
    expect(html).toContain('data-checked="false">there');
    expect(html).toContain('data-checked="true">man');
    // Nested item has indent class and data-checked
    expect(html).toContain('data-checked="false"');
    expect(html).toContain('not done');
    // Nested list inside parent item
    expect(html).toContain('<ul><li data-checked="false"');
    expect(html).toContain('not done</li></ul>');
  });

  it('should switch between ordered and bullet list types', () => {
    const html = renderDelta({
      ops: [
        { insert: 'mr\n' },
        { insert: 'hello' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'there' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: '\n', attributes: { list: 'ordered' } },
      ],
    });
    expect(html).toContain('<p>mr</p>');
    expect(html).toContain('</ol><ul><li>there');
  });
});

describe('SemanticHtmlRenderer integration: tables', () => {
  it('should render a single-cell table', () => {
    const html = renderDelta({
      ops: [{ insert: 'cell' }, { insert: '\n', attributes: { table: 'row-1' } }],
    });
    expect(html).toBe('<table><tbody><tr><td data-row="row-1">cell</td></tr></tbody></table>');
  });

  it('should render an empty 3x3 table', () => {
    const html = renderDelta({
      ops: [
        { insert: '\n\n\n', attributes: { table: 'row-1' } },
        { insert: '\n\n\n', attributes: { table: 'row-2' } },
        { insert: '\n\n\n', attributes: { table: 'row-3' } },
        { insert: '\n' },
      ],
    });
    expect(html).toContain('<table><tbody>');
    expect(html).toContain('</tbody></table>');
    // 3 rows
    expect(html).toContain('data-row="row-1"');
    expect(html).toContain('data-row="row-2"');
    expect(html).toContain('data-row="row-3"');
  });

  it('should render a filled 3x3 table', () => {
    const html = renderDelta({
      ops: [
        { insert: '11' },
        { insert: '\n', attributes: { table: 'row-1' } },
        { insert: '12' },
        { insert: '\n', attributes: { table: 'row-1' } },
        { insert: '13' },
        { insert: '\n', attributes: { table: 'row-1' } },
        { insert: '21' },
        { insert: '\n', attributes: { table: 'row-2' } },
        { insert: '22' },
        { insert: '\n', attributes: { table: 'row-2' } },
        { insert: '23' },
        { insert: '\n', attributes: { table: 'row-2' } },
        { insert: '31' },
        { insert: '\n', attributes: { table: 'row-3' } },
        { insert: '32' },
        { insert: '\n', attributes: { table: 'row-3' } },
        { insert: '33' },
        { insert: '\n', attributes: { table: 'row-3' } },
        { insert: '\n' },
      ],
    });
    expect(html).toContain('<td data-row="row-1">11</td>');
    expect(html).toContain('<td data-row="row-1">12</td>');
    expect(html).toContain('<td data-row="row-1">13</td>');
    expect(html).toContain('<td data-row="row-2">21</td>');
    expect(html).toContain('<td data-row="row-3">33</td>');
    expect(html).toContain('<p><br/></p>');
  });
});
