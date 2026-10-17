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
  action?: "projects" | "about" | "reminders" | "settings" | "spinit";
  href?: string;
};

const icon = (name: string, commit = "d9d035cae736fb6ec079bb98968dbddcc5e10be9") =>
  `https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@${commit}/dock/${name}.png`;

export const settingsIcon = icon("settings-dark", "4fc944a5ae691ff19eb79f0ee6920253e1bcc987");

export const spinItIcon = icon("music", "4fc944a5ae691ff19eb79f0ee6920253e1bcc987");

export const dockSections: DockApp[][] = [
  [
    { id: "finder", name: "Finder", glyph: "folder", imageUrl: icon("finder"), running: true, action: "projects" },
    { id: "system-settings", name: "System Settings", glyph: "settings", imageUrl: settingsIcon, action: "settings" },
    { id: "reminders", name: "Reminders", glyph: "list", imageUrl: icon("reminders"), badge: 2, action: "reminders" },
    { id: "music", name: "Spin it", glyph: "note", imageUrl: spinItIcon, action: "spinit" },
  ],
  [
    { id: "figma", name: "Figma", glyph: "pen", imageUrl: icon("figma"), running: true },
    { id: "cursor", name: "Cursor", glyph: "code", imageUrl: icon("cursor"), running: true },
    { id: "claude", name: "Claude", glyph: "message", imageUrl: icon("claude"), running: true },
  ],
];
