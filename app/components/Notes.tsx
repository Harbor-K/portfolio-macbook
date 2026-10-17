import React, { useState } from "react";
import { CheckSquareIcon, FolderIcon, FolderPlusIcon, PanelLeftIcon, PaperclipIcon, SearchIcon, ShareIcon, SquarePenIcon, TableIcon, TypeIcon } from "lucide-react";
import type { DragHandleProps } from "./MacWindow";
import { notes, notesFolder, type Note } from "../data/notes";

const glass =
  "bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl";

// Notes yellow (light mode accent).
const accent = "#e8a400";

// **bold** inline markup -> <strong>
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-black/90">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
const longDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} at ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
};
const preview = (note: Note) => note.body[0].replace(/\*\*/g, "");

// An Apple Notes-style window (light mode): folders, a note list grouped by year, and the open note.
export function Notes({ dragHandleProps, lights }: { dragHandleProps: DragHandleProps; lights: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState(notes[0]?.id);
  const selected = notes.find((n) => n.id === selectedId) ?? notes[0];
  const years = [...new Set(notes.map((n) => new Date(n.date).getFullYear()))].sort((a, b) => b - a);

  return (
    <div className="flex h-full bg-white text-[13px] text-black/85">
      {/* Sidebar */}
      <aside {...dragHandleProps} className="flex w-[170px] shrink-0 select-none flex-col border-r border-black/[0.08] bg-[#f0f0f2] px-2 pt-3">
        <div className="flex items-center justify-between pl-[6px] pr-1">
          {lights}
          <div className="flex items-center gap-1 text-black/50" onPointerDown={(e) => e.stopPropagation()}>
            <FolderPlusIcon className="h-[16px] w-[16px]" strokeWidth={1.7} />
            <PanelLeftIcon className="ml-2 h-[16px] w-[16px]" strokeWidth={1.7} />
          </div>
        </div>
        <p className="mt-6 px-2 pb-1 text-[11px] font-semibold text-black/40">iCloud</p>
        <div className="flex h-[30px] items-center gap-2 rounded-[7px] bg-black/[0.07] px-2">
          <FolderIcon className="h-4 w-4" style={{ color: accent }} strokeWidth={1.8} />
          <span className="flex-1 font-medium" style={{ color: accent }}>
            {notesFolder}
          </span>
          <span className="text-black/40">{notes.length}</span>
        </div>
        <p className="mt-5 px-2 pb-1 text-[11px] font-semibold text-black/40">Tags</p>
      </aside>

      {/* Note list */}
      <section className="flex w-[220px] shrink-0 flex-col border-r border-black/[0.08] bg-[#fafafa]">
        <div {...dragHandleProps} className="flex h-[52px] shrink-0 select-none flex-col justify-center px-4">
          <p className="text-[15px] font-bold leading-5">{notesFolder}</p>
          <p className="text-[12px] text-black/45">{notes.length} notes</p>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-2 pb-3">
          {years.map((year) => (
            <div key={year}>
              <h3 className="border-b border-black/[0.08] px-2 pb-1 pt-3 text-[15px] font-bold">{year}</h3>
              <ul className="pt-1">
                {notes
                  .filter((n) => new Date(n.date).getFullYear() === year)
                  .map((note) => {
                    const isSel = note.id === selected?.id;
                    return (
                      <li key={note.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(note.id)}
                          className={`w-full rounded-[8px] px-3 py-2 text-left ${isSel ? "bg-[#ffe9a8]" : "hover:bg-black/[0.03]"}`}
                        >
                          <span className="block truncate font-semibold">{note.title}</span>
                          <span className="flex gap-2 text-[12px]">
                            <span className="shrink-0 text-black/70">{shortDate(note.date)}</span>
                            <span className="truncate text-black/40">{preview(note)}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Editor */}
      <section className="flex min-w-0 flex-1 flex-col">
        <div {...dragHandleProps} className="flex h-[52px] shrink-0 select-none items-center gap-2 px-3">
          <div className={`flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()}>
            <span className="flex h-7 w-8 items-center justify-center text-black/55">
              <SquarePenIcon className="h-[15px] w-[15px]" />
            </span>
          </div>
          <div className={`flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()}>
            {[TypeIcon, CheckSquareIcon, TableIcon, PaperclipIcon].map((Icon, i) => (
              <span key={i} className="flex h-7 w-8 items-center justify-center text-black/55">
                <Icon className="h-[15px] w-[15px]" />
              </span>
            ))}
          </div>
          <span className={`flex h-8 w-9 items-center justify-center rounded-full text-black/55 ${glass}`}>
            <ShareIcon className="h-[15px] w-[15px]" />
          </span>
          <div className={`ml-auto flex h-8 w-[150px] items-center gap-1.5 rounded-full px-3 ${glass}`} onPointerDown={(e) => e.stopPropagation()}>
            <SearchIcon className="h-[14px] w-[14px] text-black/45" />
            <span className="text-black/35">Search</span>
          </div>
        </div>

        {selected && (
          <article className="min-h-0 flex-1 select-text overflow-auto px-7 pb-12 pt-3">
            <p className="text-center text-[12px] text-black/40">{longDate(selected.date)}</p>
            <div className="mx-auto mt-5 max-w-[620px]">
              <p className="flex justify-between border-b border-black/[0.08] pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">
                <span>Note {String(notes.indexOf(selected) + 1).padStart(2, "0")}</span>
                <span>{selected.file}</span>
              </p>
              <h1 className="mt-4 text-[24px] font-bold leading-[30px] tracking-[-0.01em]">{selected.title}</h1>
              <p className="mt-1 text-[14px] leading-5 text-black/45">{selected.subtitle}</p>
              <div className="mt-5 space-y-4 text-[15px] leading-[1.65] text-black/75">
                {selected.body.map((para, i) => (
                  <p key={i}>{renderInline(para)}</p>
                ))}
              </div>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
