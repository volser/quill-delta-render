import type { TNode } from '../../../../core/ast-types';
import type { RenderGroupType } from '../types/semantic-html-config';

export function getGroupType(node: TNode): RenderGroupType | null {
  switch (node.type) {
    case 'list':
      return 'list';
    case 'table':
      return 'table';
    case 'video':
      return 'video';
    case 'text':
      return null;
    default:
      if (node.isInline) return null;
      return 'block';
  }
}
