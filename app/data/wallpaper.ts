// Harbor's wallpapers at full resolution, hosted in the public GitHub repo
// Harbor-K/portfolio-macbook and served through the jsDelivr CDN.
// URLs are pinned to a commit so the CDN cache never serves a stale file.
const base = "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@1790274712d0bd4d1faa6d7ec829b48d7604fa65/wallpaper";

export const wallpapers = {
  field: `${base}/field.jpg`, // 2576x1932
  rooftops: `${base}/rooftops.jpg`, // 3206x1796
};

// Switch between "field" and "rooftops" here.
export const wallpaper = wallpapers.field;

// Framing and tone.
// objectPosition: vertical % — lower than 50% moves the picture down on screen (shows more sky).
// filter: brightness above 1 lightens the photo.
export const wallpaperStyle = {
  objectPosition: "50% 35%",
  filter: "brightness(1.08)",
};
