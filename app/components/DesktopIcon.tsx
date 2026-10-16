import React, { useState } from "react";
import { ArchiveIcon, AtSignIcon, Disc3Icon, FileTextIcon, FolderIcon, HelpCircleIcon } from "lucide-react";

type DesktopIconKind = "folder" | "avatar" | "image" | "pdf" | "disc" | "globe" | "contact" | "archive" | "news" | "flag";

type DesktopIconProps = {
  label: string;
  kind: DesktopIconKind;
  className?: string;
  imageSrc?: string;
  /** Shown if imageSrc fails to load (e.g. not uploaded yet). */
  fallbackSrc?: string;
  selected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
};

// macOS desktop: single click selects, double click opens.
// Labels are 12 pt white with a soft shadow; a selected label gets a blue rounded highlight.
export function DesktopIcon({ label, kind, className = "", imageSrc, fallbackSrc, selected, onSelect, onOpen }: DesktopIconProps) {
  return (
    <button
      type="button"
      className={`group flex w-[104px] flex-col items-center gap-[5px] px-1 py-1 text-center outline-none ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen?.();
      }}
      aria-label={`${label}${onOpen ? ", double-click to open" : ""}`}
    >
      <span className={`flex h-[68px] w-[72px] items-center justify-center rounded-[6px] ${selected ? "bg-black/25 ring-1 ring-white/25" : ""}`}>
        <IconGlyph kind={kind} imageSrc={imageSrc} fallbackSrc={fallbackSrc} />
      </span>
      <span
        className={`max-w-[104px] rounded-[4px] px-1.5 py-px text-[12px] font-medium leading-[15px] ${
          selected ? "bg-[color:var(--system-blue)] text-white" : "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.75),0_0_6px_rgba(0,0,0,0.35)]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/* An icon image with its own shape and shadow baked in: shown as-is, no frame. Falls back to a framed photo. */
function PlainImage({ src, fallbackSrc }: { src?: string; fallbackSrc?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return fallbackSrc ? <FramedPhoto src={fallbackSrc} /> : <span className="h-[60px] w-[60px] rounded-[12px] bg-white/40" />;
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="h-[64px] w-[64px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
      draggable={false}
    />
  );
}

function FramedPhoto({ src }: { src: string }) {
  return <img src={src} alt="" className="h-[60px] w-[60px] rounded-[4px] object-cover object-[50%_30%] shadow-[0_2px_6px_rgba(0,0,0,0.35),0_0_0_2px_#fff]" draggable={false} />;
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
