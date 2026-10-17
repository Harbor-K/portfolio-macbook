import React, { useEffect, useState } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import { DesktopIcon } from "./components/DesktopIcon";
import { Dock, type MinimizedWindow } from "./components/Dock";
import { Finder } from "./components/Finder";
import { MacWindow, type WindowSize } from "./components/MacWindow";
import { PhotoBooth } from "./components/PhotoBooth";
import { Preview } from "./components/Preview";
import { aboutIcon, aboutPortrait, aboutVideo } from "./data/aboutVideo";
import { type DockApp, dockSections } from "./data/dock";
import { openProject, projects, type Project } from "./data/portfolio";
import { archiveBookIcon, projectFolderIcon } from "./data/projectFolderIcon";
import { tagColorFor } from "./data/tags";
import { wallpaper, wallpaperStyle } from "./data/wallpaper";
import { useScreenInit } from "./useScreenInit.js";

type WindowName = "projects" | "about" | "cv";

type ScreenInit = {
  openWindows?: Partial<Record<WindowName, boolean>>;
  activeWindow?: WindowName;
  photoBoothInfo?: boolean;
};

const windowTitles: Record<WindowName, string> = { projects: "Projects", about: "Photo Booth", cv: "CV.pdf" };
const appNames: Record<WindowName, string> = { projects: "Finder", about: "Photo Booth", cv: "Preview" };

// Menu order follows Apple HIG > The menu bar (app menu, File, Edit, View, Window, Help).
const menus = ["File", "Edit", "View", "Window", "Help"];

// Window layout. Photo Booth sits top-left; Projects and CV open in one tidy slot to its right,
// stretching down to just above the Dock and stopping short of the desktop icons.
const photoBoothFrame = { x: 20, y: 40, w: 420, h: 368 };
const windowGap = 16;
const desktopIconsWidth = 250; // keep the two icon columns on the right uncovered
const dockClearance = 72; // space left above the bottom edge for the Dock
const cascadeStep = 24; // offset when both side windows are open, like macOS cascading

function sideWindowFrame(cascade: boolean): { position: { x: number; y: number }; size: WindowSize } {
  const viewportW = Math.max(typeof window === "undefined" ? 1280 : window.innerWidth, 1040);
  const viewportH = typeof window === "undefined" ? 800 : window.innerHeight;
  const offset = cascade ? cascadeStep : 0;
  const x = photoBoothFrame.x + photoBoothFrame.w + windowGap + offset;
  const y = photoBoothFrame.y + offset;
  const w = Math.max(600, Math.min(860, viewportW - x - desktopIconsWidth));
  const h = Math.max(320, viewportH - y - dockClearance);
  return { position: { x, y }, size: { w, h } };
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
};

export function App() {
  const now = useLocalClock();
  const screenInit = useScreenInit() as ScreenInit;
  const [activeWindow, setActiveWindow] = useState<WindowName>(screenInit.activeWindow ?? "about");
  const [openWindows, setOpenWindows] = useState<Record<WindowName, boolean>>({
    about: screenInit.openWindows?.about ?? true,
    projects: screenInit.openWindows?.projects ?? false,
    cv: screenInit.openWindows?.cv ?? false,
  });
  const [minimized, setMinimized] = useState<Record<WindowName, boolean>>({ about: false, projects: false, cv: false });
  const [minimizeOrder, setMinimizeOrder] = useState<WindowName[]>([]);
  const [windowOrder, setWindowOrder] = useState<Record<WindowName, number>>({ projects: 20, about: 30, cv: 25 });
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

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

  // Read only when a window first opens: the second side window cascades if the other is already open.
  const projectsFrame = sideWindowFrame(openWindows.cv);
  const cvFrame = sideWindowFrame(openWindows.projects);

  return (
    <main className="relative min-h-screen w-full overflow-auto text-[13px] leading-4">
      <div className="relative min-h-screen min-w-[1040px] overflow-hidden" onClick={() => setSelectedIcon(null)}>
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
            <SlidersHorizontalIcon className="h-[14px] w-[14px]" strokeWidth={2.2} aria-label="Control Center" />
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
                onOpen={() => openProject(project, () => openWindow("projects"))}
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
            <DesktopIcon label="CV.pdf" kind="pdf" selected={selectedIcon === "CV"} onSelect={() => setSelectedIcon("CV")} onOpen={() => openWindow("cv")} />
            <DesktopIcon label="Archive" kind="image" imageSrc={archiveBookIcon} selected={selectedIcon === "Archive"} onSelect={() => setSelectedIcon("Archive")} />
            <DesktopIcon label="News" kind="news" selected={selectedIcon === "News"} onSelect={() => setSelectedIcon("News")} />
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
            {({ dragHandleProps, lights }) => <Finder dragHandleProps={dragHandleProps} lights={lights} />}
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

        <Dock sections={dockSections} isRunning={(app) => Boolean(app.running)} onOpen={openFromDock} minimized={minimizedInDock} />
      </div>
    </main>
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
