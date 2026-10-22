// The visitor's guide to the portfolio ("Scheduled"), opened from the checklist icon in the menu bar.
// Each step opens a part of the portfolio; ticking it marks it done. Ticks are kept for this visit only.
export type ChecklistStep = { id: string; title: string; tag: string };

export const checklistSections: { title: string; steps: ChecklistStep[] }[] = [
  {
    title: "Start here",
    steps: [
      { id: "intro", title: "Watch the intro", tag: "Video" },
      { id: "about", title: "About me", tag: "Profile" },
    ],
  },
  {
    title: "Projects",
    steps: [
      { id: "projects", title: "Browse all projects", tag: "4 case studies" },
      { id: "case:Trust Bank", title: "Trust Bank", tag: "Fintech · Banking" },
      { id: "case:GameCove", title: "GameCove", tag: "AI · Game analytics" },
      { id: "case:UTrada", title: "UTrada", tag: "Trading" },
      { id: "case:ETO Markets", title: "ETO Markets", tag: "Trading · Finance" },
    ],
  },
  {
    title: "Wrap up",
    steps: [
      { id: "cv", title: "Read my CV", tag: "PDF" },
      { id: "meeting", title: "Book a call with Harbor", tag: "30 min" },
    ],
  },
];

export const checklistSteps = checklistSections.flatMap((section) => section.steps);

const storageKey = "harbor.portfolio.checklist";

export function readChecklist(): string[] {
  try {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChecklist(done: string[]) {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(done));
  } catch {
    /* storage unavailable: keep for this visit only */
  }
}
