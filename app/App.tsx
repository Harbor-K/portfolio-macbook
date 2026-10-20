import React, { useEffect, useState } from "react";
import { DesktopIcon, HintCard, labelClass, selectionClass, type IconHint } from "./components/DesktopIcon";
import { Dock, type MinimizedWindow } from "./components/Dock";
import { Finder, type FinderItem, type FinderLocation } from "./components/Finder";
import { MacWindow, type WindowSize } from "./components/MacWindow";
import { IntroCall } from "./components/IntroCall";
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
import { type DockApp, dockSections, finderIcon, settingsIcon, spinItIcon } from "./data/dock";
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

const windowTitles: Record<BaseWindow, string> = { projects: "Projects", about: "Intro", cv: "CV.pdf", reminders: "Reminders", notes: "Notes", settings: "System Settings", spinit: "Spin it" };
const appNames: Record<BaseWindow, string> = { projects: "Projects", about: "Intro", cv: "Preview", reminders: "Reminders", notes: "Notes", settings: "System Settings", spinit: "Spin it" };
const appNameOf = (name: WindowName) => (isCase(name) ? "Safari" : appNames[name]);


// Window layout. Every window (opened from the Dock, the desktop or Finder) opens centred in the free
// area to the left of the desktop icons, between the menu bar and the Dock, so it never covers the icons,
// their hover cards, or the Dock, and never runs off screen.
const desktopIconsWidth = 318; // the two desktop icon columns plus their right margin
const iconGap = 24; // space between the windows and the icons
const hintZone = 212; // room for an icon's hover card, kept clear when the screen is wide enough
const workArea = { left: 24, top: 48 };
const dockClearance = 96; // end just above the Dock, with a small gap
const cascadeStep = { x: 32, y: 28 }; // each extra window opens this far down-right of the last, like macOS cascading
const maxCascade = 6; // after this many, start again from the first position so windows stay on screen
// The desktop never gets smaller than this. When the visitor zooms the browser in and the window is
// smaller, the page scrolls instead of cutting the desktop off.
const minDesktop = { w: 1040, h: 680 };
const viewportWidth = () => Math.max(typeof window === "undefined" ? 1280 : window.innerWidth, minDesktop.w);
const viewportHeight = () => Math.max(typeof window === "undefined" ? 800 : window.innerHeight, minDesktop.h);

// Preferred window sizes; each is shrunk to fit the free area.
const windowSizes = {
  about: { w: 700, h: 530 },
  spinit: { w: 420, h: 212 },
  settings: { w: 760, h: 440 },
  reminders: { w: 480, h: 690 },
  document: { w: 1100, h: 780 }, // Projects, CV, Notes and the case studies
};

function freeArea() {
  const right = viewportWidth() - desktopIconsWidth - iconGap;
  const withHints = right - hintZone;
  const left = workArea.left;
  // Keep the hover-card strip clear unless that would make the area too narrow for the Intro window.
  const r = withHints - left >= windowSizes.about.w ? withHints : right;
  return { left, top: workArea.top, w: r - left, h: viewportHeight() - dockClearance - workArea.top };
}

// `stack` = how many windows are already open; each one opens a little further down and to the right
// so the windows overlap but every title bar stays visible.
function windowFrame(preferred: WindowSize, stack: number): { position: { x: number; y: number }; size: WindowSize } {
  const area = freeArea();
  const step = stack % maxCascade;
  const dx = step * cascadeStep.x;
  const dy = step * cascadeStep.y;
  const w = Math.max(360, Math.min(preferred.w, area.w - dx));
  const h = Math.max(200, Math.min(preferred.h, area.h - dy));
  const x = area.left + Math.max(0, Math.round((area.w - w) / 2)) + dx;
  const y = area.top + Math.max(0, Math.round((area.h - h) / 2)) + dy;
  return { position: { x: Math.min(x, area.left + area.w - w), y: Math.min(y, area.top + area.h - h) }, size: { w, h } };
}
const sideWindowFrame = (stack: number) => windowFrame(windowSizes.document, stack);

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
    const saved = readSetting("harbor.wallpaper.v2");
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
  // Plain wallpapers are light in Light mode and dark in Dark mode; photos always count as dark.
  const tone: "light" | "dark" = wallpaper.tone;

  // Light and Dark also switch the wallpaper to plain white or plain black, so the two always match.
  function changeTheme(next: ThemeSetting) {
    setTheme(next);
    const dark = next === "dark" || (next === "auto" && systemDark);
    changeWallpaper(dark ? "black" : "white");
  }
  function changeWallpaper(id: string) {
    setWallpaperId(id);
    writeSetting("harbor.wallpaper.v2", id);
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
  const sideWindows: WindowName[] = ["about", "spinit", "projects", "cv", ...caseWindows, "reminders", "notes", "settings"];
  const stackFor = (name: WindowName) => sideWindows.filter((other) => other !== name && openWindows[other] && !minimized[other]).length;
  const projectsFrame = sideWindowFrame(stackFor("projects"));
  const cvFrame = sideWindowFrame(stackFor("cv"));
  const notesFrame = sideWindowFrame(stackFor("notes"));
  // Reminders opens in the same cascade slot but at a narrower, list-like size.
  const remindersFrame = windowFrame(windowSizes.reminders, stackFor("reminders"));
  // System Settings opens compact and low, just above the Dock, so the sky (and the night moon) stays visible.
  const settingsFrame = windowFrame(windowSizes.settings, stackFor("settings"));
  const spinItFrame = windowFrame(windowSizes.spinit, stackFor("spinit"));
  const introFrame = windowFrame(windowSizes.about, stackFor("about"));

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
    hint: caseStudies[project.title]?.eyebrow.replace("Case Study · ", ""),
    onOpen: () => openProject(project),
  }));
  const cvItem: FinderItem = { id: "cv", title: "CV.pdf", image: cvPdfIcon, look: "icon", kind: "PDF document", hint: "CV — experience, projects and skills; download as PDF", onOpen: () => openWindow("cv") };
  const finderLocations: Record<FinderLocation, FinderItem[]> = {
    projects: projectItems,
    desktop: [
      ...projectItems,
      { id: "about", title: "About", image: aboutIcon, look: "icon", kind: "Intro", hint: "Intro video & profile", onOpen: () => openWindow("about") },
      { id: "folder", title: "Projects", image: projectFolderIcon, look: "icon", kind: "Folder", hint: "All four case studies", onOpen: () => openWindow("projects") },
      cvItem,
      { id: "book", title: "Book", image: archiveBookIcon, look: "icon", kind: "Book", hint: "Coming soon" },
      { id: "notes", title: "Notes", image: notesIcon, look: "icon", kind: "Application", hint: "How I work, what I value, and a fun fact", onOpen: () => openWindow("notes") },
    ],
    documents: [
      cvItem,
      ...notes.map<FinderItem>((note) => ({ id: `note:${note.id}`, title: note.file, image: notesIcon, look: "icon", kind: "Note", hint: note.subtitle, onOpen: () => openNote(note.id) })),
    ],
    downloads: [],
  };

  return (
    <main
      className={`relative ${isMobile ? "h-[100dvh] overflow-hidden" : `h-screen overflow-auto ${tone === "light" ? "bg-white" : "bg-black"}`} w-full text-[13px] leading-4 ${isDark ? "theme-dark" : ""} ${a11y.reduceMotion ? "a11y-reduce-motion" : ""} ${
        a11y.increaseContrast ? "a11y-contrast" : ""
      } ${a11y.largerText ? "a11y-large-text" : ""}`}
    >
      {isMobile ? (
        <>
          <MobileSafari theme={theme} onThemeChange={changeTheme} a11y={a11y} onA11yChange={changeA11y} onAskKim={() => setLlmOpen(true)} />
          <KimLLM open={llmOpen} onClose={() => setLlmOpen(false)} />
        </>
      ) : (
      <div
        className={`relative h-full min-h-[680px] min-w-[1040px] overflow-hidden ${tone === "light" ? "desk-light" : ""}`}
        onClick={() => setSelectedIcon(null)}
      >
        {/* Wallpaper. In dark mode it fades from day to night over ~1.6 s: the photo dims and cools,
            a navy sky wash and a few stars fade in. A wallpaper with its own nightSrc crossfades to that photo instead. */}
        <div key={wallpaper.id} className="absolute inset-0 animate-[wallpaperIn_400ms_ease-out]">
          {wallpaper.gradient ? (
            <div aria-hidden="true" className="absolute inset-0" style={{ background: isDark ? wallpaper.gradient.dark : wallpaper.gradient.light }} />
          ) : (
          <>
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
          </>
          )}
        </div>

        {/* Menu bar: 24 pt tall (Apple HIG > The menu bar) */}
        <header
          className={`absolute inset-x-0 top-0 z-[100] flex h-[24px] select-none items-center justify-between px-[10px] text-[13px] ${
            tone === "light"
              ? "border-b border-black/[0.06] bg-white/60 text-black/85 backdrop-blur-xl"
              : "bg-gradient-to-b from-black/25 to-black/5 text-white [text-shadow:0_0_4px_rgba(0,0,0,0.35)]"
          }`}
        >
          <nav className="flex items-center" aria-label="Menu bar">
            {/* Harbor's logo (harbor_icon.svg) sits 8px before her name, like the Apple logo in the macOS menu bar. */}
            <span className="flex items-center gap-[8px] rounded-[5px] px-[9px] py-[2px] font-semibold">
              <HarborLogo />
              Harbor
            </span>
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
              className={`-mr-[4px] flex items-center gap-[5px] rounded-[5px] px-[8px] py-[2px] font-medium ${
                tone === "light" ? (llmOpen ? "bg-black/[0.08]" : "hover:bg-black/[0.05]") : llmOpen ? "bg-white/30" : "hover:bg-white/20"
              }`}
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
        <section aria-label="Desktop" className="absolute right-[28px] top-[44px] z-10 flex items-start gap-x-[20px]">
          <div className="flex flex-col gap-y-[14px]">
            {projects.map((project, index) => (
              <ProjectIcon
                key={project.title}
                project={project}
                tagColor={tagColorFor(index)}
                tone={tone}
                hint={projectHint(project.title)}
                selected={selectedIcon === project.title}
                onSelect={() => setSelectedIcon(project.title)}
                onOpen={() => openProject(project)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-y-[10px]">
            <DesktopIcon
              label="About"
              kind="image"
              imageSrc={aboutIcon}
              fallbackSrc={aboutPortrait}
              tone={tone}
              hint={{ eyebrow: "About", title: "Intro video & profile", body: "A short intro, who I am, and how to book a call.", action: "Double-click to open" }}
              selected={selectedIcon === "About"}
              onSelect={() => setSelectedIcon("About")}
              onOpen={() => openWindow("about")}
            />
            {/* Opens the same Projects (Finder) window as the Index icon. */}
            <DesktopIcon
              label="Projects"
              kind="image"
              imageSrc={projectFolderIcon}
              tone={tone}
              hint={{ eyebrow: "Finder", title: "All projects", body: "Browse the four case studies, or filter them by year.", action: "Double-click to open" }}
              selected={selectedIcon === "Projects"}
              onSelect={() => setSelectedIcon("Projects")}
              onOpen={() => openWindow("projects")}
            />
            <DesktopIcon
              label="CV.pdf"
              kind="image"
              imageSrc={cvPdfIcon}
              tone={tone}
              hint={{ eyebrow: "Preview", title: "CV", body: "Experience, projects and skills on one page. Download as PDF.", action: "Double-click to open" }}
              selected={selectedIcon === "CV"} onSelect={() => setSelectedIcon("CV")} onOpen={() => openWindow("cv")} />
            <DesktopIcon label="Book" kind="image" imageSrc={archiveBookIcon} tone={tone} hint={{ title: "Book", body: "Coming soon." }} selected={selectedIcon === "Book"} onSelect={() => setSelectedIcon("Book")} />
            <DesktopIcon
              label="Notes"
              kind="image"
              imageSrc={notesIcon}
              tone={tone}
              hint={{ eyebrow: "Notes", title: "How I work", body: "My design approach, what I value in a team, and a fun fact.", action: "Double-click to open" }}
              selected={selectedIcon === "Notes"} onSelect={() => setSelectedIcon("Notes")} onOpen={() => openWindow("notes")} />
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
            {({ dragHandleProps, lights }) => <Reminders
                dragHandleProps={dragHandleProps}
                lights={lights}
                onNavigate={(step) => {
                  if (step === "intro" || step === "about") openWindow("about");
                  else if (step === "projects") openWindow("projects");
                  else if (step === "cv") openWindow("cv");
                  else if (step.startsWith("case:")) openWindow(step as CaseWindow);
                }}
              />}
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
                onWallpaperChange={(id) => {
                  changeWallpaper(id);
                  setTheme(id === "black" ? "dark" : "light");
                }}
                a11y={a11y}
                onA11yChange={changeA11y}
              />
            )}
          </MacWindow>
        )}

        {openWindows.spinit && (
          <MacWindow
            title="Spin it"
            initialPosition={spinItFrame.position}
            initialSize={spinItFrame.size}
            widthClassName=""
            {...windowProps("spinit")}
          >
            {({ dragHandleProps, lights }) => <SpinIt dragHandleProps={dragHandleProps} lights={lights} />}
          </MacWindow>
        )}

        {openWindows.about && (
          <MacWindow
            title="Intro"
            initialPosition={introFrame.position}
            initialSize={introFrame.size}
            widthClassName=""
            resizable
            minSize={{ w: 420, h: 320 }}
            {...windowProps("about")}
          >
            <IntroCall initialShowInfo={screenInit.photoBoothInfo ?? false} onBookCall={() => openWindow("reminders")} onOpenCv={() => openWindow("cv")} />
          </MacWindow>
        )}

        <KimLLM open={llmOpen} onClose={() => setLlmOpen(false)} />

        <Dock sections={dockSections} isRunning={(app) => Boolean(app.running || (app.action && openWindows[app.action]))} onOpen={openFromDock} minimized={minimizedInDock} />
      </div>
      )}
    </main>
  );
}

// Harbor's logo (from harbor_icon.svg), drawn in the menu bar's text color at the height of the menu text.
function HarborLogo() {
  return (
    <svg viewBox="0 0 82 82" className="h-[15px] w-[15px] shrink-0" fill="none" aria-hidden="true">
      <path d="M41.127 2.46777C51.7035 2.46814 60.4022 10.5048 61.4502 20.8037C71.7525 21.8499 79.7918 30.5516 79.792 41.1299C79.7917 51.7081 71.7524 60.4079 61.4502 61.4541C60.4025 71.7532 51.7037 79.7897 41.127 79.79C30.5493 79.79 21.8509 71.7528 20.8037 61.4531C10.5028 60.4058 2.46509 51.7072 2.46484 41.1299C2.46505 30.5525 10.5027 21.8521 20.8037 20.8047C21.8512 10.5053 30.5495 2.46777 41.127 2.46777ZM41.127 6.8623C32.9699 6.8623 26.2374 12.9518 25.2246 20.832C31.7179 21.5695 37.2862 25.3515 40.4707 30.7158C38.8744 30.7963 37.3743 31.2414 36.0508 31.9678C33.5823 28.4287 29.7256 25.93 25.2676 25.2686C25.9286 29.7274 28.4256 33.5849 31.9639 36.0537C31.2375 37.3772 30.7925 38.8774 30.7119 40.4736C25.3482 37.2887 21.5681 31.7197 20.8311 25.2256C12.9494 26.2383 6.85958 32.9726 6.85938 41.1299C6.85962 49.2871 12.9495 56.0195 20.8311 57.0322C21.5692 50.5308 25.3568 44.9555 30.7305 41.7725C30.8473 43.351 31.3198 44.8293 32.0684 46.1299C28.4738 48.5952 25.9344 52.4864 25.2666 56.9893C29.8034 56.3164 33.7186 53.7428 36.1807 50.1045C37.5127 50.8109 39.0176 51.2318 40.6162 51.29C37.4581 56.7879 31.8193 60.6768 25.2246 61.4258C26.2371 69.3064 32.9696 75.3965 41.127 75.3965C49.2841 75.3961 56.0175 69.3059 57.0303 61.4258C50.4315 60.6759 44.7873 56.7829 41.6299 51.2793C43.2106 51.1836 44.6941 50.7314 46.0029 50.002C48.4607 53.6943 52.4085 56.3094 56.9873 56.9893C56.3079 52.4095 53.6915 48.4626 49.999 46.0049C50.7285 44.6954 51.1802 43.2113 51.2754 41.6299C56.7799 44.7873 60.6737 50.4323 61.4229 57.0332C69.3056 56.0217 75.3972 49.288 75.3975 41.1299C75.3973 32.9717 69.3057 26.2361 61.4229 25.2246C60.6745 31.8211 56.7846 37.4615 51.2861 40.6201C51.2279 39.0215 50.807 37.5167 50.1006 36.1846C53.7395 33.7226 56.3144 29.8064 56.9873 25.2686C52.4852 25.937 48.5942 28.4782 46.1289 32.0732C44.8282 31.3241 43.3494 30.8515 41.7705 30.7344C44.9536 25.3602 50.5298 21.5708 57.0303 20.832C56.0172 12.9522 49.2839 6.86267 41.127 6.8623Z" fill="currentColor" />
    </svg>
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

// What a project opens, for its hover card: the case study's area and headline.
function projectHint(title: string): IconHint | undefined {
  const study = caseStudies[title];
  if (!study) return undefined;
  return { eyebrow: study.eyebrow.replace("Case Study · ", ""), title: study.title, action: "Double-click to read the case study" };
}

function ProjectIcon({
  project,
  tagColor,
  tone,
  hint,
  selected,
  onSelect,
  onOpen,
}: {
  project: Project;
  tagColor: string;
  tone: "light" | "dark";
  hint?: IconHint;
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
      aria-label={`${title}${hint?.eyebrow ? `, ${hint.eyebrow} case study` : ""}, double-click to open`}
      className="group relative flex w-[150px] flex-col items-center gap-[7px] px-1 py-1 text-center outline-none"
    >
      <span className={`flex h-[94px] w-[140px] items-center justify-center rounded-[10px] transition-colors ${selectionClass(tone, selected)} ${selected ? "" : "group-hover:bg-black/[0.05]"}`}>
        <img
          src={image}
          alt=""
          className={`h-[76px] w-[120px] rounded-[4px] shadow-[0_3px_10px_rgba(0,0,0,0.25),0_0_0_2px_#fff] transition-transform duration-200 group-hover:-translate-y-0.5 ${project.imageFit === "contain" ? "object-contain" : "object-cover"}`}
          style={project.imageBg ? { background: project.imageBg } : undefined}
          draggable={false}
        />
      </span>
      <span className={`flex max-w-[150px] items-center gap-1.5 rounded-[5px] px-1.5 py-px text-[13px] font-semibold leading-[16px] ${labelClass(tone, selected)}`}>
        <span className="h-[9px] w-[9px] shrink-0 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.4)]" style={{ background: tagColor }} aria-hidden="true" />
        <span className="truncate">{title}</span>
      </span>
      {hint && <HintCard hint={hint} />}
    </button>
  );
}
