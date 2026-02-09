import type { CSSProperties } from 'react';

/**
 * React-specific collected attributes.
 *
 * Used by the inline attributor system (marks that contribute styles/classes
 * to the parent element) and block attribute resolvers in React renderers.
 *
 * Analogous to {@link ResolvedAttrs} in the HTML renderers, but uses
 * React conventions (`className`, camelCase `CSSProperties`).
 */
export interface ReactProps {
  /** React inline styles (camelCase keys). */
  style?: CSSProperties;
  /** CSS class names (space-separated string). */
  className?: string;
  /** Arbitrary props for extensibility (`data-*`, `aria-*`, etc.). */
  [key: string]: unknown;
}

/**
 * An empty `ReactProps` constant — avoids allocating a new object
 * every time a resolver has nothing to contribute.
 */
export const EMPTY_REACT_PROPS: ReactProps = Object.freeze({});

/**
 * Merge two `ReactProps` objects. Styles are shallow-merged (source wins on
 * conflict). ClassNames are concatenated. Other props are shallow-merged.
 *
 * Returns a new object — inputs are not mutated.
 */
export function mergeReactProps(target: ReactProps, source: ReactProps): ReactProps {
  const result: ReactProps = { ...target };

  // Merge styles
  if (source.style || target.style) {
    result.style = { ...target.style, ...source.style };
  }

  // Concatenate classNames
  if (source.className || target.className) {
    const parts = [target.className, source.className].filter(Boolean);
    result.className = parts.join(' ');
  }

  // Merge remaining props (skip style/className as they're handled above)
  for (const [key, value] of Object.entries(source)) {
    if (key !== 'style' && key !== 'className') {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Check whether a `ReactProps` object has any meaningful content.
 */
export function hasReactProps(props: ReactProps): boolean {
  if (props.style && Object.keys(props.style).length > 0) return true;
  if (props.className) return true;

  for (const key of Object.keys(props)) {
    if (key !== 'style' && key !== 'className') return true;
  }

  return false;
}
