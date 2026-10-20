import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  LockIcon,
  MicIcon,
  SearchIcon,
  ShareIcon,
  UserRoundIcon,
} from "lucide-react";
import type { DragHandleProps } from "./MacWindow";
import { AccessibilityPane, type A11ySettings } from "./AccessibilityPane";
import type { ThemeSetting } from "./Settings";
import { Reminders } from "./Reminders";
import { SpinIt } from "./SpinIt";
import { caseStudies } from "../data/caseStudies";
import { projects } from "../data/portfolio";
import { notes } from "../data/notes";
import { cv } from "../data/cv";
import { aboutIcon, aboutPortrait, aboutVideo } from "../data/aboutVideo";
import { dockSections, settingsIcon, spinItIcon } from "../data/dock";
import {
  cvPdfIcon,
  notesIcon,
  projectFolderIcon,
} from "../data/projectFolderIcon";
import { tagColorFor, tagNameFor } from "../data/tags";

// Mobile version of the portfolio, laid out like the iOS Safari start page:
// a search field (Kim LLM), an intro card, Favourites, project Suggestions, an Accessibility report,
// a Reading List of notes and a floating toolbar. Tapping anything opens it as a page inside this "Safari".
// Colors use the same black/xx and bg-white classes as the desktop windows, so the dark-mode and
// increase-contrast rules in index.css apply here too ([data-themed]).

type Page =
  | { kind: "home" }
  | { kind: "projects" }
  | { kind: "case"; title: string }
  | { kind: "note"; id: string }
  | { kind: "cv" }
  | { kind: "about" }
  | { kind: "meet" }
  | { kind: "spinit" }
  | { kind: "settings" };

const noDrag: DragHandleProps = {
  onPointerDown() {},
  onPointerMove() {},
  onPointerUp() {},
  onDoubleClick() {},
};
const remindersIcon =
  dockSections.flat().find((app) => app.id === "reminders")?.imageUrl ?? "";
const caseOrder = Object.keys(caseStudies);

function urlOf(page: Page) {
  switch (page.kind) {
    case "home":
      return "";
    case "projects":
      return "harbor.design/work";
    case "case":
      return caseStudies[page.title]?.url ?? "harbor.design/work";
    case "note":
      return `harbor.design/notes/${page.id}`;
    case "cv":
      return "harbor.design/cv";
    case "about":
      return "harbor.design/about";
    case "meet":
      return "harbor.design/meet";
    case "spinit":
      return "harbor.design/spin-it";
    case "settings":
      return "Settings";
  }
}

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

const sectionTitle =
  "px-1 text-[26px] font-bold leading-[32px] tracking-[-0.02em] text-black/90";
const card = "rounded-[22px] bg-black/[0.05]";
const glass =
  "bg-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.18),inset_0_0_0_0.5px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-150";

export function MobileSafari({
  theme,
  onThemeChange,
  a11y,
  onA11yChange,
  onAskKim,
}: {
  theme: ThemeSetting;
  onThemeChange: (theme: ThemeSetting) => void;
  a11y: A11ySettings;
  onA11yChange: (next: A11ySettings) => void;
  onAskKim: () => void;
}) {
  const [history, setHistory] = useState<Page[]>([{ kind: "home" }]);
  const [cursor, setCursor] = useState(0);
  const [toast, setToast] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const page = history[cursor];

  function go(next: Page) {
    setHistory((h) => [...h.slice(0, cursor + 1), next]);
    setCursor((c) => c + 1);
  }

  // Every page starts at the top, like loading a new page.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [cursor, history]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function share() {
    const data = { title: "Harbor — Portfolio", url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(data.url);
      setToast("Link copied");
    } catch {
      /* share sheet dismissed or clipboard blocked: nothing to do */
    }
  }

  const url = urlOf(page);

  return (
    // data-themed sits on a wrapper: the dark-mode rules target elements inside it.
    <div data-themed="" className="h-full">
      <div className="relative flex h-full flex-col bg-white leading-[1.35] text-black/85">
        {/* Search field: asks Kim LLM on the start page, shows the address on other pages. */}
        <div className="shrink-0 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onAskKim}
            aria-label="Ask Kim LLM about Harbor"
            className="flex h-[48px] w-full items-center gap-3 rounded-full bg-[#f0f0f2] px-4 text-left"
          >
            {url ? (
              <LockIcon
                className="h-[15px] w-[15px] shrink-0 text-black/45"
                strokeWidth={2.2}
              />
            ) : (
              <SearchIcon
                className="h-[20px] w-[20px] shrink-0 text-black/55"
                strokeWidth={2.2}
              />
            )}
            <span
              className={`min-w-0 flex-1 truncate text-center text-[17px] ${url ? "text-black/85" : "text-black/45"}`}
            >
              {url || "Ask Kim LLM about Harbor"}
            </span>
            <MicIcon
              className="h-[19px] w-[19px] shrink-0 text-black/55"
              strokeWidth={2}
            />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {page.kind === "home" && <Home a11y={a11y} go={go} />}
          {page.kind === "projects" && <ProjectsPage go={go} />}
          {page.kind === "case" && <CasePage title={page.title} go={go} />}
          {page.kind === "note" && <NotePage id={page.id} />}
          {page.kind === "cv" && <CvPage />}
          {page.kind === "about" && <AboutPage go={go} />}
          {page.kind === "meet" && (
            <div className="h-full pb-[96px]">
              <Reminders dragHandleProps={noDrag} lights={null} />
            </div>
          )}
          {page.kind === "spinit" && (
            <div className="px-4 pb-[120px] pt-2">
              <h1 className={sectionTitle}>Spin it</h1>
              <div className="mt-4 h-[210px] overflow-hidden rounded-[22px] shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
                <SpinIt dragHandleProps={noDrag} lights={null} />
              </div>
            </div>
          )}
          {page.kind === "settings" && (
            <SettingsPage
              theme={theme}
              onThemeChange={onThemeChange}
              a11y={a11y}
              onA11yChange={onA11yChange}
            />
          )}
        </div>

        {toast && (
          <p
            role="status"
            className="absolute bottom-[104px] left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-[14px] text-white"
          >
            {toast}
          </p>
        )}

        {/* Floating toolbar, as in iOS Safari */}
        <nav
          aria-label="Toolbar"
          className={`absolute inset-x-4 bottom-[max(16px,env(safe-area-inset-bottom))] flex h-[62px] items-center justify-around rounded-full ${glass}`}
        >
          <ToolbarButton
            label="Back"
            disabled={cursor === 0}
            onClick={() => setCursor((c) => Math.max(0, c - 1))}
          >
            <ChevronLeftIcon className="h-[26px] w-[26px]" strokeWidth={1.8} />
          </ToolbarButton>
          <ToolbarButton
            label="Forward"
            disabled={cursor >= history.length - 1}
            onClick={() =>
              setCursor((c) => Math.min(history.length - 1, c + 1))
            }
          >
            <ChevronRightIcon className="h-[26px] w-[26px]" strokeWidth={1.8} />
          </ToolbarButton>
          <ToolbarButton label="Share" onClick={share}>
            <ShareIcon className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </ToolbarButton>
          <ToolbarButton
            label="All projects"
            onClick={() => page.kind !== "projects" && go({ kind: "projects" })}
          >
            <BookOpenIcon className="h-[24px] w-[24px]" strokeWidth={1.8} />
          </ToolbarButton>
          <ToolbarButton
            label="Start page"
            onClick={() => page.kind !== "home" && go({ kind: "home" })}
          >
            <CopyIcon className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </ToolbarButton>
        </nav>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-[48px] w-[48px] items-center justify-center rounded-full text-black/80 disabled:text-black/25"
    >
      {children}
    </button>
  );
}

function Home({ a11y, go }: { a11y: A11ySettings; go: (page: Page) => void }) {
  const favourites: {
    name: string;
    icon: string;
    fallback?: string;
    page: Page;
  }[] = [
    {
      name: "About",
      icon: aboutIcon,
      fallback: aboutPortrait,
      page: { kind: "about" },
    },
    { name: "Projects", icon: projectFolderIcon, page: { kind: "projects" } },
    { name: "CV.pdf", icon: cvPdfIcon, page: { kind: "cv" } },
    { name: "Notes", icon: notesIcon, page: { kind: "note", id: notes[0].id } },
    { name: "Meet Harbor", icon: remindersIcon, page: { kind: "meet" } },
    { name: "Spin it", icon: spinItIcon, page: { kind: "spinit" } },
    { name: "Settings", icon: settingsIcon, page: { kind: "settings" } },
  ];
  const onCount = [
    a11y.reduceMotion,
    a11y.increaseContrast,
    a11y.largerText,
  ].filter(Boolean).length;

  return (
    <div className="space-y-9 px-4 pb-[120px] pt-3">
      {/* Intro card (in place of Safari's Private Browsing card) */}
      <section className={`${card} px-6 py-7 text-center`}>
        <h1 className="text-[30px] font-bold leading-[36px] tracking-[-0.02em] text-black/90">
          {cv.name}
        </h1>
        <p className="mt-2 text-[15px] font-medium leading-[20px] text-black/60">
          {cv.headline}
        </p>
        <p
          data-readable=""
          className="mt-3 text-[16px] leading-[23px] text-black/55"
        >
          {cv.profile}
        </p>
      </section>

      <section>
        <h2 className={`${sectionTitle} flex items-center gap-2`}>
          <UserRoundIcon
            className="h-[24px] w-[24px] fill-current"
            strokeWidth={0}
          />
          Favourites
        </h2>
        <ul className="mt-4 grid grid-cols-4 gap-x-3 gap-y-5">
          {favourites.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                onClick={() => go(item.page)}
                className="flex w-full flex-col items-center gap-2"
              >
                <span className="flex aspect-square w-full items-center justify-center rounded-[18px] bg-black/[0.05]">
                  <FallbackImg
                    src={item.icon}
                    fallback={item.fallback}
                    className={
                      item.fallback
                        ? "h-[70%] w-[70%] rounded-[12px] object-cover"
                        : "h-[78%] w-[78%] object-contain"
                    }
                  />
                </span>
                <span className="w-full truncate text-center text-[13px] font-medium leading-[18px] text-black/80">
                  {item.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className={sectionTitle}>Projects</h2>
          <button
            type="button"
            onClick={() => go({ kind: "projects" })}
            className="flex items-center gap-0.5 text-[17px] text-black/70"
          >
            Show All <ChevronRightIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {projects.map((project, index) => {
            const study = caseStudies[project.title];
            return (
              <li key={project.title}>
                <button
                  type="button"
                  onClick={() => go({ kind: "case", title: project.title })}
                  className={`flex w-full flex-col overflow-hidden text-left ${card}`}
                >
                  <span
                    className="flex h-[96px] w-full items-center justify-center overflow-hidden"
                    style={{ background: project.imageBg ?? "#ddd" }}
                  >
                    <img
                      src={project.image}
                      alt=""
                      className={`h-full w-full ${project.imageFit === "contain" ? "object-contain" : "object-cover"}`}
                      draggable={false}
                    />
                  </span>
                  <span className="block w-full px-3 pb-3 pt-2.5">
                    <span className="block truncate text-[16px] font-semibold leading-[22px] text-black/90">
                      {project.title}
                    </span>
                    <span className="block truncate text-[13px] leading-[18px] text-black/45">
                      {study?.url.replace("harbor.design/", "") ?? ""}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] px-2.5 py-1 text-[12px] font-medium text-black/70">
                      <span
                        className="h-[8px] w-[8px] rounded-full"
                        style={{ background: tagColorFor(index) }}
                      />
                      {tagNameFor(index)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Accessibility report (in place of Safari's Privacy Report) */}
      <section>
        <h2 className={sectionTitle}>Accessibility</h2>
        <button
          type="button"
          onClick={() => go({ kind: "settings" })}
          className={`mt-4 flex w-full items-center gap-4 px-5 py-5 text-left ${card}`}
        >
          <AccessibilityIcon
            className="h-[30px] w-[30px] shrink-0 text-black/80"
            strokeWidth={1.8}
          />
          <span className="text-[16px] leading-[22px] text-black/75">
            Reduce motion, increase contrast or enlarge text to read this
            portfolio your way.{" "}
            <span className="font-semibold text-black/90">
              {onCount === 0 ? "All settings are off." : `${onCount} of 3 on.`}
            </span>
          </span>
        </button>
      </section>

      {/* Reading List: Harbor's notes */}
      <section>
        <h2 className={sectionTitle}>Reading List</h2>
        <ul
          className={`mt-4 divide-y divide-black/[0.08] overflow-hidden ${card}`}
        >
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => go({ kind: "note", id: note.id })}
                className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
              >
                <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-black/[0.06]">
                  {note.images?.[0] ? (
                    <img
                      src={note.images[0].src}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <img
                      src={notesIcon}
                      alt=""
                      className="h-[44px] w-[44px] object-contain"
                      draggable={false}
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-semibold leading-[23px] text-black/90">
                    {note.title}
                  </span>
                  <span className="block truncate text-[14px] leading-[20px] text-black/50">
                    {note.subtitle}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function FallbackImg({
  src,
  fallback,
  className,
}: {
  src: string;
  fallback?: string;
  className: string;
}) {
  const [current, setCurrent] = useState(src);
  return (
    <img
      src={current}
      alt=""
      className={className}
      draggable={false}
      onError={() => fallback && current !== fallback && setCurrent(fallback)}
    />
  );
}

function ProjectsPage({ go }: { go: (page: Page) => void }) {
  return (
    <div className="px-4 pb-[120px] pt-2">
      <h1 className={sectionTitle}>Projects</h1>
      <ul
        className={`mt-4 divide-y divide-black/[0.08] overflow-hidden ${card}`}
      >
        {projects.map((project, index) => (
          <li key={project.title}>
            <button
              type="button"
              onClick={() => go({ kind: "case", title: project.title })}
              className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
            >
              <span
                className="flex h-[56px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[10px]"
                style={{ background: project.imageBg ?? "#ddd" }}
              >
                <img
                  src={project.image}
                  alt=""
                  className={`h-full w-full ${project.imageFit === "contain" ? "object-contain" : "object-cover"}`}
                  draggable={false}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[17px] font-semibold text-black/90">
                  <span
                    className="h-[9px] w-[9px] shrink-0 rounded-full"
                    style={{ background: tagColorFor(index) }}
                  />
                  <span className="truncate">{project.title}</span>
                </span>
                <span className="mt-0.5 block truncate text-[14px] leading-[20px] text-black/50">
                  {caseStudies[project.title]?.eyebrow}
                </span>
              </span>
              <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-black/30" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// A case study, laid out for a phone. Like real web pages, it stays light in dark mode.
function CasePage({ title, go }: { title: string; go: (page: Page) => void }) {
  const article = caseStudies[title];
  const index = caseOrder.indexOf(title);
  const next = caseOrder[(index + 1) % caseOrder.length];
  if (!article) return null;
  return (
    <div
      data-keep-light=""
      data-readable=""
      className="min-h-full bg-white pb-[110px] text-[#1d1d1f]"
    >
      <header
        className="px-5 pb-9 pt-7 text-white"
        style={{ background: article.brandColor }}
      >
        <img
          src={article.logo}
          alt=""
          className={article.logoClassName ?? "h-[52px] w-auto rounded-[6px]"}
          draggable={false}
        />
        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">
          {article.eyebrow}
        </p>
        <h1 className="mt-2 text-[27px] font-bold leading-[1.15] tracking-[-0.02em]">
          {article.title}
        </h1>
        <p className="mt-3 text-[16px] leading-[1.5] text-white/90">
          {article.summary}
        </p>
      </header>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-b border-[#e5e5ea] px-5 py-5">
        {article.meta.map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">
              {item.label}
            </dt>
            <dd className="mt-1 text-[14px] leading-[1.4] text-[#3a3a3c]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      <article className="px-5 pt-6">
        {article.sections.map((section) => (
          <section key={section.heading} className="mb-8">
            <h2 className="text-[21px] font-semibold tracking-[-0.01em]">
              {section.heading}
            </h2>
            {section.body && (
              <p className="mt-2 text-[16px] leading-[1.6] text-[#3a3a3c]">
                {section.body}
              </p>
            )}
            {section.list && (
              <ul className="mt-3 space-y-2">
                {section.list.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[16px] leading-[1.55] text-[#3a3a3c]"
                  >
                    <span
                      className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full"
                      style={{ background: article.brandColor }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
      <div className="px-5">
        <button
          type="button"
          onClick={() => go({ kind: "case", title: next })}
          className="flex w-full items-center justify-between rounded-[18px] bg-[#f2f2f7] px-5 py-4 text-left"
        >
          <span>
            <span className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">
              Next project
            </span>
            <span className="mt-0.5 block text-[18px] font-semibold">
              {next}
            </span>
          </span>
          <ChevronRightIcon className="h-5 w-5 text-[#86868b]" />
        </button>
      </div>
    </div>
  );
}

function NotePage({ id }: { id: string }) {
  const note = notes.find((n) => n.id === id) ?? notes[0];
  const date = new Date(note.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <article data-readable="" className="px-5 pb-[120px] pt-2">
      <p className="text-center text-[13px] text-black/40">{date}</p>
      <h1 className="mt-4 text-[28px] font-bold leading-[34px] tracking-[-0.02em] text-black/90">
        {note.title}
      </h1>
      <p className="mt-1 text-[16px] text-black/50">{note.subtitle}</p>
      <div className="mt-5 space-y-4 text-[17px] leading-[1.6] text-black/80">
        {note.body.map((paragraph, i) => (
          <p key={i}>{renderInline(paragraph)}</p>
        ))}
      </div>
      {note.images && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {note.images.map((image) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              className="aspect-square w-full rounded-[14px] object-cover"
              draggable={false}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function CvPage() {
  return (
    <div data-readable="" className="px-5 pb-[120px] pt-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold leading-[34px] tracking-[-0.02em] text-black/90">
            {cv.name}
          </h1>
          <p className="mt-1 text-[15px] text-black/55">{cv.headline}</p>
        </div>
      </div>
      {cv.downloadUrl && (
        <a
          href={cv.downloadUrl}
          target="_blank"
          rel="noopener"
          download={cv.downloadName}
          className="mt-4 flex h-[46px] items-center justify-center gap-2 rounded-full bg-[color:var(--system-blue)] text-[16px] font-semibold text-white"
        >
          <DownloadIcon className="h-[18px] w-[18px]" strokeWidth={2.2} />
          Download CV (PDF)
        </a>
      )}
      <p className="mt-6 text-[16px] leading-[1.6] text-black/75">
        {cv.profile}
      </p>
      <CvList
        title="Experience"
        items={cv.experience.map((e) => ({ name: e.org, detail: e.detail }))}
      />
      <CvList title="Selected projects" items={cv.projects} />
      <h2 className="mt-7 text-[13px] font-semibold uppercase tracking-[0.08em] text-black/45">
        Skills
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {cv.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full bg-black/[0.06] px-3 py-1.5 text-[14px] text-black/75"
          >
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CvList({
  title,
  items,
}: {
  title: string;
  items: { name: string; detail: string }[];
}) {
  return (
    <>
      <h2 className="mt-7 text-[13px] font-semibold uppercase tracking-[0.08em] text-black/45">
        {title}
      </h2>
      <ul className={`mt-3 divide-y divide-black/[0.08] ${card}`}>
        {items.map((item) => (
          <li key={item.name} className="px-4 py-3">
            <p className="text-[16px] font-semibold text-black/85">
              {item.name}
            </p>
            <p className="text-[14px] text-black/50">{item.detail}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function AboutPage({ go }: { go: (page: Page) => void }) {
  return (
    <div className="px-4 pb-[120px] pt-2">
      <div className="overflow-hidden rounded-[22px] bg-black">
        {aboutVideo.url ? (
          <video
            src={aboutVideo.url}
            poster={aboutVideo.poster}
            controls
            playsInline
            preload="metadata"
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <img
            src={aboutPortrait}
            alt="Portrait of Harbor"
            className="aspect-[4/3] w-full object-cover"
          />
        )}
      </div>
      <h1 className="mt-5 px-1 text-[28px] font-bold leading-[34px] tracking-[-0.02em] text-black/90">
        {cv.name}
      </h1>
      <p className="mt-1 px-1 text-[15px] text-black/55">{cv.headline}</p>
      <p
        data-readable=""
        className="mt-4 px-1 text-[16px] leading-[1.6] text-black/75"
      >
        {cv.profile}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => go({ kind: "cv" })}
          className="h-[46px] rounded-full bg-black/[0.06] text-[16px] font-semibold text-black/85"
        >
          View CV
        </button>
        <button
          type="button"
          onClick={() => go({ kind: "meet" })}
          className="h-[46px] rounded-full bg-[color:var(--system-blue)] text-[16px] font-semibold text-white"
        >
          Meet Harbor
        </button>
      </div>
    </div>
  );
}

const themeOptions: { id: ThemeSetting; name: string }[] = [
  { id: "auto", name: "Auto" },
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
];

function SettingsPage({
  theme,
  onThemeChange,
  a11y,
  onA11yChange,
}: {
  theme: ThemeSetting;
  onThemeChange: (theme: ThemeSetting) => void;
  a11y: A11ySettings;
  onA11yChange: (next: A11ySettings) => void;
}) {
  return (
    <div className="px-4 pb-[120px] pt-2 text-[15px]">
      <h1 className={sectionTitle}>Settings</h1>
      <h2 className="mt-5 px-1 pb-2 text-[13px] font-semibold text-black/85">
        Appearance
      </h2>
      <div
        role="radiogroup"
        aria-label="Appearance"
        className="grid grid-cols-3 gap-1 rounded-[12px] bg-black/[0.05] p-1"
      >
        {themeOptions.map((option) => {
          const isSel = option.id === theme;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSel}
              onClick={() => onThemeChange(option.id)}
              className={`h-9 rounded-[9px] text-[14px] font-medium ${isSel ? "bg-[color:var(--system-blue)] text-white" : "text-black/70"}`}
            >
              {option.name}
            </button>
          );
        })}
      </div>
      <p className="mt-2 px-1 text-[12px] text-black/45">
        Auto follows your phone&apos;s light or dark setting.
      </p>
      <div className="mt-7">
        <AccessibilityPane value={a11y} onChange={onA11yChange} />
      </div>
    </div>
  );
}
