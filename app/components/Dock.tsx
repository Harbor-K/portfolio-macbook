import React, { type ReactNode, useEffect, useRef, useState } from "react";
import {
  ApertureIcon,
  BookOpenIcon,
  CodeIcon,
  FolderIcon,
  GlobeIcon,
  ListChecksIcon,
  MessageCircleIcon,
  PenToolIcon,
  SettingsIcon,
  StickyNoteIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react";
import type { DockApp, DockGlyph } from "../data/dock";

const glyphs: Record<DockGlyph, LucideIcon> = {
  folder: FolderIcon,
  list: ListChecksIcon,
  settings: SettingsIcon,
  globe: GlobeIcon,
  book: BookOpenIcon,
  pen: PenToolIcon,
  aperture: ApertureIcon,
  note: StickyNoteIcon,
  message: MessageCircleIcon,
  code: CodeIcon,
  trash: Trash2Icon,
};

/** A window sent to the Dock with the yellow button. Shown after its own divider at the right end, as on macOS. */
export type MinimizedWindow = { id: string; title: string; thumb: ReactNode; onRestore: () => void };

type DockProps = {
  sections: DockApp[][];
  isRunning: (app: DockApp) => boolean;
  onOpen: (app: DockApp) => void;
  minimized?: MinimizedWindow[];
};

// Matches Harbor's real Dock: three groups split by thin dividers, red badges, running dots,
// a light Liquid Glass shelf, and no magnification (the macOS default).
// Like macOS "Automatically hide and show the Dock": it stays tucked below the screen and slides up when
// the pointer reaches the bottom edge (or it gets keyboard focus), then slides away again shortly after
// the pointer leaves. It also pops up briefly when a window is minimized into it.
export function Dock({ sections, isRunning, onOpen, minimized = [] }: DockProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const hideTimer = useRef<number | undefined>(undefined);

  function show() {
    window.clearTimeout(hideTimer.current);
    setShown(true);
  }
  function hideSoon(delay = 400) {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShown(false), delay);
  }
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  // Show the Dock while a window minimizes into it (or is restored from it), then tuck it away again.
  const minimizedCount = minimized.length;
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    show();
    hideSoon(1600);
  }, [minimizedCount]);

  return (
    <>
    {/* Invisible strip along the bottom edge: reaching it brings the Dock up. */}
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[89] h-[10px]" onMouseEnter={show} onPointerDown={show} />
    <nav
      aria-label="Dock"
      onMouseEnter={show}
      onMouseLeave={() => hideSoon()}
      onFocus={show}
      onBlur={() => hideSoon()}
      className={`absolute bottom-[6px] left-1/2 z-[90] -translate-x-1/2 transition-[transform,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+12px)] opacity-0"
      }`}
    >
      <div className="flex items-center gap-[12px] rounded-[22px] border border-white/40 bg-white/25 p-[9px] shadow-[0_10px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-[30px] backdrop-saturate-[1.6] transition-[width] duration-300">
        {sections.map((section, sectionIndex) => (
          <React.Fragment key={sectionIndex}>
            {sectionIndex > 0 && <span className="h-[46px] w-px shrink-0 bg-black/20" aria-hidden="true" />}
            {section.map((app) => (
              <DockItem
                key={app.id}
                app={app}
                running={isRunning(app)}
                showLabel={hovered === app.id}
                onHover={() => setHovered(app.id)}
                onLeave={() => setHovered((current) => (current === app.id ? null : current))}
                onOpen={() => onOpen(app)}
              />
            ))}
          </React.Fragment>
        ))}
        {/* Minimized windows sit at the right end, after their own divider, as on macOS. */}
        {minimized.length > 0 && <span className="h-[46px] w-px shrink-0 bg-black/20" aria-hidden="true" />}
        {minimized.map((win) => (
          <MinimizedItem
            key={win.id}
            win={win}
            showLabel={hovered === `min-${win.id}`}
            onHover={() => setHovered(`min-${win.id}`)}
            onLeave={() => setHovered((current) => (current === `min-${win.id}` ? null : current))}
          />
        ))}
      </div>
    </nav>
    </>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute -top-[44px] whitespace-nowrap rounded-[8px] border border-black/10 bg-white/80 px-3 py-[4px] text-[13px] text-black/85 shadow-[0_4px_14px_rgba(0,0,0,0.15)] backdrop-blur-xl">
      {label}
    </span>
  );
}

function MinimizedItem({ win, showLabel, onHover, onLeave }: { win: MinimizedWindow; showLabel: boolean; onHover: () => void; onLeave: () => void }) {
  return (
    <div className="relative flex animate-[dockIn_300ms_ease-out] flex-col items-center" onMouseEnter={onHover} onMouseLeave={onLeave}>
      <style>{`@keyframes dockIn { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }`}</style>
      {showLabel && <Tooltip label={win.title} />}
      <button
        type="button"
        aria-label={`Restore ${win.title}`}
        onClick={win.onRestore}
        className="flex h-[52px] min-w-[52px] items-center justify-center rounded-[8px] outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[color:var(--system-blue)]"
      >
        {win.thumb}
      </button>
    </div>
  );
}

function DockItem({
  app,
  running,
  showLabel,
  onHover,
  onLeave,
  onOpen,
}: {
  app: DockApp;
  running: boolean;
  showLabel: boolean;
  onHover: () => void;
  onLeave: () => void;
  onOpen: () => void;
}) {
  const Glyph = glyphs[app.glyph];
  const label = app.badge ? `${app.name}, ${app.badge} notification${app.badge > 1 ? "s" : ""}` : app.name;

  const tile = app.imageUrl ? (
    <img src={app.imageUrl} alt="" className="h-[52px] w-[52px] object-contain" draggable={false} />
  ) : (
    <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[22.5%] bg-gradient-to-b from-white/95 to-[#e6e6eb] shadow-[0_1px_3px_rgba(0,0,0,0.18),inset_0_0_0_0.5px_rgba(0,0,0,0.1)]">
      <Glyph className="h-6 w-6 text-black/45" strokeWidth={1.7} />
    </span>
  );

  const content = (
    <>
      {tile}
      {app.badge ? (
        <span className="absolute -right-[5px] -top-[5px] flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[color:var(--system-red)] px-[6px] text-[12px] font-semibold leading-none text-white shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
          {app.badge}
        </span>
      ) : null}
    </>
  );

  const itemClass = "relative block rounded-[22.5%] outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[color:var(--system-blue)]";

  return (
    <div className="relative flex flex-col items-center" onMouseEnter={onHover} onMouseLeave={onLeave}>
      {showLabel && <Tooltip label={app.name} />}
      {app.href ? (
        <a href={app.href} aria-label={label} target={app.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={itemClass}>
          {content}
        </a>
      ) : (
        <button type="button" aria-label={label} onClick={onOpen} className={itemClass}>
          {content}
        </button>
      )}
      <span className={`absolute -bottom-[7px] h-[4px] w-[4px] rounded-full ${running ? "bg-black/55" : "bg-transparent"}`} aria-hidden="true" />
    </div>
  );
}
