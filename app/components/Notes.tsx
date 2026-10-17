import React, { useState } from "react";
import { CheckSquareIcon, FileTextIcon, FolderPlusIcon, PanelLeftIcon, PaperclipIcon, SearchIcon, ShareIcon, SquarePenIcon, TableIcon, TypeIcon } from "lucide-react";
import type { DragHandleProps } from "./MacWindow";
import { notes, notesFolder } from "../data/notes";

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

const longDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} at ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
};

// An Apple Notes-style window (light mode): the notes listed in the sidebar, and the open note.
export function Notes({ dragHandleProps, lights }: { dragHandleProps: DragHandleProps; lights: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState(notes[0]?.id);
  const selected = notes.find((n) => n.id === selectedId) ?? notes[0];

  return (
    <div className="flex h-full bg-white text-[13px] text-black/85">
      {/* Sidebar: the notes themselves, listed under "Notes" */}
      <aside {...dragHandleProps} className="flex w-[200px] shrink-0 select-none flex-col border-r border-black/[0.08] bg-[#f0f0f2] px-2 pt-3">
        <div className="flex items-center justify-between pl-[6px] pr-1">
          {lights}
          <div className="flex items-center gap-1 text-black/50" onPointerDown={(e) => e.stopPropagation()}>
            <FolderPlusIcon className="h-[16px] w-[16px]" strokeWidth={1.7} />
            <PanelLeftIcon className="ml-2 h-[16px] w-[16px]" strokeWidth={1.7} />
          </div>
        </div>
        <p className="mt-6 px-2 pb-1 text-[11px] font-semibold text-black/40">{notesFolder}</p>
        <ul onPointerDown={(e) => e.stopPropagation()}>
          {notes.map((note) => {
            const isSel = note.id === selected?.id;
            return (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={`flex h-[30px] w-full items-center gap-2 rounded-[7px] px-2 text-left ${isSel ? "bg-black/[0.07]" : "hover:bg-black/[0.04]"}`}
                >
                  <FileTextIcon className="h-4 w-4 shrink-0" style={{ color: accent }} strokeWidth={1.8} />
                  <span className={`truncate ${isSel ? "font-semibold text-black/90" : "text-black/75"}`}>{note.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

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
              {selected.images && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {selected.images.map((img) => (
                    <img
                      key={img.src}
                      src={img.src}
                      alt={img.alt}
                      className="aspect-[3/4] w-full rounded-[10px] bg-black/[0.04] object-cover shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                      draggable={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
