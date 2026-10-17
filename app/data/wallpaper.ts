// Harbor's wallpapers at full resolution, hosted in the public GitHub repo
// Harbor-K/portfolio-macbook and served through the jsDelivr CDN.
// URLs are pinned to a commit so the CDN cache never serves a stale file.
const base = "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@1790274712d0bd4d1faa6d7ec829b48d7604fa65/wallpaper";
const base2 = "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@ad47edc72dc9f58af99e149aa7fc38799f0c8e6f/wallpaper";

export type Wallpaper = {
  id: string;
  name: string;
  src: string;
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
  { id: "field", name: "Field", src: `${base}/field.jpg`, objectPosition: "50% 35%", filter: "brightness(1.08)" }, // 2576x1932
  { id: "rooftops", name: "Rooftops", src: `${base}/rooftops.jpg`, objectPosition: "50% 50%", filter: "none" }, // 3206x1796
  { id: "pink-sky", name: "Pink Sky", src: `${base2}/pink-sky.jpg`, objectPosition: "50% 45%", filter: "none" }, // 2560x1920
  { id: "seaside", name: "Seaside", src: `${base2}/seaside.jpg`, objectPosition: "50% 50%", filter: "none" }, // 2560x1920
  { id: "park-sunset", name: "Park Sunset", src: `${base2}/park-sunset.jpg`, objectPosition: "50% 50%", filter: "none" }, // 1920x1080
];

// The wallpaper a first-time visitor sees.
export const defaultWallpaperId = "field";
