// Mock article landing page for the Trust Bank case study, shown inside the Safari-style window.
// Placeholder copy: replace the text below with the real case study when it is ready.
import type { CaseStudy } from "./caseStudies";

export const trustBankArticle: CaseStudy = {
  url: "harbor.design/work/trust-bank",
  tabTitle: "Trust Bank — Case Study",
  brandColor: "#459BD7",
  logo: "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@72d3385700c07e999e37e3d8b95ebb336e7d0cb9/icons/trust-bank.png",
  eyebrow: "Case Study · Digital Banking",
  title: "Making everyday banking feel effortless for Singapore's digital-first customers",
  summary:
    "A UX research and redesign study of Trust Bank, one of Singapore's newest digital banks — from understanding how people choose a neobank to prototyping a clearer, calmer app experience.",
  meta: [
    { label: "Role", value: "UX Research · Define · Mid-fi & Prototype" },
    { label: "Team", value: "2 designers" },
    { label: "Tools", value: "FigJam · Figma" },
    { label: "Market", value: "Singapore" },
  ],
  sections: [
    {
      heading: "Overview",
      body: "Singapore's banking market is crowded with digital-first players. This project looked at where Trust Bank's app helps customers and where it gets in their way, and turned those findings into a focused redesign.",
    },
    {
      heading: "The problem",
      body: "New customers often open an account for one reason, such as a sign-up reward or a card perk, and then struggle to find a lasting reason to stay. Key everyday tasks were harder to discover than they needed to be.",
    },
    {
      heading: "Research",
      body: "We combined a competitive review of Singapore neobanks with user interviews and app walkthroughs, then synthesised the findings in FigJam into themes, personas and a customer journey.",
    },
    {
      heading: "Key insights",
      list: [
        "People judge a banking app in the first few sessions; unclear navigation erodes trust quickly.",
        "Rewards attract sign-ups, but everyday usefulness decides whether people stay.",
        "Customers want to see where their money goes without digging through menus.",
      ],
    },
    {
      heading: "Design",
      body: "From the Define phase we moved into mid-fidelity wireframes and an interactive prototype, simplifying the home screen around the tasks people do most and surfacing spending insights earlier.",
    },
    {
      heading: "Outcome",
      body: "The prototype gave the team a clear, testable direction for a more useful everyday banking experience. Full results and screens are coming soon.",
    },
  ],
};
