// Harbor's Dock, in the same order and grouping as her real Dock.
// Icons are hosted in the public GitHub repo Harbor-K/portfolio-macbook (dock/) via jsDelivr, pinned to a commit.

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

const icon = (name: string) => `https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@d9d035cae736fb6ec079bb98968dbddcc5e10be9/dock/${name}.png`;

export const dockSections: DockApp[][] = [
  [
    { id: "finder", name: "Finder", glyph: "folder", imageUrl: icon("finder"), running: true, action: "projects" },
    { id: "system-settings", name: "System Settings", glyph: "settings", imageUrl: icon("settings"), badge: 1 },
    { id: "reminders", name: "Reminders", glyph: "list", imageUrl: icon("reminders"), badge: 2 },
    { id: "notes", name: "Notes", glyph: "note", imageUrl: icon("notes"), running: true },
  ],
  [
    { id: "figma", name: "Figma", glyph: "pen", imageUrl: icon("figma"), running: true },
    { id: "cursor", name: "Cursor", glyph: "code", imageUrl: icon("cursor"), running: true },
    { id: "claude", name: "Claude", glyph: "message", imageUrl: icon("claude"), running: true },
  ],
];
