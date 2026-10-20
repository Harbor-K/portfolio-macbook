// Desktop wallpapers: plain white or plain dark grey only, so the windows and project cards are what stand out.
// Switching Appearance to Light or Dark also switches to the matching wallpaper.
export type Wallpaper = {
  id: string;
  name: string;
  /** Photo wallpaper. Empty for a plain wallpaper. */
  src: string;
  /** "light" wallpapers get dark desktop labels and a light menu bar; "dark" ones get white labels. */
  tone: "light" | "dark";
  /** Plain wallpaper colour (the same in light and dark mode). */
  gradient: { light: string; dark: string };
  objectPosition: string;
  filter: string;
  nightSrc?: string;
};

export const nightFilter = "none";

export const wallpapers: Wallpaper[] = [
  { id: "white", name: "White", src: "", tone: "light", gradient: { light: "#FFFFFF", dark: "#FFFFFF" }, objectPosition: "50% 50%", filter: "none" },
  // Not pure black: #121212 is the dark surface Material Design recommends, softer on the eyes and lets the
  // (slightly lighter) dark windows still stand out.
  { id: "black", name: "Dark", src: "", tone: "dark", gradient: { light: "#121212", dark: "#121212" }, objectPosition: "50% 50%", filter: "none" },
];

export const defaultWallpaperId = "white";
