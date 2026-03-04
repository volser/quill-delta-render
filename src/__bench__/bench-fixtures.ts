import type { Delta, DeltaOp } from '../core/ast-types';

function makeParagraphs(count: number): Delta {
  const ops: DeltaOp[] = [];
  for (let i = 0; i < count; i++) {
    ops.push({
      insert: `Paragraph ${i + 1} with some representative body text that spans a reasonable length.\n`,
    });
  }
  return { ops };
}

function makeFormattedText(count: number): Delta {
  const ops: DeltaOp[] = [];
  for (let i = 0; i < count; i++) {
    ops.push({ insert: 'Bold text ', attributes: { bold: true } });
    ops.push({ insert: 'italic text ', attributes: { italic: true } });
    ops.push({ insert: 'bold+italic ', attributes: { bold: true, italic: true } });
    ops.push({
      insert: 'colored link',
      attributes: { link: 'https://example.com', color: '#ff0000', bold: true },
    });
    ops.push({ insert: ' and normal text' });
    ops.push({ insert: '\n' });
  }
  return { ops };
}

function makeNestedLists(depth: number, itemsPerLevel: number): Delta {
  const ops: DeltaOp[] = [];
  for (let d = 0; d < depth; d++) {
    for (let i = 0; i < itemsPerLevel; i++) {
      ops.push({ insert: `Level ${d + 1} item ${i + 1}` });
      ops.push({ insert: '\n', attributes: { list: 'bullet', indent: d } });
    }
  }
  return { ops };
}

function makeHeaders(): Delta {
  const ops: DeltaOp[] = [];
  for (let level = 1; level <= 6; level++) {
    ops.push({ insert: `Heading Level ${level}` });
    ops.push({ insert: '\n', attributes: { header: level } });
    ops.push({ insert: 'Body text under the heading with some detail.\n' });
  }
  return { ops };
}

function makeCodeBlocks(blockCount: number, linesPerBlock: number): Delta {
  const ops: DeltaOp[] = [];
  for (let b = 0; b < blockCount; b++) {
    for (let l = 0; l < linesPerBlock; l++) {
      ops.push({ insert: `  const value${l} = compute(${l});` });
      ops.push({ insert: '\n', attributes: { 'code-block': 'javascript' } });
    }
    ops.push({ insert: '\n' });
  }
  return { ops };
}

function makeEmbeds(count: number): Delta {
  const ops: DeltaOp[] = [];
  for (let i = 0; i < count; i++) {
    ops.push({ insert: `Text before embed ${i + 1}. ` });
    ops.push({ insert: { image: `https://example.com/img${i}.png` } });
    ops.push({ insert: '\n' });
  }
  return { ops };
}

function makeTables(rows: number, cols: number): Delta {
  const ops: DeltaOp[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ops.push({ insert: `R${r + 1}C${c + 1}` });
      ops.push({ insert: '\n', attributes: { table: `row-${r}` } });
    }
  }
  return { ops };
}

function makeRealisticDocument(): Delta {
  const ops: DeltaOp[] = [
    { insert: 'Project Status Update - Q4 2025' },
    { insert: '\n', attributes: { header: 1 } },
    { insert: 'This document outlines the ' },
    { insert: 'key milestones', attributes: { bold: true } },
    { insert: ' and ' },
    { insert: 'deliverables', attributes: { italic: true } },
    { insert: ' for the quarter. Please review before the ' },
    { insert: 'Friday standup', attributes: { bold: true, underline: true } },
    { insert: '.\n' },
    { insert: 'Completed Tasks' },
    { insert: '\n', attributes: { header: 2 } },
    { insert: 'Migrated database to PostgreSQL 16' },
    { insert: '\n', attributes: { list: 'checked' } },
    { insert: 'Updated CI pipeline with caching' },
    { insert: '\n', attributes: { list: 'checked' } },
    { insert: 'Deployed v2.3.0 to staging' },
    { insert: '\n', attributes: { list: 'checked' } },
    { insert: 'Performance testing on staging' },
    { insert: '\n', attributes: { list: 'unchecked' } },
    { insert: 'Architecture Decision' },
    { insert: '\n', attributes: { header: 2 } },
    {
      insert:
        'We decided to adopt an AST-based rendering pipeline over direct string concatenation for flexibility and testability.',
    },
    { insert: '\n', attributes: { blockquote: true } },
    { insert: 'See the ' },
    { insert: 'RFC document', attributes: { link: 'https://docs.internal/rfc-042' } },
    { insert: ' for the full rationale. The ' },
    {
      insert: 'benchmark results',
      attributes: { link: 'https://perf.internal/bench/q4', bold: true },
    },
    { insert: ' show a 2.3x improvement.\n' },
    { insert: 'Key Metrics' },
    { insert: '\n', attributes: { header: 3 } },
    { insert: 'const metrics = {' },
    { insert: '\n', attributes: { 'code-block': 'typescript' } },
    { insert: '  parseTime: 0.8,   // ms per delta' },
    { insert: '\n', attributes: { 'code-block': 'typescript' } },
    { insert: '  renderTime: 0.3,  // ms per AST' },
    { insert: '\n', attributes: { 'code-block': 'typescript' } },
    { insert: '  totalOps: 520,    // tests passing' },
    { insert: '\n', attributes: { 'code-block': 'typescript' } },
    { insert: '};' },
    { insert: '\n', attributes: { 'code-block': 'typescript' } },
    { insert: '\nPerformance chart:\n' },
    { insert: { image: 'https://charts.internal/perf-q4.png' } },
    { insert: '\n' },
    { insert: 'Next Steps' },
    { insert: '\n', attributes: { header: 2 } },
    { insert: 'Finalize v2.3.0 release notes' },
    { insert: '\n', attributes: { list: 'ordered' } },
    { insert: 'Run load tests on production-like environment' },
    { insert: '\n', attributes: { list: 'ordered' } },
    { insert: 'Schedule rollout for Monday' },
    { insert: '\n', attributes: { list: 'ordered' } },
    { insert: 'Notify stakeholders via ' },
    { insert: 'Slack', attributes: { bold: true } },
    { insert: '\n', attributes: { list: 'ordered' } },
    { insert: '\n' },
    { insert: 'Updated by ', attributes: { italic: true } },
    { insert: '@sergiy', attributes: { italic: true, bold: true, color: '#1a73e8' } },
    { insert: ' on 2025-12-15', attributes: { italic: true } },
    { insert: '\n' },
  ];
  return { ops };
}

export const SMALL_PLAIN = makeParagraphs(5);
export const MEDIUM_PLAIN = makeParagraphs(50);
export const LARGE_PLAIN = makeParagraphs(500);

export const SMALL_FORMATTED = makeFormattedText(5);
export const MEDIUM_FORMATTED = makeFormattedText(50);
export const LARGE_FORMATTED = makeFormattedText(200);

export const NESTED_LIST = makeNestedLists(5, 4);
export const HEADERS_DOC = makeHeaders();
export const CODE_BLOCKS = makeCodeBlocks(5, 10);
export const EMBEDS_DOC = makeEmbeds(20);
export const TABLE_DOC = makeTables(10, 4);
export const REALISTIC_DOC = makeRealisticDocument();
