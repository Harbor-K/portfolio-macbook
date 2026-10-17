import React, { useEffect, useState } from "react";
import { DesktopIcon } from "./components/DesktopIcon";
import { Dock, type MinimizedWindow } from "./components/Dock";
import { Finder } from "./components/Finder";
import { MacWindow, type WindowSize } from "./components/MacWindow";
import { PhotoBooth } from "./components/PhotoBooth";
import { Preview } from "./components/Preview";
import { Browser } from "./components/Browser";
import { KimLLM } from "./components/KimLLM";
import { Reminders } from "./components/Reminders";
import { aboutIcon, aboutPortrait, aboutVideo } from "./data/aboutVideo";
import { type DockApp, dockSections } from "./data/dock";
import { projects, type Project } from "./data/portfolio";
import { archiveBookIcon, cvPdfIcon, notesIcon, projectFolderIcon } from "./data/projectFolderIcon";
import { tagColorFor } from "./data/tags";
import { wallpaper, wallpaperStyle } from "./data/wallpaper";
import { useScreenInit } from "./useScreenInit.js";

type WindowName = "projects" | "about" | "cv" | "article" | "reminders";

type ScreenInit = {
  openWindows?: Partial<Record<WindowName, boolean>>;
  activeWindow?: WindowName;
  photoBoothInfo?: boolean;
};

const windowTitles: Record<WindowName, string> = { projects: "Projects", about: "Photo Booth", cv: "CV.pdf", article: "Trust Bank", reminders: "Reminders" };
const appNames: Record<WindowName, string> = { projects: "Finder", about: "Photo Booth", cv: "Preview", article: "Safari", reminders: "Reminders" };

// Menu order follows Apple HIG > The menu bar (app menu, File, Edit, View, Window, Help).
const menus = ["File", "Edit", "View", "Window", "Help"];

// Window layout. Photo Booth sits top-left; Projects and CV open in one tidy slot to its right,
// stretching down to just above the Dock and stopping short of the desktop icons.
const photoBoothFrame = { x: 20, y: 40, w: 420, h: 368 };
const windowGap = 16;
const desktopIconsWidth = 244; // stop just short of the two desktop icon columns on the right
const dockClearance = 92; // end just above the Dock, with a small gap
const cascadeStep = { x: 40, y: 30 }; // each extra side window opens this far down-right of the last, like macOS cascading
const maxCascade = 6; // after this many, start again from the first position so windows stay on screen

// `stack` = how many side windows are already open; each one pushes the new window down and to the
// right so the windows overlap but every title bar stays visible. The size is the same for all.
function sideWindowFrame(stack: number): { position: { x: number; y: number }; size: WindowSize } {
  const viewportW = Math.max(typeof window === "undefined" ? 1280 : window.innerWidth, 1040);
  const viewportH = typeof window === "undefined" ? 800 : window.innerHeight;
  const baseX = photoBoothFrame.x + photoBoothFrame.w + windowGap;
  const baseY = photoBoothFrame.y;
  const w = Math.max(600, viewportW - baseX - desktopIconsWidth);
  const h = Math.max(320, viewportH - baseY - dockClearance);
  const step = stack % maxCascade;
  return { position: { x: baseX + step * cascadeStep.x, y: baseY + step * cascadeStep.y }, size: { w, h } };
}

function useLocalClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

// The visitor's own local time zone; macOS shows the clock without seconds by default.
function formatMenuTime(date: Date) {
  const day = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(/,/g, "");
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day}  ${time}`;
}

// Small window previews shown in the Dock while a window is minimized.
const dockThumbs: Record<WindowName, React.ReactNode> = {
  cv: (
    <span className="flex h-[48px] w-[36px] flex-col gap-[3px] rounded-[2px] bg-white p-[5px] shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
      <span className="h-[4px] w-3/4 rounded-[1px] bg-black/60" />
      <span className="h-[2px] w-1/2 rounded-[1px] bg-black/25" />
      <span className="mt-[3px] h-[2px] w-full rounded-[1px] bg-black/15" />
      <span className="h-[2px] w-full rounded-[1px] bg-black/15" />
      <span className="h-[2px] w-4/5 rounded-[1px] bg-black/15" />
      <span className="h-[2px] w-full rounded-[1px] bg-black/15" />
    </span>
  ),
  about: <img src={aboutVideo.poster} alt="" className="h-[38px] w-[52px] rounded-[4px] object-cover shadow-[0_2px_5px_rgba(0,0,0,0.3)]" draggable={false} />,
  projects: <img src={projectFolderIcon} alt="" className="h-[48px] w-[48px] object-contain" draggable={false} />,
  article: (
    <span className="flex h-[38px] w-[52px] items-center justify-center rounded-[4px] bg-[#459BD7] text-[11px] font-bold text-white shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
      trust
    </span>
  ),
  reminders: (
    <span className="flex h-[48px] w-[38px] flex-col gap-[4px] rounded-[3px] bg-white p-[5px] shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
      <span className="h-[4px] w-3/4 rounded-[1px] bg-[#ff383c]" />
      <span className="mt-[2px] h-[2px] w-full rounded-[1px] bg-black/20" />
      <span className="h-[2px] w-full rounded-[1px] bg-black/20" />
      <span className="h-[2px] w-4/5 rounded-[1px] bg-black/20" />
    </span>
  ),
};

export function App() {
  const now = useLocalClock();
  const screenInit = useScreenInit() as ScreenInit;
  const [activeWindow, setActiveWindow] = useState<WindowName>(screenInit.activeWindow ?? "about");
  const [openWindows, setOpenWindows] = useState<Record<WindowName, boolean>>({
    about: screenInit.openWindows?.about ?? true,
    projects: screenInit.openWindows?.projects ?? false,
    cv: screenInit.openWindows?.cv ?? false,
    article: screenInit.openWindows?.article ?? false,
    reminders: screenInit.openWindows?.reminders ?? false,
  });
  const [minimized, setMinimized] = useState<Record<WindowName, boolean>>({ about: false, projects: false, cv: false, article: false, reminders: false });
  const [minimizeOrder, setMinimizeOrder] = useState<WindowName[]>([]);
  const [windowOrder, setWindowOrder] = useState<Record<WindowName, number>>({ projects: 20, about: 30, cv: 25, article: 26, reminders: 27 });
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [llmOpen, setLlmOpen] = useState(false);

  // ⌘K / Ctrl+K toggles Kim LLM, like Spotlight.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setLlmOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function focusWindow(windowName: WindowName) {
    setActiveWindow(windowName);
    setWindowOrder((current) => {
      const highest = Math.max(...Object.values(current));
      return { ...current, [windowName]: highest + 1 };
    });
  }

  function openWindow(windowName: WindowName) {
    setOpenWindows((current) => ({ ...current, [windowName]: true }));
    restoreWindow(windowName);
  }

  function closeWindow(windowName: WindowName) {
    setOpenWindows((current) => ({ ...current, [windowName]: false }));
    setMinimized((current) => ({ ...current, [windowName]: false }));
    setMinimizeOrder((current) => current.filter((name) => name !== windowName));
  }

  function minimizeWindow(windowName: WindowName) {
    setMinimized((current) => ({ ...current, [windowName]: true }));
    setMinimizeOrder((current) => [...current.filter((name) => name !== windowName), windowName]);
  }

  function restoreWindow(windowName: WindowName) {
    setMinimized((current) => ({ ...current, [windowName]: false }));
    setMinimizeOrder((current) => current.filter((name) => name !== windowName));
    focusWindow(windowName);
  }

  function openFromDock(app: DockApp) {
    if (app.action) openWindow(app.action);
  }

  const minimizedInDock: MinimizedWindow[] = minimizeOrder
    .filter((name) => openWindows[name])
    .map((name) => ({ id: name, title: windowTitles[name], thumb: dockThumbs[name], onRestore: () => restoreWindow(name) }));

  const windowProps = (name: WindowName) => ({
    isActive: activeWindow === name,
    zIndex: windowOrder[name],
    minimized: minimized[name],
    onFocus: () => focusWindow(name),
    onClose: () => closeWindow(name),
    onMinimize: () => minimizeWindow(name),
  });

  // Read only when a window first opens: it cascades past however many side windows are already showing.
  const sideWindows: WindowName[] = ["projects", "cv", "article", "reminders"];
  const stackFor = (name: WindowName) => sideWindows.filter((other) => other !== name && openWindows[other] && !minimized[other]).length;
  const projectsFrame = sideWindowFrame(stackFor("projects"));
  const cvFrame = sideWindowFrame(stackFor("cv"));
  const articleFrame = sideWindowFrame(stackFor("article"));
  // Reminders opens in the same cascade slot but at a narrower, list-like size.
  const remindersBase = sideWindowFrame(stackFor("reminders"));
  const remindersFrame = { position: remindersBase.position, size: { w: 440, h: Math.min(660, remindersBase.size.h) } };

  // A project with a mock article opens it in the Safari-style window; others open the Projects window.
  function openProject(project: Project) {
    openWindow(project.opensArticle ? "article" : "projects");
  }

  return (
    <main className="relative h-screen w-full overflow-hidden text-[13px] leading-4">
      <div className="relative h-full min-w-[1040px] overflow-hidden" onClick={() => setSelectedIcon(null)}>
        <img src={wallpaper} alt="" className="absolute inset-0 h-full w-full select-none object-cover" style={wallpaperStyle} draggable={false} />

        {/* Menu bar: 24 pt tall (Apple HIG > The menu bar) */}
        <header className="absolute inset-x-0 top-0 z-[100] flex h-[24px] select-none items-center justify-between bg-gradient-to-b from-black/25 to-black/5 px-[10px] text-[13px] text-white [text-shadow:0_0_4px_rgba(0,0,0,0.35)]">
          <nav className="flex items-center" aria-label="Menu bar">
            <span className="rounded-[5px] px-[9px] py-[2px] font-semibold">Harbor</span>
            <span className="rounded-[5px] px-[9px] py-[2px] font-bold">{appNames[activeWindow]}</span>
            {menus.map((menu) => (
              <button key={menu} type="button" className="rounded-[5px] px-[9px] py-[2px] hover:bg-white/20">
                {menu}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-[14px]">
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={llmOpen}
              onClick={(event) => {
                event.stopPropagation();
                setLlmOpen((value) => !value);
              }}
              className={`-mr-[4px] flex items-center gap-[5px] rounded-[5px] px-[8px] py-[2px] font-medium ${llmOpen ? "bg-white/30" : "hover:bg-white/20"}`}
            >
              <KimLlmGlyph />
              Kim LLM
            </button>
            <time dateTime={now.toISOString()} className="whitespace-pre tabular-nums">
              {formatMenuTime(now)}
            </time>
          </div>
        </header>

        {/* Two columns: projects on the left, system items on the right */}
        <section aria-label="Desktop" className="absolute right-[18px] top-[40px] z-10 flex items-start gap-x-[10px]">
          <div className="flex flex-col gap-y-[4px]">
            {projects.map((project, index) => (
              <ProjectIcon
                key={project.title}
                project={project}
                tagColor={tagColorFor(index)}
                selected={selectedIcon === project.title}
                onSelect={() => setSelectedIcon(project.title)}
                onOpen={() => openProject(project)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-y-[4px]">
            <DesktopIcon
              label="About"
              kind="image"
              imageSrc={aboutIcon}
              fallbackSrc={aboutPortrait}
              selected={selectedIcon === "About"}
              onSelect={() => setSelectedIcon("About")}
              onOpen={() => openWindow("about")}
            />
            {/* Opens the same Projects (Finder) window as the Index icon. */}
            <DesktopIcon
              label="Projects"
              kind="image"
              imageSrc={projectFolderIcon}
              selected={selectedIcon === "Projects"}
              onSelect={() => setSelectedIcon("Projects")}
              onOpen={() => openWindow("projects")}
            />
            <DesktopIcon label="CV.pdf" kind="image" imageSrc={cvPdfIcon} selected={selectedIcon === "CV"} onSelect={() => setSelectedIcon("CV")} onOpen={() => openWindow("cv")} />
            <DesktopIcon label="Book" kind="image" imageSrc={archiveBookIcon} selected={selectedIcon === "Book"} onSelect={() => setSelectedIcon("Book")} />
            <DesktopIcon label="Notes" kind="image" imageSrc={notesIcon} selected={selectedIcon === "Notes"} onSelect={() => setSelectedIcon("Notes")} />
          </div>
        </section>

        {openWindows.projects && (
          <MacWindow
            title="Projects"
            initialPosition={projectsFrame.position}
            initialSize={projectsFrame.size}
            widthClassName=""
            resizable
            minSize={{ w: 600, h: 300 }}
            {...windowProps("projects")}
          >
            {({ dragHandleProps, lights }) => <Finder dragHandleProps={dragHandleProps} lights={lights} onOpenProject={openProject} />}
          </MacWindow>
        )}

        {openWindows.cv && (
          <MacWindow
            title="CV.pdf"
            initialPosition={cvFrame.position}
            initialSize={cvFrame.size}
            widthClassName=""
            resizable
            minSize={{ w: 420, h: 320 }}
            {...windowProps("cv")}
          >
            {({ dragHandleProps, lights, zoomed }) => <Preview dragHandleProps={dragHandleProps} lights={lights} zoomed={zoomed} />}
          </MacWindow>
        )}

        {openWindows.article && (
          <MacWindow
            title="Trust Bank"
            initialPosition={articleFrame.position}
            initialSize={articleFrame.size}
            widthClassName=""
            resizable
            minSize={{ w: 600, h: 360 }}
            {...windowProps("article")}
          >
            {({ dragHandleProps, lights }) => <Browser dragHandleProps={dragHandleProps} lights={lights} />}
          </MacWindow>
        )}

        {openWindows.reminders && (
          <MacWindow
            title="Reminders"
            initialPosition={remindersFrame.position}
            initialSize={remindersFrame.size}
            widthClassName=""
            resizable
            minSize={{ w: 380, h: 360 }}
            {...windowProps("reminders")}
          >
            {({ dragHandleProps, lights }) => <Reminders dragHandleProps={dragHandleProps} lights={lights} />}
          </MacWindow>
        )}

        {openWindows.about && (
          <MacWindow
            title="Photo Booth"
            initialPosition={{ x: photoBoothFrame.x, y: photoBoothFrame.y }}
            initialSize={{ w: photoBoothFrame.w, h: photoBoothFrame.h }}
            widthClassName=""
            resizable
            minSize={{ w: 420, h: 320 }}
            {...windowProps("about")}
          >
            <PhotoBooth initialShowInfo={screenInit.photoBoothInfo ?? false} />
          </MacWindow>
        )}

        <KimLLM open={llmOpen} onClose={() => setLlmOpen(false)} />

        <Dock sections={dockSections} isRunning={(app) => Boolean(app.running || (app.action && openWindows[app.action]))} onOpen={openFromDock} minimized={minimizedInDock} />
      </div>
    </main>
  );
}

// Harbor's Kim LLM mark (from kimllm.svg): a four-point sparkle, drawn in the menu bar's text color.
function KimLlmGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" fill="none" aria-hidden="true">
      <path
        d="M3 12C9.268 12 12 9.363 12 3C12 9.363 14.713 12 21 12C14.713 12 12 14.713 12 21C12 14.713 9.268 12 3 12Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectIcon({
  project,
  tagColor,
  selected,
  onSelect,
  onOpen,
}: {
  project: Project;
  tagColor: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  const { title, image } = project;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
      }}
      aria-label={`${title}, double-click to open`}
      className="flex w-[104px] flex-col items-center gap-[5px] px-1 py-1 text-center outline-none"
    >
      <span className={`flex h-[68px] w-[96px] items-center justify-center rounded-[6px] ${selected ? "bg-black/25 ring-1 ring-white/25" : ""}`}>
        <img
          src={image}
          alt=""
          className={`h-[50px] w-[80px] rounded-[2px] shadow-[0_2px_6px_rgba(0,0,0,0.35),0_0_0_2px_#fff] ${project.imageFit === "contain" ? "object-contain" : "object-cover"}`}
          style={project.imageBg ? { background: project.imageBg } : undefined}
          draggable={false}
        />
      </span>
      <span
        className={`flex max-w-[104px] items-center gap-1 rounded-[4px] px-1.5 py-px text-[12px] font-medium leading-[15px] ${
          selected ? "bg-[color:var(--system-blue)] text-white" : "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.75),0_0_6px_rgba(0,0,0,0.35)]"
        }`}
      >
        <span className="h-[7px] w-[7px] shrink-0 rounded-full ring-1 ring-white/80" style={{ background: tagColor }} aria-hidden="true" />
        <span className="truncate">{title}</span>
      </span>
    </button>
  );
}
