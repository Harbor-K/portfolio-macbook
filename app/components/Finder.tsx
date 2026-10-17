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

/** One file or folder shown in a Finder location. */
export type FinderItem = {
  id: string;
  title: string;
  image: string;
  /** "thumb" = framed rectangular preview (project covers); "icon" = an app/file icon shown as-is. */
  look: "thumb" | "icon";
  imageFit?: "cover" | "contain";
  imageBg?: string;
  tagColor?: string;
  kind: string;
  onOpen?: () => void;
};

export type FinderLocation = "projects" | "desktop" | "documents" | "downloads";

const favorites: { id: FinderLocation; name: string; icon: typeof FolderIcon }[] = [
  { id: "projects", name: "Projects", icon: FolderIcon },
  { id: "desktop", name: "Desktop", icon: MonitorIcon },
  { id: "documents", name: "Documents", icon: FileTextIcon },
  { id: "downloads", name: "Downloads", icon: CircleArrowDownIcon },
];

// Tag colors match the project tags (see data/tags.ts): clicking one filters the projects.
const tags = [
  { name: "2026", color: "var(--system-blue)" },
  { name: "2025", color: "var(--system-green)" },
  { name: "2024-2022", color: "var(--system-orange)" },
];

const glass =
  "bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl";

type Place = { type: "location"; id: FinderLocation } | { type: "tag"; name: string; color: string };

export function Finder({
  dragHandleProps,
  lights,
  locations,
}: {
  dragHandleProps: DragHandleProps;
  lights: React.ReactNode;
  locations: Record<FinderLocation, FinderItem[]>;
}) {
  const [history, setHistory] = useState<Place[]>([{ type: "location", id: "projects" }]);
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"icons" | "list">("icons");
  const place = history[cursor];

  const title = place.type === "tag" ? place.name : favorites.find((f) => f.id === place.id)!.name;
  const items =
    place.type === "tag" ? locations.projects.filter((item) => item.tagColor === place.color) : locations[place.id];

  function go(next: Place) {
    setSelected(null);
    setHistory((h) => [...h.slice(0, cursor + 1), next]);
    setCursor((c) => c + 1);
  }
  const isHere = (p: Place) =>
    p.type === place.type && (p.type === "tag" ? place.type === "tag" && place.name === p.name : place.type === "location" && place.id === p.id);

  const sideRow = (active: boolean) =>
    `flex h-[28px] w-full items-center gap-2 rounded-[7px] px-2 text-left text-[13px] ${active ? "bg-black/[0.08] text-black/85" : "text-black/80 hover:bg-black/[0.04]"}`;

  return (
    <div className="flex h-full bg-white">
      <aside
        {...dragHandleProps}
        className="m-2 mr-0 flex w-[180px] shrink-0 select-none flex-col rounded-[12px] bg-[#f0f0f2]/90 p-2 pt-3 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06)]"
      >
        <div className="mb-4 pl-[6px]">{lights}</div>
        <p className="px-2 pb-1 text-[11px] font-semibold text-black/40">Favorites</p>
        <ul onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          {favorites.map(({ id, name, icon: Icon }) => {
            const p: Place = { type: "location", id };
            return (
              <li key={id}>
                <button type="button" onClick={() => !isHere(p) && go(p)} className={sideRow(isHere(p))}>
                  <Icon className="h-4 w-4 text-[color:var(--system-blue)]" strokeWidth={1.8} />
                  {name}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 px-2 pb-1 text-[11px] font-semibold text-black/40">Tags</p>
        <ul onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          {tags.map((tag) => {
            const p: Place = { type: "tag", name: tag.name, color: tag.color };
            return (
              <li key={tag.name}>
                <button type="button" onClick={() => !isHere(p) && go(p)} className={sideRow(isHere(p))}>
                  <span className="h-[10px] w-[10px] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.35)]" style={{ background: tag.color }} />
                  {tag.name}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div {...dragHandleProps} className="flex h-[52px] shrink-0 select-none items-center gap-3 px-3">
          <div className={`flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Back"
              disabled={cursor === 0}
              onClick={() => {
                setSelected(null);
                setCursor((c) => Math.max(0, c - 1));
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-black/70 hover:bg-black/5 disabled:text-black/25 disabled:hover:bg-transparent"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Forward"
              disabled={cursor >= history.length - 1}
              onClick={() => {
                setSelected(null);
                setCursor((c) => Math.min(history.length - 1, c + 1));
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-black/70 hover:bg-black/5 disabled:text-black/25 disabled:hover:bg-transparent"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-[15px] font-semibold text-black/85">{title}</h2>
          <div className={`ml-auto flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
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
          {items.length === 0 ? (
            <p className="mt-16 text-center text-[13px] text-black/40">{title} is empty</p>
          ) : view === "icons" ? (
            /* Icons reflow to fill the width as the window is resized, like Finder's icon view. */
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-x-2 gap-y-4 pt-2" aria-label={title}>
              {items.map((item) => {
                const isSel = selected === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(item.id);
                      }}
                      onDoubleClick={() => item.onOpen?.()}
                      className="flex w-full flex-col items-center gap-1.5 outline-none"
                    >
                      <span className={`flex h-[76px] w-[100px] items-center justify-center rounded-[8px] ${isSel ? "bg-black/[0.08]" : ""}`}>
                        {item.look === "thumb" ? (
                          <img
                            src={item.image}
                            alt=""
                            className={`h-[58px] w-[84px] rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.25),0_0_0_0.5px_rgba(0,0,0,0.15)] ${item.imageFit === "contain" ? "object-contain" : "object-cover"}`}
                            style={item.imageBg ? { background: item.imageBg } : undefined}
                            draggable={false}
                          />
                        ) : (
                          <img src={item.image} alt="" className="h-[60px] w-[60px] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" draggable={false} />
                        )}
                      </span>
                      <span className={`flex max-w-[110px] items-center gap-1 rounded-[4px] px-1.5 py-px text-[12px] leading-[15px] ${isSel ? "bg-[color:var(--system-blue)] text-white" : "text-black/85"}`}>
                        {item.tagColor && <span className="h-[8px] w-[8px] shrink-0 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.45)]" style={{ background: item.tagColor }} />}
                        <span className="truncate">{item.title}</span>
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
                {items.map((item, index) => {
                  const isSel = selected === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(item.id);
                      }}
                      onDoubleClick={() => item.onOpen?.()}
                      className={`cursor-default ${isSel ? "bg-[color:var(--system-blue)] text-white" : index % 2 ? "bg-black/[0.03]" : ""}`}
                    >
                      <td className="flex items-center gap-2 rounded-l-[6px] py-1 pl-2">
                        <img
                          src={item.image}
                          alt=""
                          className={`h-4 w-5 rounded-[2px] ${item.look === "icon" || item.imageFit === "contain" ? "object-contain" : "object-cover"}`}
                          style={item.imageBg ? { background: item.imageBg } : undefined}
                        />
                        {item.title}
                      </td>
                      <td className={`rounded-r-[6px] py-1 ${isSel ? "text-white/80" : "text-black/45"}`}>{item.kind}</td>
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
