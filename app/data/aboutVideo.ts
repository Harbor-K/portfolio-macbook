// Harbor's Photo Booth intro video for the About window, hosted in the public GitHub repo
// Harbor-K/portfolio-macbook (converted to H.264/AAC MP4 so every browser can play it)
// and served through jsDelivr, pinned to a commit.
const base = "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@e6e533bf37984f19ce37c553c432c990740937f8/video";

export const aboutVideo = {
  url: `${base}/intro.mp4`,
  poster: `${base}/intro-poster.jpg`,
};

// Black-and-white portrait, used for the About icon until the icon image below exists.
export const aboutPortrait =
  "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@5cec4c832c69b6045b2f9d4993cc1e2a2563d3d0/about/portrait.jpg";

// Icon image Harbor uploads herself to about/about-icon.png in the repo.
// Read from the main branch so it appears a few minutes after upload; falls back to the portrait.
export const aboutIcon = "https://raw.githubusercontent.com/Harbor-K/portfolio-macbook/main/about/about-icon.png";
