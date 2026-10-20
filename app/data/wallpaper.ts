// Desktop wallpapers. The default is a calm, plain studio backdrop so the windows and project cards stand
// out; Harbor's own photos (hosted in the public GitHub repo Harbor-K/portfolio-macbook and served through
// the jsDelivr CDN, pinned to a commit) stay available in System Settings > Wallpaper.
const base = "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@1790274712d0bd4d1faa6d7ec829b48d7604fa65/wallpaper";
const base2 = "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@ad47edc72dc9f58af99e149aa7fc38799f0c8e6f/wallpaper";

export type Wallpaper = {
  id: string;
  name: string;
  /** Photo wallpaper. Empty for a plain (gradient) wallpaper. */
  src: string;
  /** Plain wallpaper drawn with CSS, for light and dark mode. */
  gradient?: { light: string; dark: string };
  /** "light" wallpapers get dark desktop labels and a light menu bar; "dark" (photos) keep white labels. */
  tone: "light" | "dark";
  /** objectPosition: vertical % — lower than 50% moves the picture down on screen (shows more sky). */
  objectPosition: string;
  /** brightness above 1 lightens the photo. */
  filter: string;
  /** Optional real night photo of the same place. Without it, dark mode turns the day photo into night with a filter. */
  nightSrc?: string;
};

// How a day photo is turned into night in dark mode (used when a wallpaper has no nightSrc).
export const nightFilter = "brightness(0.42) saturate(0.7) contrast(1.08) hue-rotate(-10deg)";

// Shown in System Settings > Wallpaper, in this order. Add more here.
export const wallpapers: Wallpaper[] = [
  {
    id: "studio",
    name: "Studio",
    src: "",
    tone: "light",
    gradient: {
      light: "radial-gradient(120% 90% at 72% 18%, #ffffff 0%, #f3f2ef 48%, #e6e4df 100%)",
      dark: "radial-gradient(120% 90% at 72% 18%, #2c2c30 0%, #1d1d20 50%, #141416 100%)",
    },
    objectPosition: "50% 50%",
    filter: "none",
  },
  { id: "field", name: "Field", src: `${base}/field.jpg`, tone: "dark", objectPosition: "50% 35%", filter: "brightness(1.08)" }, // 2576x1932
  { id: "rooftops", name: "Rooftops", src: `${base}/rooftops.jpg`, tone: "dark", objectPosition: "50% 50%", filter: "none" }, // 3206x1796
  { id: "pink-sky", name: "Pink Sky", src: `${base2}/pink-sky.jpg`, tone: "dark", objectPosition: "50% 45%", filter: "none" }, // 2560x1920
  { id: "seaside", name: "Seaside", src: `${base2}/seaside.jpg`, tone: "dark", objectPosition: "50% 50%", filter: "none" }, // 2560x1920
  { id: "park-sunset", name: "Park Sunset", src: `${base2}/park-sunset.jpg`, tone: "dark", objectPosition: "50% 50%", filter: "none" }, // 1920x1080
];

// The wallpaper a first-time visitor sees.
export const defaultWallpaperId = "studio";
