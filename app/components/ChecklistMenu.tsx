import React, { useState } from "react";
import { checklistSections, checklistSteps, readChecklist, saveChecklist, type ChecklistStep } from "../data/checklist";
import { meeting } from "../data/meeting";

// The visitor's checklist ("Scheduled"), dropped down from its menu bar icon like a macOS status menu:
// a dark rounded panel with a header row (icon, title, progress), grey section labels, single-line rows
// separated by thin lines, and an action row at the bottom. Clicking the icon again closes it.
// A row opens that part of the portfolio and closes the menu; its round tick-box marks it done
// (completed rows are hidden until "Show completed").
export function ChecklistMenu({
  icon,
  onNavigate,
  onClose,
}: {
  icon: React.ReactNode;
  onNavigate: (step: string) => void;
  onClose: () => void;
}) {
  const [done, setDone] = useState<string[]>(readChecklist);
  const [showCompleted, setShowCompleted] = useState(false);
  const completed = checklistSteps.filter((step) => done.includes(step.id)).length;

  const toggle = (id: string) =>
    setDone((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      saveChecklist(next);
      return next;
    });

  return (
    <div
      role="dialog"
      aria-label="Scheduled"
      onClick={(event) => event.stopPropagation()}
      className="max-h-[calc(100vh-44px)] w-[312px] overflow-y-auto rounded-[14px] border border-white/[0.14] bg-[#2a2a2c] p-[6px] text-left text-[13px] font-normal leading-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] [text-shadow:none]"
    >
      <div className="flex items-center gap-[10px] px-[8px] py-[6px]">
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-white/[0.12] text-[#ff6961]">{icon}</span>
        <span className="min-w-0 flex-1 text-[14px] font-medium leading-[18px]">Scheduled</span>
        <span className="shrink-0 text-[12px] tabular-nums text-white/45">
          {completed} of {checklistSteps.length} done
        </span>
      </div>

      {checklistSections.map((section) => {
        const visible = section.steps.filter((step) => showCompleted || !done.includes(step.id));
        return (
          <section key={section.title}>
            <Separator />
            <p className="px-[10px] pb-[3px] pt-[4px] text-[12px] font-semibold leading-[16px] text-white/40">{section.title}</p>
            {visible.length === 0 ? (
              <p className="px-[10px] py-[7px] text-white/35">All done</p>
            ) : (
              visible.map((step) => (
                <Row
                  key={step.id}
                  step={step}
                  done={done.includes(step.id)}
                  onToggle={() => toggle(step.id)}
                  onOpen={() => {
                    if (step.id !== "meeting") onNavigate(step.id);
                    onClose();
                  }}
                />
              ))
            )}
          </section>
        );
      })}

      <Separator />
      <button
        type="button"
        onClick={() => setShowCompleted((v) => !v)}
        disabled={completed === 0 && !showCompleted}
        className="flex w-full items-center rounded-[8px] px-[10px] py-[7px] text-left text-white/90 hover:bg-white/[0.1] disabled:text-white/30 disabled:hover:bg-transparent"
      >
        {showCompleted ? "Hide completed" : `Show completed${completed ? ` (${completed})` : ""}`}
      </button>
    </div>
  );
}

function Separator() {
  return <div aria-hidden="true" className="mx-[10px] my-[5px] h-px bg-white/[0.12]" />;
}

// One line: a round tick-box, the step's name, and its tag on the right (like a shortcut in a macOS menu).
function Row({ step, done, onToggle, onOpen }: { step: ChecklistStep; done: boolean; onToggle: () => void; onOpen: () => void }) {
  const label = (
    <>
      <span className={`min-w-0 flex-1 truncate ${done ? "text-white/40" : "text-white/90"}`}>{step.title}</span>
      <span className="shrink-0 text-[12px] text-white/40">{step.tag}</span>
    </>
  );
  const labelClass = "flex min-w-0 flex-1 items-center gap-3 py-[7px] text-left";
  return (
    <div className="flex items-center gap-[8px] rounded-[8px] px-[6px] hover:bg-white/[0.1]">
      <button
        type="button"
        aria-label={`Mark ${step.title} ${done ? "not done" : "done"}`}
        aria-pressed={done}
        onClick={onToggle}
        className="group flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full"
      >
        <span
          className={`flex h-[16px] w-[16px] items-center justify-center rounded-full border-[1.5px] ${
            done ? "border-[#ff453a]" : "border-white/35 group-hover:border-[#ff6961]"
          }`}
        >
          {done && <span className="h-[8px] w-[8px] rounded-full bg-[#ff453a]" />}
        </span>
      </button>
      {/* "Book a call" opens Harbor's Cal.com page in a new tab; every other step opens a window on the desktop. */}
      {step.id === "meeting" ? (
        <a href={meeting.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={onOpen} className={labelClass}>
          {label}
        </a>
      ) : (
        <button type="button" onClick={onOpen} className={labelClass}>
          {label}
        </button>
      )}
    </div>
  );
}
