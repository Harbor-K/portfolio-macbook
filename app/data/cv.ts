// CV shown in the Preview window.
// To show your real PDF instead, upload it to Harbor-K/portfolio-macbook as cv/cv.pdf
// and put its pinned jsDelivr URL in pdfUrl. While pdfUrl is empty, the page below is rendered.
export const cv = {
  fileName: "CV.pdf",
  pdfUrl: "",
  // File the download button saves. Hosted in the repo at cv/cv.pdf, pinned to a commit;
  // after replacing cv/cv.pdf in the repo, update the commit hash here.
  downloadUrl: "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@62311e6b04b78320cb92873c01cc3d0f215b486e/cv/cv.pdf",
  downloadName: "Harbor_CV.pdf",
  name: "Harbor (Jihyun Kim)",
  headline: "UI/UX & Product Designer · Geoje, South Korea",
  profile:
    "UI/UX and product designer with 3+ years of experience across fintech and e-learning, with domain depth in trading platforms, crypto/Web3 wallets and digital banking. Comes to interfaces from a fine art background and has lived and worked in Australia and the UK.",
  experience: [
    { org: "UTrada", detail: "Trading / fintech · Sydney" },
    { org: "ETO Markets", detail: "Trading / fintech · Sydney" },
    { org: "Pinetree", detail: "E-learning · Korea" },
    { org: "Freelance", detail: "Upwork & Fiverr" },
  ],
  projects: [
    { name: "GameCove", detail: "AI game-analytics dashboard" },
    { name: "Trust Bank Singapore", detail: "UX research on Singapore neo-banks" },
    { name: "D'CENT Card Wallet", detail: "Hardware crypto wallet landing page and brand" },
    { name: "WalletPro", detail: "Fintech / SaaS design system in Figma" },
  ],
  skills: ["Figma", "Design systems", "Prototyping", "Multilingual / localization design (up to 11 languages)", "AI design tools"],
};
