/**
 * Read a nested style value from a reactive container (draft config or service).
 *
 * Reads are tracked by Vue during render, so components can bind directly.
 */
export function getStylePath(root: Record<string, any> | undefined, path: string[], key: string): unknown {
  let node: unknown = root

  for (const segment of path) {
    if (node == null || typeof node !== 'object') {
      return undefined
    }

    node = (node as Record<string, unknown>)[segment]
  }

  if (node == null || typeof node !== 'object') {
    return undefined
  }

  return (node as Record<string, unknown>)[key]
}

/**
 * Built-in fallback values for a card's style fields, matching the base
 * Tailwind classes a card renders with when no `style` is configured
 * (`rounded-2xl` = 1rem = 16px, `p-4` = 1rem = 16px, width auto).
 *
 * Used to (a) prefill a newly created service so the panel shows concrete
 * values instead of blanks, and (b) fall back when echoing the currently
 * effective value of an unset field.
 */
export const CARD_STYLE_DEFAULTS: Record<string, string | boolean> = {
  borderRadius: '16px',
  padding: '16px',
  gap: '8px',
  width: 'auto',
  showIcon: true,
  iconSize: '4rem',
}

/**
 * Theme-level defaults for group sections, matching the base Tailwind classes
 * a group renders with when no `style` is configured (`text-2xl` = 1.5rem for
 * the group title, `py-10` = 2.5rem vertical padding around the section).
 */
export const GROUP_STYLE_DEFAULTS = {
  titleFontSize: '1.5rem',
  gap: '2.5rem',
}

/**
 * Theme-level page-title defaults (a `text-3xl`/`font-light` look). Without a
 * `style.title` the dashboard hides its page title entirely, so these also
 * make the header visible by default.
 */
export const STYLE_TITLE_DEFAULTS = {
  fontSize: '1.875rem',
  fontWeight: 300,
}

const LENGTH_UNIT_RE = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem|em|%|vh|vw|pt)?$/

/**
 * Increment/decrement a CSS length value such as `16px` or `1.5rem`,
 * preserving its unit. When the field is empty the `fallback` (the currently
 * effective placeholder value) is used as the base so stepping materializes
 * the inherited default instead of starting from zero. Non-numeric values
 * like `auto` step from the fallback's numeric part (or `keywordBase`).
 */
export function stepNumericValue(
  value: string | undefined,
  delta: number,
  fallback?: string,
  keywordBase = 16,
): string {
  const raw = String(value ?? fallback ?? '').trim()
  const match = raw.match(LENGTH_UNIT_RE)

  if (!match) {
    // Current value is a CSS keyword (e.g. `auto`). Materialize a concrete
    // length from the fallback's numeric part (or `keywordBase`) so stepping
    // grows/shrinks a real size instead of collapsing the element to 0.
    const fallbackMatch = String(fallback ?? '').trim().match(LENGTH_UNIT_RE)
    const base = fallbackMatch ? Number.parseFloat(fallbackMatch[1]!) : keywordBase
    const unit = fallbackMatch?.[2] ?? 'px'

    return `${Math.max(0, Math.round((base + delta) * 100) / 100)}${unit}`
  }

  const unit = match[2] ?? 'px'
  const next = Math.max(0, Math.round((Number.parseFloat(match[1]!) + delta) * 100) / 100)
  return `${next}${unit}`
}

/**
 * Set a nested style value on a reactive container, creating intermediate
 * objects on demand and deleting the key on empty input. Empty containers
 * created along the way are cleaned up so the persisted config stays tidy.
 */
export function setStylePath(
  root: Record<string, any>,
  path: string[],
  key: string,
  value: string | boolean | undefined,
): void {
  const chain: Record<string, any>[] = [root]
  let node: Record<string, any> = root

  for (const segment of path) {
    const next = node[segment]

    if (next == null || typeof next !== 'object') {
      node[segment] = {}
    }

    node = node[segment]
    chain.push(node)
  }

  if (value === undefined || value === '') {
    delete node[key]
  } else {
    node[key] = value
  }

  for (let i = chain.length - 1; i > 0; i--) {
    if (Object.keys(chain[i] ?? {}).length === 0) {
      delete chain[i - 1]![path[i - 1]!]
    }
  }
}
