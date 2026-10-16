import React, { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleArrowDownIcon,
  FileTextIcon,
  FolderIcon,
  LayoutGridIcon,
  ListIcon,
  MonitorIcon,
  SearchIcon,
} from "lucide-react";
import type { DragHandleProps } from "./MacWindow";
import { projects } from "../data/portfolio";
import { tagColorFor } from "../data/tags";

const favorites = [
  { name: "Projects", icon: FolderIcon },
  { name: "Desktop", icon: MonitorIcon },
  { name: "Documents", icon: FileTextIcon },
  { name: "Downloads", icon: CircleArrowDownIcon },
];

const tags = [
  { name: "Blue", color: "var(--system-blue)" },
  { name: "Green", color: "var(--system-green)" },
  { name: "Orange", color: "var(--system-orange)" },
];

const glass =
  "bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl";

export function Finder({ dragHandleProps, lights }: { dragHandleProps: DragHandleProps; lights: React.ReactNode }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"icons" | "list">("icons");

  return (
    <div className="flex h-full bg-white">
      <aside
        {...dragHandleProps}
        className="m-2 mr-0 flex w-[180px] shrink-0 select-none flex-col rounded-[12px] bg-[#f0f0f2]/90 p-2 pt-3 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06)]"
      >
        <div className="mb-4 pl-[6px]">{lights}</div>
        <p className="px-2 pb-1 text-[11px] font-semibold text-black/40">Favorites</p>
        <ul>
          {favorites.map(({ name, icon: Icon }) => (
            <li key={name}>
              <button
                type="button"
                className={`flex h-[28px] w-full items-center gap-2 rounded-[7px] px-2 text-left text-[13px] ${
                  name === "Projects" ? "bg-black/[0.08] text-black/85" : "text-black/80 hover:bg-black/[0.04]"
                }`}
              >
                <Icon className="h-4 w-4 text-[color:var(--system-blue)]" strokeWidth={1.8} />
                {name}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 px-2 pb-1 text-[11px] font-semibold text-black/40">Tags</p>
        <ul>
          {tags.map((tag) => (
            <li key={tag.name} className="flex h-[28px] items-center gap-2 px-2 text-[13px] text-black/80">
              <span className="h-[10px] w-[10px] rounded-full" style={{ background: tag.color }} />
              {tag.name}
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div {...dragHandleProps} className="flex h-[52px] shrink-0 select-none items-center gap-3 px-3">
          <div className={`flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Back" className="flex h-7 w-7 items-center justify-center rounded-full text-black/70 hover:bg-black/5">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Forward" className="flex h-7 w-7 items-center justify-center rounded-full text-black/30" disabled>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-[15px] font-semibold text-black/85">Projects</h2>
          <div className={`ml-auto flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Icon view" onClick={() => setView("icons")} className={`flex h-7 w-8 items-center justify-center rounded-full ${view === "icons" ? "bg-black/[0.08] text-black/85" : "text-black/55"}`}>
              <LayoutGridIcon className="h-[15px] w-[15px]" />
            </button>
            <button type="button" aria-label="List view" onClick={() => setView("list")} className={`flex h-7 w-8 items-center justify-center rounded-full ${view === "list" ? "bg-black/[0.08] text-black/85" : "text-black/55"}`}>
              <ListIcon className="h-[15px] w-[15px]" />
            </button>
          </div>
          <div className={`flex h-8 w-[170px] items-center gap-1.5 rounded-full px-3 ${glass}`} onPointerDown={(e) => e.stopPropagation()}>
            <SearchIcon className="h-[14px] w-[14px] text-black/45" />
            <span className="text-[13px] text-black/35">Search</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4" onClick={() => setSelected(null)}>
          {view === "icons" ? (
            <ul className="grid grid-cols-4 gap-x-2 gap-y-4 pt-2" aria-label="Projects">
              {projects.map((project, index) => {
                const isSel = selected === project.title;
                return (
                  <li key={project.title}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(project.title);
                      }}
                      className="flex w-full flex-col items-center gap-1.5 outline-none"
                    >
                      <span className={`flex h-[76px] w-[100px] items-center justify-center rounded-[8px] ${isSel ? "bg-black/[0.08]" : ""}`}>
                        <img src={project.image} alt="" className="h-[58px] w-[84px] rounded-[3px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.25),0_0_0_0.5px_rgba(0,0,0,0.15)]" />
                      </span>
                      <span className={`flex max-w-[110px] items-center gap-1 rounded-[4px] px-1.5 py-px text-[12px] leading-[15px] ${isSel ? "bg-[color:var(--system-blue)] text-white" : "text-black/85"}`}>
                        <span className="h-[7px] w-[7px] shrink-0 rounded-full ring-1 ring-white/70" style={{ background: tagColorFor(index) }} />
                        <span className="truncate">{project.title}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-[11px] font-semibold text-black/45">
                  <th className="py-1.5 pl-2 font-semibold">Name</th>
                  <th className="py-1.5 font-semibold">Kind</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => {
                  const isSel = selected === project.title;
                  return (
                    <tr
                      key={project.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(project.title);
                      }}
                      className={`cursor-default ${isSel ? "bg-[color:var(--system-blue)] text-white" : index % 2 ? "bg-black/[0.03]" : ""}`}
                    >
                      <td className="flex items-center gap-2 rounded-l-[6px] py-1 pl-2">
                        <img src={project.image} alt="" className="h-4 w-5 rounded-[2px] object-cover" />
                        {project.title}
                      </td>
                      <td className={`rounded-r-[6px] py-1 ${isSel ? "text-white/80" : "text-black/45"}`}>Case study</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
