import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, Mail } from "lucide-react";

// The Trust Bank case study, using the same design as Harbor's minimal portfolio
// (project-hb.magicpatterns.app/#/work/trust-bank): Helvetica Neue, dark / light tokens with a lime accent,
// a big image area, a sticky left column with the title and section links, and the long-form sections.
// It lives inside the Safari-style window, so its colours are scoped to `.hb-case` and its theme switch
// (the hanging bulb) only changes this page.

const CV_URL = "https://github.com/Harbor-K/portfolio-macbook/blob/main/cv/cv.pdf";
const EMAIL = "harborkim0328@gmail.com";

const project = {
  title: "Trust Bank",
  tagline: "Rewards that feel worth coming back to",
  overview:
    "A UX research and redesign project on Trust Bank, a Singapore digital bank. My teammate and I studied how users discover and use its rewards and travel features, then redesigned the flows from mid-fidelity wireframes to a testable prototype. I worked on research and definition, and led the mid-fi and prototype design.",
  meta: [
    { label: "Role", items: ["UX Researcher", "UI/UX Designer"] },
    { label: "Timeline", items: ["2026"] },
    { label: "Team", items: ["Jihyun (Harbor) Kim", "Dayeon"] },
    { label: "Skills", items: ["Competitive analysis", "User interviews", "Usability testing", "Prototyping"] },
  ],
  problem: "Trust Bank offers generous rewards, but value that users can't find or understand doesn't build loyalty.",
  hmw: "How might we make Trust Bank's rewards easy to understand and worth returning to?",
  research: {
    heading: "Singapore's neobank landscape and real users",
    intro:
      "We compared Trust Bank with other Singapore digital banks, mapped the information architecture of the travel section, and synthesised qualitative interviews in Dovetail.",
    categories: [
      { label: "Singapore neobanks — Trust, GXS, MariBank", count: 3 },
      { label: "Interview synthesis", count: 6 },
      { label: "Fintech infrastructure — PayNow, FAST, Singpass", count: 4 },
    ],
    insight: "Key insight from the research goes here.",
  },
  journeyHeading: "A rewards journey",
  journey: [
    { step: "Onboard", quote: "Pain point at this stage." },
    { step: "Spend", quote: "Pain point at this stage." },
    { step: "Earn rewards", quote: "Pain point at this stage." },
    { step: "Find rewards", quote: "Pain point at this stage." },
    { step: "Redeem", quote: "Pain point at this stage." },
    { step: "Travel", quote: "Pain point at this stage." },
  ],
  ideation: [
    { title: "Concept A", body: "What this concept was and why we kept or dropped it." },
    { title: "Concept B", body: "What this concept was and why we kept or dropped it." },
    { title: "Concept C", body: "What this concept was and why we kept or dropped it." },
  ],
  solution: {
    headline: "A clearer path from earning to redeeming rewards.",
    flows: [
      { title: "Rewards at a glance", caption: "Describe the redesigned rewards entry point.", screens: ["Rewards home", "Reward detail"] },
      { title: "Travel section, reorganised", caption: "Describe the new information architecture.", screens: ["Travel home", "Category", "Detail"] },
      { title: "Visual hierarchy & UX writing", caption: "Describe the copy and hierarchy changes.", screens: ["Before / after"] },
    ],
  },
  learnings: [
    { title: "Loyalty is more than points", body: "What you learned about attitudinal vs. behavioural loyalty." },
    { title: "Testing early", body: "What the usability test changed in the design." },
  ],
};

// Breakpoints measured on the page itself (it lives in a window that can be narrower than the screen).
type Size = { sm: boolean; md: boolean; lg: boolean; xl: boolean };
const SizeContext = React.createContext<Size>({ sm: true, md: true, lg: true, xl: false });

const SECTIONS = [
  { id: "tldr", label: "TL;DR" },
  { id: "problem", label: "Problem" },
  { id: "research", label: "Research" },
  { id: "ideation", label: "Ideation" },
  { id: "solution", label: "Solution" },
  { id: "learnings", label: "Learnings" },
];

const styles = `
.hb-case { --bg:#0b0d0d; --fg:#ededea; --muted:#9aa29e; --faint:#5d6461; --surface:#1a1d1c; --surface-2:#151918; --surface-hover:#202422; --line:#3a403d; --hairline:#222827; --accent-text:#e7ff1a; --accent-bg:#e7ff1a; --on-accent:#0b0d0d;
  font-family:"Helvetica Neue", Helvetica, Arial, sans-serif; color:var(--fg); background:var(--bg); font-synthesis:none; transition:background .3s, color .3s; }
.hb-case[data-theme="light"] { --bg:#f5f5f2; --fg:#141615; --muted:#5f6662; --faint:#9a9f9c; --surface:#e6e7e3; --surface-2:#ecede9; --surface-hover:#dcdeda; --line:#c6c9c5; --hairline:#dfe1dc; --accent-text:#5a6b00; --accent-bg:#e7ff1a; --on-accent:#0b0d0d; }
.hb-case ::selection { background:#e7ff1a; color:#0b0d0d; }
.hb-case .site-header { height:80px; margin:0 auto 32px; display:flex; justify-content:flex-end; align-items:flex-start; gap:10px; }
.hb-case .quick-links { display:flex; align-items:center; gap:4px; height:78px; }
.hb-case .cv-button { display:inline-flex; align-items:center; height:32px; padding:0 14px; margin-right:4px; border:1px solid var(--line); border-radius:999px; color:var(--fg); font-size:13px; font-weight:500; letter-spacing:.02em; text-decoration:none; transition:background .2s, border-color .2s, color .2s; }
.hb-case .cv-button:hover { background:var(--fg); border-color:var(--fg); color:var(--bg); }
.hb-case .icon-button { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border:0; border-radius:999px; background:transparent; color:var(--muted); cursor:pointer; transition:background .2s, color .2s; }
.hb-case .icon-button:hover { color:var(--fg); background:var(--surface); }
.hb-case .lamp { display:block; padding:0 3px; margin:0; border:0; background:none; color:var(--fg); cursor:pointer; line-height:0; }
.hb-case .lamp svg { display:block; overflow:visible; }
.hb-case .lamp-bulb { fill:transparent; opacity:.6; transition:fill .25s ease, opacity .25s ease, filter .25s ease; }
.hb-case .lamp-filament { opacity:.6; transition:opacity .25s ease; }
.hb-case .lamp:hover .lamp-bulb, .hb-case .lamp:hover .lamp-filament { opacity:1; }
.hb-case .lamp.is-on .lamp-bulb { fill:#ffe9a8; opacity:1; filter:drop-shadow(0 0 4px rgba(255,200,90,.55)); }
.hb-case .lamp.is-on .lamp-filament { opacity:1; }
`;

function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-[var(--surface)] text-[13px] tracking-[-0.01em] text-[var(--faint)] transition-colors ${className}`}
      role="img"
      aria-label="Image placeholder"
    >
      (Image)
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">{children}</p>;
}

function Heading({ children }: { children: React.ReactNode }) {
  const { md } = React.useContext(SizeContext);
  return <h2 className={`max-w-[760px] font-normal leading-[1.08] tracking-[-0.045em] ${md ? "text-[36px]" : "text-[28px]"}`}>{children}</h2>;
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 max-w-[680px] text-[16px] leading-[1.6] tracking-[-0.01em] text-[var(--muted)]">{children}</p>;
}

/* Hanging bulb theme switch: lit = light mode, unlit = dark mode. */
function LampToggle({ light, onToggle }: { light: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={light ? "lamp is-on" : "lamp"}
      onClick={onToggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={light}
      title={light ? "Dark mode" : "Light mode"}
    >
      <svg width="30" height="48" viewBox="0 0 40 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="20" y1="0" x2="20" y2="30" />
        <rect x="15.5" y="30" width="9" height="8" rx="1.5" fill="currentColor" />
        <path className="lamp-bulb" d="M16.5 38 C16.5 42 10 45 10 52 A10 10 0 0 0 30 52 C30 45 23.5 42 23.5 38 Z" />
        <path className="lamp-filament" d="M17 52 l1.5-3 1.5 3 1.5-3 1.5 3" strokeWidth="1.2" />
      </svg>
    </button>
  );
}

export function TrustBankCase({
  initialLight,
  nextTitle,
  onNext,
  onBack,
}: {
  /** Start in the light version (follows the desktop's appearance when the window opens). */
  initialLight: boolean;
  nextTitle?: string;
  onNext?: () => void;
  /** "Back" and "Home": open the list of all projects. */
  onBack: () => void;
}) {
  const p = project;
  const [light, setLight] = useState(initialLight);
  const [active, setActive] = useState(SECTIONS[0].id);
  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Highlight the section being read, like the original page (the window's page area is the scroll root).
  useEffect(() => {
    const scroller = rootRef.current?.closest("[data-readable]") ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive((visible[0].target as HTMLElement).dataset.section ?? SECTIONS[0].id);
      },
      { root: scroller, rootMargin: "-30% 0px -60% 0px" },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const size: Size = { sm: width >= 600, md: width >= 760, lg: width >= 980, xl: width >= 1260 };
  const { sm, md, lg, xl } = size;

  const scrollToSection = (id: string) => sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  const section = (id: string, children: React.ReactNode) => (
    <section
      ref={(el) => {
        sectionRefs.current[id] = el;
      }}
      data-section={id}
      className={`scroll-mt-8 border-t border-[var(--hairline)] first:border-t-0 first:pt-0 ${md ? "py-20" : "py-16"}`}
    >
      {children}
    </section>
  );

  return (
    <div ref={rootRef} className={`hb-case min-h-full w-full ${md ? "px-6 pb-6" : sm ? "px-4 pb-4" : "px-3 pb-3"}`} data-theme={light ? "light" : "dark"}>
      <style>{styles}</style>
      <SizeContext.Provider value={size}>
      <div className="mx-auto w-full max-w-[1680px]">
        <header className="site-header">
          <nav className="quick-links" aria-label="Quick links">
            <a className="cv-button" href={CV_URL} target="_blank" rel="noreferrer">
              CV
            </a>
            <a className="icon-button" href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`} title={EMAIL}>
              <Mail size={18} strokeWidth={1.6} aria-hidden="true" />
            </a>
          </nav>
          <LampToggle light={light} onToggle={() => setLight((v) => !v)} />
        </header>

        <ImagePlaceholder className={md ? "h-[min(72vh,760px)] min-h-[280px]" : "h-[44vh] min-h-[280px]"} />

        <div className={lg ? "mt-14 grid grid-cols-[minmax(220px,0.5fr)_minmax(0,1.5fr)] gap-16" : "mt-10 grid gap-10"}>
          <aside className={lg ? "sticky top-6 self-start" : ""}>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
            >
              <ArrowLeftIcon size={14} aria-hidden="true" />
              Back
            </button>
            <h1 className={`mt-4 font-normal leading-[0.98] tracking-[-0.06em] ${md ? "text-[52px]" : "text-[40px]"}`}>{p.title}</h1>
            <p className="mt-3 max-w-[300px] text-[15px] leading-[1.4] text-[var(--muted)]">{p.tagline}</p>
            <nav aria-label="Case study sections" className={lg ? "mt-8 block" : "hidden"}>
              <ul className="space-y-2">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(s.id)}
                      className={`text-[12px] font-medium uppercase tracking-[0.08em] transition-colors ${
                        active === s.id ? "text-[var(--accent-text)]" : "text-[var(--faint)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0">
            {section(
              "tldr",
              <>
                <Eyebrow>TL;DR</Eyebrow>
                <Heading>Overview</Heading>
                <Body>{p.overview}</Body>
                <dl className={`mt-10 grid gap-x-6 gap-y-8 ${md ? "grid-cols-4" : "grid-cols-2"}`}>
                  {p.meta.map((m) => (
                    <div key={m.label}>
                      <dt className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">{m.label}</dt>
                      {m.items.map((item, i) => (
                        <dd key={i} className="text-[15px] leading-[1.5] text-[var(--fg)]">
                          {item}
                        </dd>
                      ))}
                    </div>
                  ))}
                </dl>
              </>,
            )}

            {section(
              "problem",
              <>
                <Eyebrow>The Problem</Eyebrow>
                <Heading>{p.problem}</Heading>
                <p className="mt-6 text-[18px] italic leading-[1.4] tracking-[-0.02em] text-[var(--accent-text)]">{p.hmw}</p>
              </>,
            )}

            {section(
              "research",
              <>
                <Eyebrow>Research</Eyebrow>
                <Heading>{p.research.heading}</Heading>
                <Body>{p.research.intro}</Body>
                {p.research.categories.map((cat) => (
                  <div key={cat.label} className="mt-10">
                    <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">{cat.label}</p>
                    <div className={`grid gap-3 ${md ? "grid-cols-8" : sm ? "grid-cols-6" : "grid-cols-4"}`}>
                      {Array.from({ length: cat.count }).map((_, j) => (
                        <ImagePlaceholder key={j} className="aspect-square text-[11px]" />
                      ))}
                    </div>
                  </div>
                ))}
                <div className={`mt-12 rounded-xl border border-[var(--line)] ${md ? "p-8" : "p-6"}`}>
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--accent-text)]">Key Insight</p>
                  <p className="mt-3 max-w-[640px] text-[20px] leading-[1.35] tracking-[-0.03em]">{p.research.insight}</p>
                </div>
                <div className="mt-16">
                  <Heading>{p.journeyHeading}</Heading>
                  <ol className={`mt-8 grid gap-3 ${lg ? "grid-cols-3" : sm ? "grid-cols-2" : ""}`}>
                    {p.journey.map((j, i) => (
                      <li key={i} className="rounded-xl bg-[var(--surface-2)] p-5">
                        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
                          [{i + 1}] {j.step}
                        </p>
                        <p className="mt-3 text-[15px] leading-[1.45] text-[var(--fg)]">“{j.quote}”</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </>,
            )}

            {section(
              "ideation",
              <>
                <Eyebrow>Ideation</Eyebrow>
                <Heading>Exploring different solutions</Heading>
                <div className={`mt-10 flex snap-x gap-4 overflow-x-auto pb-2 ${md ? "" : sm ? "-mx-4 px-4" : "-mx-3 px-3"}`}>
                  {p.ideation.map((idea) => (
                    <div key={idea.title} className={`shrink-0 snap-start ${xl ? "w-[32%]" : sm ? "w-[46%]" : "w-[78%]"}`}>
                      <ImagePlaceholder className="aspect-[4/5]" />
                      <p className="mt-4 text-[16px] tracking-[-0.02em]">{idea.title}</p>
                      <p className="mt-2 text-[14px] leading-[1.55] text-[var(--muted)]">{idea.body}</p>
                    </div>
                  ))}
                </div>
              </>,
            )}

            {section(
              "solution",
              <>
                <Eyebrow>The Solution</Eyebrow>
                <Heading>{p.solution.headline}</Heading>
                <div className="mt-12 space-y-16">
                  {p.solution.flows.map((s) => (
                    <div key={s.title}>
                      <p className="text-[20px] tracking-[-0.03em]">{s.title}</p>
                      <p className="mt-2 max-w-[640px] text-[15px] leading-[1.6] text-[var(--muted)]">{s.caption}</p>
                      <div className={`mt-6 grid gap-3 ${md ? "grid-cols-3" : "grid-cols-2"}`}>
                        {s.screens.map((cap, i) => (
                          <figure key={i}>
                            <ImagePlaceholder className="aspect-[9/16]" />
                            <figcaption className="mt-2 text-[13px] text-[var(--muted)]">{cap}</figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>,
            )}

            {section(
              "learnings",
              <>
                <Eyebrow>Learnings</Eyebrow>
                <Heading>Key takeaways</Heading>
                <ImagePlaceholder className="mt-10 aspect-video" />
                <div className={`mt-10 grid gap-8 ${md ? "grid-cols-2" : ""}`}>
                  {p.learnings.map((l) => (
                    <div key={l.title}>
                      <p className="text-[18px] tracking-[-0.02em]">{l.title}</p>
                      <p className="mt-2 text-[15px] leading-[1.6] text-[var(--muted)]">{l.body}</p>
                    </div>
                  ))}
                </div>
              </>,
            )}

            {onNext && nextTitle && (
              <button
                type="button"
                onClick={onNext}
                className={`group mt-4 flex w-full items-center justify-between rounded-xl bg-[var(--accent-bg)] text-left text-[var(--on-accent)] transition-transform duration-200 hover:-translate-y-0.5 ${md ? "p-8" : "p-6"}`}
              >
                <span>
                  <span className="block text-[12px] font-medium uppercase tracking-[0.08em] opacity-60">Next project</span>
                  <span className={`mt-1 block leading-[1] tracking-[-0.05em] ${md ? "text-[36px]" : "text-[28px]"}`}>{nextTitle}</span>
                </span>
                <ArrowRightIcon className="transition-transform group-hover:translate-x-1" size={28} aria-hidden="true" />
              </button>
            )}
          </article>
        </div>

        <footer className={`mt-20 grid gap-8 border-t border-[var(--hairline)] pb-6 pt-10 ${md ? "grid-cols-[1.5fr_1fr_1fr]" : ""}`}>
          <p className="max-w-[460px] text-[28px] leading-[1.02] tracking-[-0.055em]">Harbor (Jihyun) Kim</p>
          <div className="text-[14px] leading-[1.8]">
            <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Navigation</p>
            <button type="button" onClick={onBack} className="block hover:text-[var(--accent-text)]">
              Home
            </button>
          </div>
          <div className="text-[14px] leading-[1.8]">
            <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Let's chat</p>
            <a href={`mailto:${EMAIL}`} className="block hover:text-[var(--accent-text)]">
              Email
            </a>
            <a href="https://www.instagram.com/harbor_0328/" target="_blank" rel="noreferrer" className="block hover:text-[var(--accent-text)]">
              Instagram
            </a>
          </div>
        </footer>
      </div>
      </SizeContext.Provider>
    </div>
  );
}
