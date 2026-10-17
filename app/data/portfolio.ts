export type Project = {
  title: string;
  image: string;
  /** Page opened in a new tab when the project is double-clicked. Leave empty to open the Projects window instead. */
  href?: string;
  /** "contain" shows the whole image (for wide logos); "cover" fills and crops. */
  imageFit?: "cover" | "contain";
  /** Background behind a "contain" image, so the empty edges match the artwork. */
  imageBg?: string;
};

export const projects: Project[] = [
  {
    title: "Trust Bank",
    image: "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@096e8b322c7fa3cf148f71899cfb5fb41ae356c2/icons/trust-bank.png",
    // Paste the article landing page URL here.
    href: "",
    imageFit: "contain",
    imageBg: "#459BD7",
  },
];

/** Open a project: its own page in a new tab if it has one, otherwise the fallback (the Projects window). */
export function openProject(project: Project, fallback: () => void) {
  if (project.href) {
    window.open(project.href, "_blank", "noopener,noreferrer");
  } else {
    fallback();
  }
}
