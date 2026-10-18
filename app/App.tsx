import React, { useEffect, useState } from "react";
import { DesktopIcon } from "./components/DesktopIcon";
import { Dock, type MinimizedWindow } from "./components/Dock";
import { Finder, type FinderItem, type FinderLocation } from "./components/Finder";
import { MacWindow, type WindowSize } from "./components/MacWindow";
import { PhotoBooth } from "./components/PhotoBooth";
import { Preview } from "./components/Preview";
import { Browser } from "./components/Browser";
import { caseStudies } from "./data/caseStudies";
import { KimLLM } from "./components/KimLLM";
import { Reminders } from "./components/Reminders";
import { Notes } from "./components/Notes";
import { notes } from "./data/notes";
import { Settings, type ThemeSetting } from "./components/Settings";
import type { A11ySettings } from "./components/AccessibilityPane";
import { SpinIt } from "./components/SpinIt";
import { WindowPreview } from "./components/WindowPreview";
import { CompassIcon } from "lucide-react";
import { MobileSafari } from "./components/MobileSafari";
import { aboutIcon, aboutPortrait } from "./data/aboutVideo";
import { type DockApp, dockSections, settingsIcon, spinItIcon } from "./data/dock";
import { projects, type Project } from "./data/portfolio";
import { archiveBookIcon, cvPdfIcon, notesIcon, projectFolderIcon } from "./data/projectFolderIcon";
import { tagColorFor } from "./data/tags";
import { defaultWallpaperId, nightFilter, wallpapers } from "./data/wallpaper";
import { useScreenInit } from "./useScreenInit.js";

type BaseWindow = "projects" | "about" | "cv" | "reminders" | "notes" | "settings" | "spinit";
// Each project's case study gets its own Safari-style window, named "case:<project title>".
type CaseWindow = `case:${string}`;
type WindowName = BaseWindow | CaseWindow;
const caseWindow = (title: string): CaseWindow => `case:${title}`;
const isCase = (name: WindowName): name is CaseWindow => name.startsWith("case:");
const caseTitle = (name: CaseWindow) => name.slice(5);
const caseOrder = Object.keys(caseStudies); // Trust Bank → GameCove → UTrada → ETO Markets
const caseWindows: CaseWindow[] = caseOrder.map(caseWindow);

type ScreenInit = {
  openWindows?: Partial<Record<string, boolean>>;
  activeWindow?: WindowName;
  photoBoothInfo?: boolean;
};

const windowTitles: Record<BaseWindow, string> = { projects: "Projects", about: "Photo Booth", cv: "CV.pdf", reminders: "Reminders", notes: "Notes", settings: "System Settings", spinit: "Spin it" };
const appNames: Record<BaseWindow, string> = { projects: "Finder", about: "Photo Booth", cv: "Preview", reminders: "Reminders", notes: "Notes", settings: "System Settings", spinit: "Spin it" };
const appNameOf = (name: WindowName) => (isCase(name) ? "Safari" : appNames[name]);


// Window layout. Photo Booth sits top-left; Projects and CV open in one tidy slot to its right,
// stretching down to just above the Dock and stopping short of the desktop icons.
const photoBoothFrame = { x: 20, y: 40, w: 420, h: 368 };
// The Spin it turntable sits just under Photo Booth, the same width.
const spinItFrame = { x: photoBoothFrame.x, y: photoBoothFrame.y + photoBoothFrame.h + 16, w: photoBoothFrame.w, h: 212 };
const windowGap = 16;
const desktopIconsWidth = 244; // stop just short of the two desktop icon columns on the right
const dockClearance = 92; // end just above the Dock, with a small gap
const cascadeStep = { x: 40, y: 30 }; // each extra side window opens this far down-right of the last, like macOS cascading
const maxCascade = 6; // after this many, start again from the first position so windows stay on screen
// The desktop never gets smaller than this. When the visitor zooms the browser in and the window is
// smaller, the page scrolls instead of cutting the desktop off.
const minDesktop = { w: 1040, h: 680 };
const viewportHeight = () => Math.max(typeof window === "undefined" ? 800 : window.innerHeight, minDesktop.h);

// `stack` = how many side windows are already open; each one pushes the new window down and to the
// right so the windows overlap but every title bar stays visible.
function sideWindowFrame(stack: number): { position: { x: number; y: number }; size: WindowSize } {
  const viewportW = Math.max(typeof window === "undefined" ? 1280 : window.innerWidth, minDesktop.w);
  const viewportH = viewportHeight();
  const baseX = photoBoothFrame.x + photoBoothFrame.w + windowGap;
  const baseY = photoBoothFrame.y;
  const w = Math.max(600, viewportW - baseX - desktopIconsWidth);
  const h = Math.max(320, viewportH - baseY - dockClearance);
  const step = stack % maxCascade;
  // Cascaded windows shrink by the same offset, so they never slide over the desktop icons or the Dock.
  const dx = step * cascadeStep.x;
  const dy = step * cascadeStep.y;
  return { position: { x: baseX + dx, y: baseY + dy }, size: { w: Math.max(600, w - dx), h: Math.max(320, h - dy) } };
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

// Dock thumbnail of a minimized window: a shrunken copy of the window with its app's icon in the corner.
const finderIcon = dockSections.flat().find((app) => app.id === "finder")?.imageUrl ?? "";
const remindersIcon = dockSections.flat().find((app) => app.id === "reminders")?.imageUrl ?? "";
const appIconSrc: Record<BaseWindow, string> = {
  projects: finderIcon,
  about: aboutIcon,
  cv: cvPdfIcon,
  reminders: remindersIcon,
  notes: notesIcon,
  settings: settingsIcon,
  spinit: spinItIcon,
};
// No Safari icon is hosted, so case-study windows get a simple compass tile.
const browserIcon = (
  <span className="flex h-full w-full items-center justify-center rounded-[22.5%] bg-gradient-to-b from-[#5ac8fa] to-[#0a6cff] text-white shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]">
    <CompassIcon className="h-[72%] w-[72%]" strokeWidth={1.8} />
  </span>
);
const thumbOf = (name: WindowName) => (
  <WindowPreview
    windowId={name}
    appIcon={isCase(name) ? browserIcon : <img src={appIconSrc[name]} alt="" className="h-full w-full object-contain" draggable={false} />}
  />
);

// The wallpaper choice is remembered in this browser only; if storage is blocked
// (private window, embedded preview) the defaults are used and nothing breaks.
function readSetting(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeSetting(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: keep the choice for this visit only */
  }
}

// "auto" follows the visitor's device (prefers-color-scheme), like macOS Appearance > Auto.
function useSystemDark() {
  const query = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const [dark, setDark] = useState(() => Boolean(query?.matches));
  useEffect(() => {
    if (!query) return;
    const onChange = (event: MediaQueryListEvent) => setDark(event.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, [query]);
  return dark;
}

// Phones get the mobile layout (an iOS Safari-style start page) instead of the desktop.
const mobileQuery = "(max-width: 767px)";
function useIsMobile() {
  const query = typeof window !== "undefined" && window.matchMedia ? window.matchMedia(mobileQuery) : null;
  const [mobile, setMobile] = useState(() => Boolean(query?.matches));
  useEffect(() => {
    if (!query) return;
    const onChange = (event: MediaQueryListEvent) => setMobile(event.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, [query]);
  return mobile;
}

export function App() {
  const now = useLocalClock();
  const screenInit = useScreenInit() as ScreenInit;
  const [activeWindow, setActiveWindow] = useState<WindowName>(
    (screenInit.activeWindow as string) === "article" ? caseWindow("Trust Bank") : (screenInit.activeWindow ?? "about"),
  );
  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({
    about: screenInit.openWindows?.about ?? true,
    projects: screenInit.openWindows?.projects ?? false,
    cv: screenInit.openWindows?.cv ?? false,
    reminders: screenInit.openWindows?.reminders ?? false,
    notes: screenInit.openWindows?.notes ?? false,
    settings: screenInit.openWindows?.settings ?? false,
    spinit: screenInit.openWindows?.spinit ?? false, // hidden at first; opens from the Dock
    ...Object.fromEntries(caseWindows.map((name) => [name, screenInit.openWindows?.[name] ?? false])),
    // Older canvas screens used "article" for the Trust Bank page.
    ...(screenInit.openWindows?.article ? { [caseWindow("Trust Bank")]: true } : {}),
  });
  const [minimized, setMinimized] = useState<Record<string, boolean>>({});
  const [minimizeOrder, setMinimizeOrder] = useState<WindowName[]>([]);
  const [windowOrder, setWindowOrder] = useState<Record<string, number>>({
    spinit: 19,
    projects: 20,
    cv: 25,
    ...Object.fromEntries(caseWindows.map((name, i) => [name, 26 + i * 0.1])),
    reminders: 27,
    notes: 28,
    settings: 29,
    about: 30,
  });
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  // The page each case-study window is currently showing (the Safari arrows step through the projects).
  const [casePage, setCasePage] = useState<Record<string, string>>({});
  const pageOf = (name: CaseWindow) => casePage[name] ?? caseTitle(name);
  const [llmOpen, setLlmOpen] = useState(false);
  // Which note the Notes window opens on (set when a note is opened from Finder > Documents).
  const [noteId, setNoteId] = useState<string | undefined>(undefined);
  const isMobile = useIsMobile();
  // Every desktop visit starts in Light mode; on phones it starts on Auto, following the phone's own
  // light/dark setting like iOS Safari. Changes apply only until the page is reloaded.
  const [theme, setTheme] = useState<ThemeSetting>(() =>
    typeof window !== "undefined" && window.matchMedia?.(mobileQuery).matches ? "auto" : "light",
  );
  const [wallpaperId, setWallpaperId] = useState(() => {
    const saved = readSetting("harbor.wallpaper");
    return wallpapers.some((w) => w.id === saved) ? (saved as string) : defaultWallpaperId;
  });
  // Accessibility toggles (System Settings > Accessibility). Remembered in this browser; Reduce motion
  // starts on when the visitor's device already asks for reduced motion.
  const [a11y, setA11y] = useState<A11ySettings>(() => {
    const fallback: A11ySettings = {
      reduceMotion: typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches),
      increaseContrast: false,
      largerText: false,
    };
    try {
      return { ...fallback, ...JSON.parse(readSetting("harbor.a11y") ?? "{}") };
    } catch {
      return fallback;
    }
  });
  function changeA11y(next: A11ySettings) {
    setA11y(next);
    writeSetting("harbor.a11y", JSON.stringify(next));
  }
  const systemDark = useSystemDark();
  const isDark = theme === "dark" || (theme === "auto" && systemDark);
  const wallpaper = wallpapers.find((w) => w.id === wallpaperId) ?? wallpapers[0];

  function changeTheme(next: ThemeSetting) {
    setTheme(next);
  }
  function changeWallpaper(id: string) {
    setWallpaperId(id);
    writeSetting("harbor.wallpaper", id);
  }

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
    .map((name) => ({ id: name, title: isCase(name) ? pageOf(name) : windowTitles[name], thumb: thumbOf(name), onRestore: () => restoreWindow(name) }));

  const windowProps = (name: WindowName) => ({
    windowId: name,
    isActive: activeWindow === name,
    zIndex: windowOrder[name],
    minimized: Boolean(minimized[name]),
    onFocus: () => focusWindow(name),
    onClose: () => closeWindow(name),
    onMinimize: () => minimizeWindow(name),
    appearance: (isDark ? "dark" : "light") as "dark" | "light",
  });

  // Read only when a window first opens: it cascades past however many side windows are already showing.
  const sideWindows: WindowName[] = ["projects", "cv", ...caseWindows, "reminders", "notes", "settings"];
  const stackFor = (name: WindowName) => sideWindows.filter((other) => other !== name && openWindows[other] && !minimized[other]).length;
  const projectsFrame = sideWindowFrame(stackFor("projects"));
  const cvFrame = sideWindowFrame(stackFor("cv"));
  const notesFrame = sideWindowFrame(stackFor("notes"));
  // Reminders opens in the same cascade slot but at a narrower, list-like size.
  const remindersBase = sideWindowFrame(stackFor("reminders"));
  const remindersFrame = { position: remindersBase.position, size: { w: 440, h: Math.min(660, remindersBase.size.h) } };
  // System Settings opens compact and low, just above the Dock, so the sky (and the night moon) stays visible.
  const settingsBase = sideWindowFrame(stackFor("settings"));
  const settingsH = 400;
  const settingsY = Math.max(settingsBase.position.y, viewportHeight() - dockClearance - settingsH);
  const settingsFrame = { position: { x: settingsBase.position.x, y: settingsY }, size: { w: Math.min(760, settingsBase.size.w), h: settingsH } };

  // A project with a mock article opens it in the Safari-style window; others open the Projects window.
  function openProject(project: Project) {
    if (project.opensArticle && caseStudies[project.title]) {
      const name = caseWindow(project.title);
      // Re-opening a project shows its own page again, even if the window had been arrowed elsewhere.
      setCasePage((current) => ({ ...current, [name]: project.title }));
      openWindow(name);
    } else {
      openWindow("projects");
    }
  }

  function openNote(id: string) {
    setNoteId(id);
    openWindow("notes");
  }

  // What each Finder sidebar location contains. Double-clicking an item opens the same window as on the desktop.
  const projectItems: FinderItem[] = projects.map((project, index) => ({
    id: `project:${project.title}`,
    title: project.title,
    image: project.image,
    look: "thumb",
    imageFit: project.imageFit,
    imageBg: project.imageBg,
    tagColor: tagColorFor(index),
    kind: "Case study",
    onOpen: () => openProject(project),
  }));
  const cvItem: FinderItem = { id: "cv", title: "CV.pdf", image: cvPdfIcon, look: "icon", kind: "PDF document", onOpen: () => openWindow("cv") };
  const finderLocations: Record<FinderLocation, FinderItem[]> = {
    projects: projectItems,
    desktop: [
      ...projectItems,
      { id: "about", title: "About", image: aboutIcon, look: "icon", kind: "Photo Booth", onOpen: () => openWindow("about") },
      { id: "folder", title: "Projects", image: projectFolderIcon, look: "icon", kind: "Folder", onOpen: () => openWindow("projects") },
      cvItem,
      { id: "book", title: "Book", image: archiveBookIcon, look: "icon", kind: "Book" },
      { id: "notes", title: "Notes", image: notesIcon, look: "icon", kind: "Application", onOpen: () => openWindow("notes") },
    ],
    documents: [
      cvItem,
      ...notes.map<FinderItem>((note) => ({ id: `note:${note.id}`, title: note.file, image: notesIcon, look: "icon", kind: "Note", onOpen: () => openNote(note.id) })),
    ],
    downloads: [],
  };

  return (
    <main
      className={`relative ${isMobile ? "h-[100dvh] overflow-hidden" : "h-screen overflow-auto"} w-full text-[13px] leading-4 ${isDark ? "theme-dark" : ""} ${a11y.reduceMotion ? "a11y-reduce-motion" : ""} ${
        a11y.increaseContrast ? "a11y-contrast" : ""
      } ${a11y.largerText ? "a11y-large-text" : ""}`}
    >
      {isMobile ? (
        <>
          <MobileSafari theme={theme} onThemeChange={changeTheme} a11y={a11y} onA11yChange={changeA11y} onAskKim={() => setLlmOpen(true)} />
          <KimLLM open={llmOpen} onClose={() => setLlmOpen(false)} />
        </>
      ) : (
      <div className="relative h-full min-h-[680px] min-w-[1040px] overflow-hidden" onClick={() => setSelectedIcon(null)}>
        {/* Wallpaper. In dark mode it fades from day to night over ~1.6 s: the photo dims and cools,
            a navy sky wash and a few stars fade in. A wallpaper with its own nightSrc crossfades to that photo instead. */}
        <div key={wallpaper.id} className="absolute inset-0 animate-[wallpaperIn_400ms_ease-out]">
          <img
            src={wallpaper.src}
            alt=""
            className="absolute inset-0 h-full w-full select-none object-cover transition-[filter] duration-[1600ms] ease-in-out"
            style={{ objectPosition: wallpaper.objectPosition, filter: isDark && !wallpaper.nightSrc ? nightFilter : wallpaper.filter }}
            draggable={false}
          />
          {wallpaper.nightSrc ? (
            <img
              src={wallpaper.nightSrc}
              alt=""
              className="absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-[1600ms] ease-in-out"
              style={{ objectPosition: wallpaper.objectPosition, opacity: isDark ? 1 : 0 }}
              draggable={false}
            />
          ) : (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 mix-blend-multiply transition-opacity duration-[1600ms] ease-in-out"
                style={{ opacity: isDark ? 1 : 0, background: "linear-gradient(180deg, rgba(18,28,78,0.85) 0%, rgba(28,36,90,0.6) 45%, rgba(20,24,48,0.55) 100%)" }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[55%] transition-opacity delay-500 duration-[1800ms] ease-in-out"
                style={{
                  opacity: isDark ? 0.9 : 0,
                  backgroundImage: [
                    "radial-gradient(1.2px 1.2px at 12% 18%, #fff 50%, transparent 51%)",
                    "radial-gradient(1px 1px at 27% 9%, #fff 50%, transparent 51%)",
                    "radial-gradient(1.4px 1.4px at 41% 24%, #fff 50%, transparent 51%)",
                    "radial-gradient(1px 1px at 55% 12%, #fff 50%, transparent 51%)",
                    "radial-gradient(1.2px 1.2px at 68% 30%, #fff 50%, transparent 51%)",
                    "radial-gradient(1px 1px at 79% 7%, #fff 50%, transparent 51%)",
                    "radial-gradient(1.3px 1.3px at 90% 21%, #fff 50%, transparent 51%)",
                    "radial-gradient(1px 1px at 34% 38%, #fff 50%, transparent 51%)",
                    "radial-gradient(1px 1px at 61% 44%, #fff 50%, transparent 51%)",
                    "radial-gradient(1.1px 1.1px at 6% 40%, #fff 50%, transparent 51%)",
                    "radial-gradient(1px 1px at 48% 5%, #fff 50%, transparent 51%)",
                    "radial-gradient(1px 1px at 73% 16%, #fff 50%, transparent 51%)",
                  ].join(", "),
                  maskImage: "linear-gradient(180deg, #000 40%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(180deg, #000 40%, transparent 100%)",
                }}
              />
              {/* Moon glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[58%] top-[9%] h-[46px] w-[46px] rounded-full transition-opacity delay-300 duration-[1800ms] ease-in-out"
                style={{
                  opacity: isDark ? 1 : 0,
                  background: "radial-gradient(circle at 40% 40%, #fffbe8, #f1e7c4 60%, #e6d9ad)",
                  boxShadow: "0 0 30px 8px rgba(255,246,214,0.35), 0 0 90px 30px rgba(180,190,255,0.15)",
                }}
              />
            </>
          )}
        </div>

        {/* Menu bar: 24 pt tall (Apple HIG > The menu bar) */}
        <header className="absolute inset-x-0 top-0 z-[100] flex h-[24px] select-none items-center justify-between bg-gradient-to-b from-black/25 to-black/5 px-[10px] text-[13px] text-white [text-shadow:0_0_4px_rgba(0,0,0,0.35)]">
          <nav className="flex items-center" aria-label="Menu bar">
            <span className="rounded-[5px] px-[9px] py-[2px] font-semibold">Harbor</span>
            <span className="rounded-[5px] px-[9px] py-[2px] font-bold">{appNameOf(activeWindow)}</span>
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
            <DesktopIcon label="Notes" kind="image" imageSrc={notesIcon} selected={selectedIcon === "Notes"} onSelect={() => setSelectedIcon("Notes")} onOpen={() => openWindow("notes")} />
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
            {({ dragHandleProps, lights }) => <Finder dragHandleProps={dragHandleProps} lights={lights} locations={finderLocations} />}
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

        {/* One Safari-style window per project case study; each opens, moves and minimizes on its own. */}
        {caseWindows.map((name) => {
          if (!openWindows[name]) return null;
          const frame = sideWindowFrame(stackFor(name));
          const page = pageOf(name);
          const index = caseOrder.indexOf(page);
          const goTo = (i: number) => () => setCasePage((current) => ({ ...current, [name]: caseOrder[i] }));
          return (
            <MacWindow
              key={name}
              title={page}
              initialPosition={frame.position}
              initialSize={frame.size}
              widthClassName=""
              resizable
              minSize={{ w: 600, h: 360 }}
              {...windowProps(name)}
            >
              {({ dragHandleProps, lights }) => (
                <Browser
                  dragHandleProps={dragHandleProps}
                  lights={lights}
                  article={caseStudies[page]}
                  onBack={index > 0 ? goTo(index - 1) : undefined}
                  onForward={index < caseOrder.length - 1 ? goTo(index + 1) : undefined}
                />
              )}
            </MacWindow>
          );
        })}

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

        {openWindows.notes && (
          <MacWindow
            title="Notes"
            initialPosition={notesFrame.position}
            initialSize={notesFrame.size}
            widthClassName=""
            resizable
            minSize={{ w: 760, h: 360 }}
            {...windowProps("notes")}
          >
            {({ dragHandleProps, lights }) => <Notes key={noteId ?? "default"} dragHandleProps={dragHandleProps} lights={lights} initialId={noteId} />}
          </MacWindow>
        )}

        {openWindows.settings && (
          <MacWindow
            title="System Settings"
            initialPosition={settingsFrame.position}
            initialSize={settingsFrame.size}
            widthClassName=""
            resizable
            minSize={{ w: 600, h: 360 }}
            {...windowProps("settings")}
          >
            {({ dragHandleProps, lights }) => (
              <Settings
                dragHandleProps={dragHandleProps}
                lights={lights}
                theme={theme}
                onThemeChange={changeTheme}
                wallpaperId={wallpaper.id}
                onWallpaperChange={changeWallpaper}
                a11y={a11y}
                onA11yChange={changeA11y}
              />
            )}
          </MacWindow>
        )}

        {openWindows.spinit && (
          <MacWindow
            title="Spin it"
            initialPosition={{ x: spinItFrame.x, y: spinItFrame.y }}
            initialSize={{ w: spinItFrame.w, h: spinItFrame.h }}
            widthClassName=""
            {...windowProps("spinit")}
          >
            {({ dragHandleProps, lights }) => <SpinIt dragHandleProps={dragHandleProps} lights={lights} />}
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
      )}
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
        className={`flex max-w-[104px] items-center gap-1 rounded-[4px] px-1.5 py-px text-[12px] font-bold leading-[15px] ${
          selected ? "bg-[color:var(--system-blue)] text-white" : "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_6px_rgba(0,0,0,0.5)]"
        }`}
      >
        <span className="h-[9px] w-[9px] shrink-0 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.55),0_0_4px_rgba(0,0,0,0.25)]" style={{ background: tagColor }} aria-hidden="true" />
        <span className="truncate">{title}</span>
      </span>
    </button>
  );
}
