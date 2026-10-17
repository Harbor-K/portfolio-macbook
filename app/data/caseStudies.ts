// Mock case-study pages shown in the Safari-style window, one per desktop project (keyed by project title).
// GameCove / UTrada / ETO Markets: placeholder copy built only from what Harbor has shared so far —
// replace with the real case studies when they are ready.
import { trustBankArticle } from "./trustBankArticle";

export type CaseStudy = {
  url: string;
  tabTitle: string;
  brandColor: string;
  logo: string;
  /** Tailwind classes for the logo in the header (tiles with built-in padding need to be larger). */
  logoClassName?: string;
  eyebrow: string;
  title: string;
  summary: string;
  meta: { label: string; value: string }[];
  sections: { heading: string; body?: string; list?: string[] }[];
};

const icons = (commit: string, name: string) => `https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@${commit}/icons/${name}.png`;

const gameCove: CaseStudy = {
  url: "harbor.design/work/gamecove",
  tabTitle: "GameCove — Case Study",
  brandColor: "#0e0e10",
  logo: icons("50ff72b39d94c3a56d4f32656517a21f7813b82d", "gamecove"),
  logoClassName: "h-[72px] w-auto rounded-[8px]",
  eyebrow: "Case Study · AI · Game Analytics",
  title: "Turning game data into a map anyone on the team can read",
  summary:
    "GameCove is an AI game-analytics dashboard. Instead of starting from empty charts, an AI agent first analyses the game's structure and lays it out as an intuitive map, which the team then edits.",
  meta: [
    { label: "Role", value: "Product Design · UX Research" },
    { label: "Team", value: "2 designers" },
    { label: "Tools", value: "FigJam · Notion · Figma" },
    { label: "Type", value: "Team project" },
  ],
  sections: [
    {
      heading: "Overview",
      body: "Most analytics dashboards expect you to know which numbers to look at before you begin. GameCove flips that: the AI agent maps the game first, so the team starts from a picture of their game rather than a blank screen.",
    },
    {
      heading: "What makes it different",
      list: [
        "The AI agent analyses the game structure and turns it into a visual mapping.",
        "People stay in control — they review and edit the map instead of building it from scratch.",
        "The dashboard grows out of that map, so the numbers always sit in the context of the game.",
      ],
    },
    {
      heading: "Process",
      body: "Research and synthesis lived in a shared FigJam board, and usability-test records were kept in Notion. The findings shaped the setup flow and the way the AI's suggestions are presented and edited.",
    },
    {
      heading: "Outcome",
      body: "A working prototype of the core flow. Full screens, test results and learnings are coming soon.",
    },
  ],
};

const uTrada: CaseStudy = {
  url: "harbor.design/work/utrada",
  tabTitle: "UTrada — Case Study",
  brandColor: "#8300d5",
  logo: icons("ad38c9750f7951e663fc0bbe7737753291180c2f", "utrada"),
  logoClassName: "h-[72px] w-auto rounded-[8px]",
  eyebrow: "Case Study · Fintech · Trading",
  title: "Designing a trading product people can trust at a glance",
  summary:
    "Product and UI design work at UTrada, a Sydney-based trading and fintech company — making complex trading flows clearer and calmer for customers.",
  meta: [
    { label: "Role", value: "UI/UX · Product Design" },
    { label: "Company", value: "UTrada" },
    { label: "Tools", value: "Figma" },
    { label: "Based", value: "Sydney, Australia" },
  ],
  sections: [
    {
      heading: "Overview",
      body: "Trading products carry real money and real risk, so every screen has to be clear about what will happen next. This page will walk through the problems I worked on at UTrada and how the designs evolved.",
    },
    {
      heading: "Focus areas",
      list: [
        "Clear, consistent UI built on a shared design system.",
        "Information that is easy to scan before making a decision.",
        "Reducing hesitation in key moments such as funding and placing a trade.",
      ],
    },
    {
      heading: "Outcome",
      body: "Full case study, screens and results are coming soon.",
    },
  ],
};

const etoMarkets: CaseStudy = {
  url: "harbor.design/work/eto-markets",
  tabTitle: "ETO Markets — Case Study",
  brandColor: "#1d1d22",
  logo: icons("ad38c9750f7951e663fc0bbe7737753291180c2f", "eto-markets"),
  logoClassName: "h-[72px] w-auto rounded-[8px]",
  eyebrow: "Case Study · Fintech · Trading",
  title: "Making trading information clearer and easier to act on",
  summary:
    "UI/UX design at ETO Markets, a Sydney-based trading and fintech company, from November 2022 to September 2023.",
  meta: [
    { label: "Role", value: "UI/UX Design" },
    { label: "Period", value: "Nov 2022 – Sep 2023" },
    { label: "Tools", value: "Figma" },
    { label: "Based", value: "Sydney, Australia" },
  ],
  sections: [
    {
      heading: "Overview",
      body: "At ETO Markets I worked on the UI/UX of a trading product. This page will cover the main projects, the design decisions behind them and what I learned.",
    },
    {
      heading: "Focus areas",
      list: [
        "Clear flows for key moments such as onboarding and funding.",
        "Consistent components and patterns across the product.",
        "Making trading information easier to scan and act on.",
      ],
    },
    {
      heading: "Outcome",
      body: "Full case study, screens and results are coming soon.",
    },
  ],
};

export const caseStudies: Record<string, CaseStudy> = {
  "Trust Bank": trustBankArticle,
  GameCove: gameCove,
  UTrada: uTrada,
  "ETO Markets": etoMarkets,
};
