// Finder tag colors, using the macOS system colors from Apple HIG > Color.
// In project order: Trust Bank, GameCove (blue), UTrada (green), ETO Markets (orange).
const order = ["var(--system-blue)", "var(--system-blue)", "var(--system-green)", "var(--system-orange)"];

export function tagColorFor(index: number) {
  return order[index % order.length];
}
