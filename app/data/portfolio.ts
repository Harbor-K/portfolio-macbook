export type Project = {
  title: string;
  image: string;
  /** Opens the mock article page in the Safari-style window when double-clicked. */
  opensArticle?: boolean;
  /** "contain" shows the whole image (for wide logos); "cover" fills and crops. */
  imageFit?: "cover" | "contain";
  /** Background behind a "contain" image, so the empty edges match the artwork. */
  imageBg?: string;
};

export const projects: Project[] = [
  {
    title: "Trust Bank",
    image: "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@72d3385700c07e999e37e3d8b95ebb336e7d0cb9/icons/trust-bank.png",
    opensArticle: true,
    imageFit: "contain",
    imageBg: "#459BD7",
  },
  { title: "GameCove", image: "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@50ff72b39d94c3a56d4f32656517a21f7813b82d/icons/gamecove.png", imageFit: "cover", imageBg: "#0e0e10" },
  { title: "UTrada", image: "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@ad38c9750f7951e663fc0bbe7737753291180c2f/icons/utrada.png", imageFit: "cover", imageBg: "#8300d5" },
  { title: "ETO Markets", image: "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@ad38c9750f7951e663fc0bbe7737753291180c2f/icons/eto-markets.png", imageFit: "cover", imageBg: "#ffffff" },
];
