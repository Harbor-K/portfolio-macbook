import React from "react";
import { ALargeSmallIcon, ContrastIcon, MoonIcon, PauseIcon, Volume1Icon, Volume2Icon, type LucideIcon } from "lucide-react";
import type { A11ySettings } from "./AccessibilityPane";
import type { ThemeSetting } from "./Settings";
import { labelImage, tracks } from "../data/spinIt";
import { player, usePlayer } from "./player";

// Control Center, opened from the menu bar (the two-switch icon), modelled on macOS Control Center:
// accessibility toggles as pill tiles on the left, Now Playing for Spin it on the right, a Dark Mode tile,
// and a Sound slider. It replaces the old System Settings window.
const a11yTiles: { key: keyof A11ySettings; title: string; icon: LucideIcon }[] = [
  { key: "reduceMotion", title: "Reduce motion", icon: PauseIcon },
  { key: "increaseContrast", title: "Increase contrast", icon: ContrastIcon },
  { key: "largerText", title: "Larger text", icon: ALargeSmallIcon },
];

const tile = "bg-white/[0.16] ring-1 ring-inset ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]";

export function ControlCenter({
  isDark,
  onThemeChange,
  a11y,
  onA11yChange,
  onOpenSpinIt,
}: {
  isDark: boolean;
  onThemeChange: (theme: ThemeSetting) => void;
  a11y: A11ySettings;
  onA11yChange: (next: A11ySettings) => void;
  onOpenSpinIt: () => void;
}) {
  const { index, playing, volume } = usePlayer();
  const track = tracks[index];

  return (
    <div
      role="dialog"
      aria-label="Control Center"
      onClick={(event) => event.stopPropagation()}
      className="w-[312px] rounded-[24px] border border-white/20 bg-[rgba(58,58,64,0.74)] p-[12px] text-left font-normal text-white shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-2xl backdrop-saturate-150 [text-shadow:none]"
    >
      <style>{`
        .cc-range { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; outline: none; cursor: pointer; }
        .cc-range::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 999px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.35); }
        .cc-range::-moz-range-thumb { width: 16px; height: 16px; border: 0; border-radius: 999px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.35); }
        .cc-range:focus-visible { outline: 2px solid var(--system-blue); outline-offset: 4px; }
      `}</style>

      <div className="grid grid-cols-4 gap-[10px]" style={{ gridAutoRows: "64px" }}>
        {/* Accessibility toggles, left column */}
        {a11yTiles.map(({ key, title, icon }, i) => (
          <ToggleTile
            key={key}
            title={title}
            icon={icon}
            on={a11y[key]}
            onClick={() => onA11yChange({ ...a11y, [key]: !a11y[key] })}
            style={{ gridColumn: "1 / span 2", gridRow: `${i + 1}` }}
          />
        ))}

        {/* Now Playing: Spin it's song. Artwork and title open the record player. */}
        <div className={`flex flex-col rounded-[24px] p-[12px] ${tile}`} style={{ gridColumn: "3 / span 2", gridRow: "1 / span 2" }}>
          <button type="button" onClick={onOpenSpinIt} className="flex min-w-0 flex-col items-start text-left" aria-label={`Open Spin it: ${track?.title ?? "music"}`}>
            <img src={labelImage} alt="" className="h-[34px] w-[34px] rounded-[8px] object-cover shadow-[0_2px_6px_rgba(0,0,0,0.3)]" draggable={false} />
            <span className="mt-[8px] block w-full truncate text-[14px] font-semibold leading-[18px]">{track?.title ?? "Spin it"}</span>
            <span className="block w-full truncate text-[12px] leading-[16px] text-white/65">{track?.artist ?? "No song yet"}</span>
          </button>
          <div className="mt-auto flex items-center justify-between px-[2px]">
            <MediaButton label="Previous" onClick={() => player.step(-1)}>
              <path d="M11 6v12L3 12l8-6Zm10 0v12l-8-6 8-6Z" />
            </MediaButton>
            <MediaButton label={playing ? "Pause" : "Play"} onClick={() => player.toggle()} big>
              {playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />}
            </MediaButton>
            <MediaButton label="Next" onClick={() => player.step(1)}>
              <path d="M13 6v12l8-6-8-6ZM3 6v12l8-6-8-6Z" />
            </MediaButton>
          </div>
        </div>

        {/* Dark Mode: switches the whole desktop between light and dark. */}
        <ToggleTile
          title="Dark Mode"
          icon={MoonIcon}
          on={isDark}
          onClick={() => onThemeChange(isDark ? "light" : "dark")}
          dark
          style={{ gridColumn: "3 / span 2", gridRow: "3" }}
        />

        {/* Sound: Spin it's volume */}
        <div className={`flex flex-col justify-center rounded-[24px] px-[14px] ${tile}`} style={{ gridColumn: "1 / span 4", gridRow: "4" }}>
          <p className="text-[13px] font-semibold leading-[16px]">Sound</p>
          <div className="mt-[8px] flex items-center gap-[10px]">
            <Volume1Icon className="h-[16px] w-[16px] shrink-0" strokeWidth={2.2} aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => player.setVolume(Number(e.target.value) / 100)}
              aria-label="Volume"
              className="cc-range min-w-0 flex-1"
              style={{ background: `linear-gradient(90deg, #fff ${volume * 100}%, rgba(255,255,255,0.28) ${volume * 100}%)` }}
            />
            <Volume2Icon className="h-[16px] w-[16px] shrink-0" strokeWidth={2.2} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

// A pill tile: a round icon (white when on) with the setting's name and On / Off underneath.
function ToggleTile({
  title,
  icon: Icon,
  on,
  onClick,
  dark,
  style,
}: {
  title: string;
  icon: LucideIcon;
  on: boolean;
  onClick: () => void;
  dark?: boolean;
  style: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`flex items-center gap-[10px] rounded-full pl-[10px] pr-[12px] text-left transition-colors hover:bg-white/[0.22] ${tile}`}
      style={style}
    >
      <span
        className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full transition-colors ${
          on ? `bg-white ${dark ? "text-black" : "text-[#0a84ff]"}` : "bg-white/20 text-white"
        }`}
      >
        <Icon className="h-[20px] w-[20px]" strokeWidth={2.2} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-[16px]">{title}</span>
        <span className="block text-[12px] leading-[15px] text-white/65">{on ? "On" : "Off"}</span>
      </span>
    </button>
  );
}

function MediaButton({ label, onClick, big, children }: { label: string; onClick: () => void; big?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-full text-white/90 transition-transform hover:text-white active:scale-90 ${big ? "h-9 w-9" : "h-8 w-8"}`}
    >
      <svg viewBox="0 0 24 24" className={big ? "h-[24px] w-[24px]" : "h-[18px] w-[18px]"} fill="currentColor" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
