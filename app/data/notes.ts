// Notes shown in the Notes window (desktop "Notes" icon).
// Placeholder copy written for Harbor — replace with her own words. Wrap text in **double stars** for bold.
export type Note = {
  id: string;
  file: string; // shown as a small label, e.g. "philosophy.md"
  title: string;
  subtitle: string;
  date: string; // ISO date
  body: string[]; // one entry per paragraph
  images?: { src: string; alt: string }[]; // shown under the text
};

// Note photos, hosted in Harbor-K/portfolio-macbook (notes/) via jsDelivr, pinned to a commit.
const photo = "https://cdn.jsdelivr.net/gh/Harbor-K/portfolio-macbook@863bba2bce832a7e0b8d3d70d58321693c7145e4/notes";

export const notesFolder = "Notes";

export const notes: Note[] = [
  {
    id: "philosophy",
    file: "philosophy.md",
    title: "Start with the evidence",
    subtitle: "Why I look at the data before I open Figma.",
    date: "2026-10-12T15:15:00",
    body: [
      "I believe **good design starts with understanding how people actually behave**, not how we assume they do. Interviews, usage data and support tickets usually tell a clearer story than my first idea.",
      "So I begin with questions: where do people drop off, what do they search for, what do they come back to? Once the pattern is visible, the interface often designs itself.",
      "Fintech taught me this the hard way. When money is involved, **every unclear step costs trust**, and trust is very hard to win back.",
      "I still care about craft — type, spacing, motion — but craft is how I make a good decision feel effortless, not a replacement for making it.",
    ],
  },
  {
    id: "values",
    file: "values.md",
    title: "What I value in a team",
    subtitle: "The things that make my best work possible.",
    date: "2026-09-03T10:40:00",
    body: [
      "**Clarity over cleverness.** A plain sentence in a spec saves a week of rework.",
      "**Shipping to learn.** A rough prototype in front of users beats a perfect file nobody has tested.",
      "**Respect for every language.** Having designed for products in up to 11 languages, I plan for long words, right-to-left text and different reading habits from day one.",
      "**Kindness in critique.** Honest feedback, given generously, is how good teams get better.",
    ],
  },
  {
    id: "fun-fact",
    file: "fun_fact.md",
    title: "Fun fact",
    subtitle: "A British food lover, one toast at a time.",
    date: "2025-06-21T21:05:00",
    body: [
      "I'm a **British food lover**. Whenever I'm working at my computer, there's always a coffee and something sweet next to the keyboard.",
      "But my absolute favourite food is **Bovril and butter on toast**. Hot toast, a thick layer of butter, then a thin swirl of Bovril on top — salty, rich and perfect.",
      "I could happily eat it for the rest of my life, and if I could choose my very last meal, **it would be this**.",
    ],
    images: [
      { src: `${photo}/bovril-jar.jpg`, alt: "A jar of Bovril beef paste held up in a UK supermarket" },
      { src: `${photo}/bovril-toast.jpg`, alt: "A slice of toast spread with butter and Bovril" },
    ],
  },
];
