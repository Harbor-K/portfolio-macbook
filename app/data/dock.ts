// Harbor's Dock, in the same order and grouping as her real Dock.
// Each app has an `imageUrl` slot: paste a hosted PNG of that app's icon to show it.
// Until then a neutral placeholder tile is drawn.

export type DockGlyph = "folder" | "list" | "settings" | "globe" | "book" | "pen" | "aperture" | "note" | "message" | "code" | "trash";

export type DockApp = {
  id: string;
  name: string;
  glyph: DockGlyph;
  imageUrl?: string;
  /** Red notification badge count */
  badge?: number;
  /** Small dot under the icon for apps that are open */
  running?: boolean;
  /** Which desktop window this icon opens, if any */
  action?: "projects" | "about";
  href?: string;
};

export const dockSections: DockApp[][] = [
  [
    { id: "finder", name: "Finder", glyph: "folder", running: true, action: "projects" },
    { id: "reminders", name: "Reminders", glyph: "list", badge: 2 },
    { id: "system-settings", name: "System Settings", glyph: "settings", badge: 1 },
    { id: "chrome", name: "Google Chrome", glyph: "globe", running: true },
    { id: "notion", name: "Notion", glyph: "book", running: true },
  ],
  [
    { id: "figma", name: "Figma", glyph: "pen", running: true },
    // Name not confirmed yet — rename once known.
    { id: "app-6", name: "App", glyph: "aperture", running: true },
    { id: "notes", name: "Notes", glyph: "note", running: true },
    { id: "claude", name: "Claude", glyph: "message", running: true },
    // Name not confirmed yet — rename once known.
    { id: "app-9", name: "App", glyph: "code", running: true },
  ],
];
