import React, { useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import type { DragHandleProps } from "./MacWindow";
import { MeetingBooking } from "./MeetingBooking";

// A visitor's guide to the portfolio, laid out like the "Scheduled" list in Apple Reminders:
// a big red title, a "N Completed · Show" row, grouped sections, and round tick-boxes.
// Clicking an item opens that part of the portfolio; ticking it marks it done (hidden until "Show").
type Step = { id: string; title: string; note: string; tag: string };
const sections: { title: string; caption?: string; steps: Step[] }[] = [
  {
    title: "Start here",
    caption: "A quick hello",
    steps: [
      { id: "intro", title: "Watch the intro", note: "Intro", tag: "Video" },
      { id: "about", title: "About me", note: "Intro", tag: "Profile" },
    ],
  },
  {
    title: "Projects",
    caption: "Selected work",
    steps: [
      { id: "projects", title: "Browse all projects", note: "Finder", tag: "4 case studies" },
      { id: "case:Trust Bank", title: "Trust Bank", note: "Case study", tag: "Fintech · Banking" },
      { id: "case:GameCove", title: "GameCove", note: "Case study", tag: "AI · Game analytics" },
      { id: "case:UTrada", title: "UTrada", note: "Case study", tag: "Trading" },
      { id: "case:ETO Markets", title: "ETO Markets", note: "Case study", tag: "Trading · Finance" },
    ],
  },
  {
    title: "Wrap up",
    caption: "Let's talk",
    steps: [
      { id: "cv", title: "Read my CV", note: "Preview", tag: "PDF" },
      { id: "meeting", title: "Book a call with Harbor", note: "Video call", tag: "30 min" },
    ],
  },
];
const allSteps = sections.flatMap((s) => s.steps);

function readDone(): string[] {
  try {
    const raw = sessionStorage.getItem("harbor.portfolio.checklist");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function Reminders({
  dragHandleProps,
  lights,
  onNavigate,
}: {
  dragHandleProps: DragHandleProps;
  lights: React.ReactNode;
  onNavigate?: (step: string) => void;
}) {
  const [done, setDone] = useState<string[]>(readDone);
  const [showCompleted, setShowCompleted] = useState(false);
  const [booking, setBooking] = useState(false);

  const toggle = (id: string) => {
    setDone((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      try {
        sessionStorage.setItem("harbor.portfolio.checklist", JSON.stringify(next));
      } catch {
        /* storage unavailable: keep for this visit only */
      }
      return next;
    });
  };

  // Without navigation (the phone layout's "Meet" page) there is nothing to open, so show the booking straight away.
  if (!onNavigate) return <MeetingBooking dragHandleProps={dragHandleProps} lights={lights} />;
  if (booking)
    return (
      <div className="relative flex h-full flex-col bg-white">
        <button
          type="button"
          onClick={() => setBooking(false)}
          className="absolute right-4 top-3 z-10 flex items-center gap-1 rounded-md bg-black/[0.06] px-2 py-1 text-[12px] text-black/70 hover:bg-black/[0.1]"
        >
          <ArrowLeftIcon size={13} /> Scheduled
        </button>
        <MeetingBooking dragHandleProps={dragHandleProps} lights={lights} />
      </div>
    );

  const completed = allSteps.filter((s) => done.includes(s.id)).length;

  return (
    <div className="flex h-full flex-col bg-white text-black/85">
      <div {...dragHandleProps} className="flex h-[44px] shrink-0 select-none items-center px-4">
        {lights}
      </div>
      <div data-readable="" className="min-h-0 flex-1 overflow-auto px-5 pb-6">
        <h1 className="text-[34px] font-bold leading-[40px] tracking-[-0.01em] text-[#ff453a]">Scheduled</h1>

        <div className="mt-3 flex items-center justify-between border-b border-black/10 pb-2.5 text-[14px]">
          <span className="text-black/45">{completed} Completed</span>
          <button type="button" onClick={() => setShowCompleted((v) => !v)} className="text-[#ff453a] hover:opacity-80">
            {showCompleted ? "Hide" : "Show"}
          </button>
        </div>

        {sections.map((section, si) => {
          const visible = section.steps.filter((s) => showCompleted || !done.includes(s.id));
          return (
            <section key={section.title} className={si > 0 ? "border-t-2 border-black/10" : ""}>
              <h2 className="pt-3.5 text-[19px] font-bold leading-[24px] text-black/85">{section.title}</h2>
              {section.caption && <p className="mt-1.5 text-[12px] font-semibold text-black/45">{section.caption}</p>}
              {visible.length === 0 ? (
                <p className="py-3 text-[13px] text-black/35">All done</p>
              ) : (
                <ul>
                  {visible.map((step, i) => {
                    const isDone = done.includes(step.id);
                    return (
                      <li key={step.id} className={`flex items-start gap-3 py-2.5 ${i < visible.length - 1 ? "border-b border-black/[0.08]" : ""}`}>
                        <button
                          type="button"
                          aria-label={`Mark ${step.title} ${isDone ? "not done" : "done"}`}
                          aria-pressed={isDone}
                          onClick={() => toggle(step.id)}
                          className={`mt-[1px] flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                            isDone ? "border-[#ff453a]" : "border-black/25 hover:border-[#ff453a]"
                          }`}
                        >
                          {isDone && <span className="h-[12px] w-[12px] rounded-full bg-[#ff453a]" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => (step.id === "meeting" ? setBooking(true) : onNavigate(step.id))}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span className={`block text-[14px] leading-[18px] ${isDone ? "text-black/40" : "text-black/85"}`}>{step.title}</span>
                          <span className="mt-0.5 block text-[13px] leading-[17px] text-black/45">
                            {step.note}&nbsp;&nbsp;<span className="text-[#ff453a]">{step.tag}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
