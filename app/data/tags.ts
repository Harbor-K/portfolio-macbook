// Finder tag colors, using the macOS system colors from Apple HIG > Color.
const order = ["var(--system-blue)", "var(--system-blue)", "var(--system-blue)", "var(--system-green)", "var(--system-orange)", "var(--system-blue)"];

export function tagColorFor(index: number) {
  return order[index % order.length];
}
