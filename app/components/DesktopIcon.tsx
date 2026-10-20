import React, { useState } from "react";
import { ArchiveIcon, AtSignIcon, Disc3Icon, FileTextIcon, FolderIcon, HelpCircleIcon } from "lucide-react";

type DesktopIconKind = "folder" | "avatar" | "image" | "pdf" | "disc" | "globe" | "contact" | "archive" | "news" | "flag";

/** What a desktop item opens, shown in a small card when the pointer rests on it (or it has keyboard focus). */
export type IconHint = { eyebrow?: string; title: string; body?: string; action?: string };

type DesktopIconProps = {
  label: string;
  kind: DesktopIconKind;
  className?: string;
  imageSrc?: string;
  /** Shown if imageSrc fails to load (e.g. not uploaded yet). */
  fallbackSrc?: string;
  selected?: boolean;
  /** "light" wallpaper: dark labels without a shadow; "dark" (photo) wallpaper: white labels with a shadow. */
  tone?: "light" | "dark";
  hint?: IconHint;
  onSelect?: () => void;
  onOpen?: () => void;
};

/** Label colours for desktop items on a light or dark wallpaper. */
export function labelClass(tone: "light" | "dark", selected: boolean) {
  if (selected) return "bg-[color:var(--system-blue)] text-white";
  return tone === "light" ? "text-black/80" : "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_6px_rgba(0,0,0,0.5)]";
}

export function selectionClass(tone: "light" | "dark", selected: boolean) {
  if (!selected) return "";
  return tone === "light" ? "bg-black/[0.07] ring-1 ring-black/10" : "bg-black/25 ring-1 ring-white/25";
}

/** Hover card that opens to the left of a desktop item (the icons sit along the right edge). */
export function HintCard({ hint }: { hint: IconHint }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute right-full top-1 z-20 mr-2 w-[232px] translate-x-1 rounded-[12px] border border-black/[0.08] bg-white/95 p-3 text-left opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-hover:delay-300 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
    >
      {hint.eyebrow && <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-black/45">{hint.eyebrow}</span>}
      <span className="mt-0.5 block text-[13px] font-semibold leading-[17px] text-black/85">{hint.title}</span>
      {hint.body && <span className="mt-1 block text-[12px] leading-[16px] text-black/60">{hint.body}</span>}
      {hint.action && (
        <span className="mt-2 flex items-center gap-1.5 border-t border-black/[0.08] pt-2 text-[11px] font-medium text-[color:var(--system-blue)]">
          {hint.action}
        </span>
      )}
    </span>
  );
}

// macOS desktop: single click selects, double click opens.
// Labels follow the wallpaper (dark on the plain Studio wallpaper, white with a shadow on photos);
// a selected label gets a blue rounded highlight. Resting the pointer on an item shows what it opens.
export function DesktopIcon({ label, kind, className = "", imageSrc, fallbackSrc, selected = false, tone = "dark", hint, onSelect, onOpen }: DesktopIconProps) {
  return (
    <button
      type="button"
      className={`group relative flex w-[120px] flex-col items-center gap-[6px] px-1 py-1 text-center outline-none ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen?.();
      }}
      aria-label={`${label}${hint?.body ? `: ${hint.body}` : ""}${onOpen ? ", double-click to open" : ""}`}
    >
      <span className={`flex h-[84px] w-[92px] items-center justify-center rounded-[10px] transition-colors ${selectionClass(tone, selected)} ${selected ? "" : "group-hover:bg-black/[0.05]"}`}>
        <IconGlyph kind={kind} imageSrc={imageSrc} fallbackSrc={fallbackSrc} />
      </span>
      <span className={`max-w-[120px] rounded-[5px] px-1.5 py-px text-[13px] font-semibold leading-[16px] ${labelClass(tone, selected)}`}>{label}</span>
      {hint && <HintCard hint={hint} />}
    </button>
  );
}

/* An icon image with its own shape and shadow baked in: shown as-is, no frame. Falls back to a framed photo. */
function PlainImage({ src, fallbackSrc }: { src?: string; fallbackSrc?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return fallbackSrc ? <FramedPhoto src={fallbackSrc} /> : <span className="h-[72px] w-[72px] rounded-[14px] bg-white/40" />;
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="h-[76px] w-[76px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
      draggable={false}
    />
  );
}

function FramedPhoto({ src }: { src: string }) {
  return <img src={src} alt="" className="h-[72px] w-[72px] rounded-[4px] object-cover object-[50%_30%] shadow-[0_2px_6px_rgba(0,0,0,0.35),0_0_0_2px_#fff]" draggable={false} />;
}

function IconGlyph({ kind, imageSrc, fallbackSrc }: { kind: DesktopIconKind; imageSrc?: string; fallbackSrc?: string }) {
  if (kind === "image") {
    return <PlainImage src={imageSrc} fallbackSrc={fallbackSrc} />;
  }

  if (kind === "folder") {
    return <FolderIcon className="h-[60px] w-[60px] fill-[#7cc4f8] text-[#3c93de] drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]" strokeWidth={1.1} />;
  }

  if (kind === "avatar") {
    if (imageSrc) return <FramedPhoto src={imageSrc} />;
    return <span className="h-[60px] w-[60px] rounded-[4px] bg-[#e7b682]" />;
  }

  if (kind === "pdf") {
    return (
      <span className="relative flex h-[60px] w-[47px] flex-col justify-end rounded-[3px] bg-white p-1.5 shadow-[0_2px_5px_rgba(0,0,0,0.3),0_0_0_0.5px_rgba(0,0,0,0.15)]">
        <FileTextIcon className="absolute left-2 top-2 h-6 w-6 text-black/25" strokeWidth={1.1} />
        <span className="rounded-[2px] bg-[color:var(--system-red)] py-px text-[8px] font-bold tracking-wide text-white">PDF</span>
      </span>
    );
  }

  if (kind === "disc") {
    return (
      <span className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[conic-gradient(from_120deg,#e9e9f0,#c7d7ff,#f6d6ff,#d4fff0,#e9e9f0)] shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
        <Disc3Icon className="h-9 w-9 text-black/15" strokeWidth={1} />
        <span className="absolute h-4 w-4 rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]" />
      </span>
    );
  }

  if (kind === "globe") {
    return (
      <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[color:var(--system-blue)] shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
        <HelpCircleIcon className="h-7 w-7 text-white" strokeWidth={2.4} />
      </span>
    );
  }

  if (kind === "contact") {
    return <AtSignIcon className="h-[54px] w-[54px] text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]" strokeWidth={2.4} />;
  }

  if (kind === "archive") {
    return (
      <span className="flex h-[56px] w-[56px] items-center justify-center rounded-[10px] bg-gradient-to-b from-[#f2f2f4] to-[#d8d8de] shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
        <ArchiveIcon className="h-8 w-8 text-black/55" strokeWidth={1.4} />
      </span>
    );
  }

  if (kind === "news") {
    return (
      <span className="flex h-[56px] w-[56px] flex-col justify-center gap-[5px] rounded-[12px] bg-white px-2.5 shadow-[0_2px_5px_rgba(0,0,0,0.3)]">
        <span className="h-[6px] w-full rounded-[2px] bg-[color:var(--system-red)]" />
        <span className="h-[3px] w-full rounded-[2px] bg-black/20" />
        <span className="h-[3px] w-4/5 rounded-[2px] bg-black/20" />
        <span className="h-[3px] w-3/5 rounded-[2px] bg-black/20" />
      </span>
    );
  }

  return <span className="h-10 w-[59px] rounded-[3px] bg-white shadow-[0_2px_5px_rgba(0,0,0,0.3)]" />;
}
