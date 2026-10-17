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
];
