// Finder tag colors, using the macOS system colors from Apple HIG > Color.
// In project order: Trust Bank, GameCove (blue), UTrada (green), ETO Markets (orange).
const order = ["var(--system-blue)", "var(--system-blue)", "var(--system-green)", "var(--system-orange)"];

export function tagColorFor(index: number) {
  return order[index % order.length];
}

// The name of each tag color, as listed in Finder's sidebar (used on the mobile project cards).
const names: Record<string, string> = {
  "var(--system-blue)": "2026",
  "var(--system-green)": "2025",
  "var(--system-orange)": "2024-2022",
};

export function tagNameFor(index: number) {
  return names[tagColorFor(index)];
}
