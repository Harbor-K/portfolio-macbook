import React, { useState } from "react";
import { AccessibilityIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, ContrastIcon, FlowerIcon } from "lucide-react";
import { AccessibilityPane, type A11ySettings } from "./AccessibilityPane";
import type { DragHandleProps } from "./MacWindow";
import { wallpapers } from "../data/wallpaper";

export type ThemeSetting = "auto" | "light" | "dark";

const glass =
  "bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl";

type Pane = "appearance" | "wallpaper" | "accessibility";

const panes: { id: Pane; name: string; icon: typeof ContrastIcon; tile: string }[] = [
  { id: "appearance", name: "Appearance", icon: ContrastIcon, tile: "bg-[#1d1d1f]" },
  { id: "wallpaper", name: "Wallpaper", icon: FlowerIcon, tile: "bg-gradient-to-b from-[#5ac8fa] to-[#0a84ff]" },
  { id: "accessibility", name: "Accessibility", icon: AccessibilityIcon, tile: "bg-gradient-to-b from-[#5ac8fa] to-[#0a84ff]" },
];

const themeOptions: { id: ThemeSetting; name: string }[] = [
  { id: "auto", name: "Auto" },
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
];

// A System Settings-style window with three working panes: Appearance (Auto / Light / Dark), Wallpaper and Accessibility.
export function Settings({
  dragHandleProps,
  lights,
  theme,
  onThemeChange,
  wallpaperId,
  onWallpaperChange,
  a11y,
  onA11yChange,
  initialPane = "wallpaper",
}: {
  dragHandleProps: DragHandleProps;
  lights: React.ReactNode;
  theme: ThemeSetting;
  onThemeChange: (theme: ThemeSetting) => void;
  wallpaperId: string;
  onWallpaperChange: (id: string) => void;
  a11y: A11ySettings;
  onA11yChange: (next: A11ySettings) => void;
  initialPane?: Pane;
}) {
  const [pane, setPane] = useState<Pane>(initialPane);
  const current = panes.find((p) => p.id === pane)!;
  const currentWallpaper = wallpapers.find((w) => w.id === wallpaperId) ?? wallpapers[0];

  return (
    <div className="flex h-full bg-white text-[13px] text-black/85">
      <aside {...dragHandleProps} className="flex w-[210px] shrink-0 select-none flex-col bg-[#f0f0f2] px-2 pt-3">
        <div className="pl-[6px]">{lights}</div>
        <ul className="mt-5 space-y-[2px]" onPointerDown={(e) => e.stopPropagation()}>
          {panes.map(({ id, name, icon: Icon, tile }) => {
            const isSel = id === pane;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setPane(id)}
                  className={`flex h-[32px] w-full items-center gap-2.5 rounded-[8px] px-2 text-left ${
                    isSel ? "bg-[color:var(--system-blue)] text-white" : "hover:bg-black/[0.05]"
                  }`}
                >
                  <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-white shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.2)] ${tile}`}>
                    <Icon className="h-[14px] w-[14px]" strokeWidth={2.2} />
                  </span>
                  <span className={isSel ? "font-medium" : ""}>{name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col border-l border-black/[0.08]">
        <div {...dragHandleProps} className="flex h-[52px] shrink-0 select-none items-center gap-3 px-4">
          <div className={`flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()}>
            <span className="flex h-7 w-7 items-center justify-center text-black/55">
              <ChevronLeftIcon className="h-4 w-4" />
            </span>
            <span className="flex h-7 w-7 items-center justify-center text-black/25">
              <ChevronRightIcon className="h-4 w-4" />
            </span>
          </div>
          <h2 className="text-[15px] font-semibold text-black/85">{current.name}</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-6 pb-8 pt-2">
          {pane === "accessibility" ? (
            <AccessibilityPane value={a11y} onChange={onA11yChange} />
          ) : pane === "appearance" ? (
            <div className="rounded-[12px] bg-black/[0.04] p-5">
              <p className="font-medium text-black/85">Appearance</p>
              <div className="mt-4 flex gap-6">
                {themeOptions.map((option) => {
                  const isSel = option.id === theme;
                  return (
                    <button key={option.id} type="button" onClick={() => onThemeChange(option.id)} className="flex flex-col items-center gap-2 outline-none">
                      <span className={`block rounded-[10px] p-[3px] ${isSel ? "ring-[3px] ring-[color:var(--system-blue)]" : "ring-1 ring-black/15"}`}>
                        <ThemeThumb kind={option.id} />
                      </span>
                      <span className={`text-[12px] ${isSel ? "font-semibold text-black/85" : "text-black/60"}`}>{option.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-[12px] leading-4 text-black/45">Auto follows your device&apos;s light or dark setting.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-5">
                <img
                  src={currentWallpaper.src}
                  alt=""
                  className="h-[120px] w-[192px] shrink-0 rounded-[10px] bg-black/[0.06] object-cover shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
                  style={{ objectPosition: currentWallpaper.objectPosition }}
                  draggable={false}
                />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-black/40">Current wallpaper</p>
                  <p className="mt-1 text-[18px] font-semibold text-black/85">{currentWallpaper.name}</p>
                </div>
              </div>

              <h3 className="mt-5 text-[13px] font-semibold text-black/85">Harbor&apos;s Photos</h3>
              {/* One row that scrolls sideways (trackpad, shift+wheel or drag the scrollbar). */}
              <ul className="-mx-6 mt-3 flex snap-x gap-4 overflow-x-auto px-6 pb-2 pt-1">
                {wallpapers.map((w) => {
                  const isSel = w.id === currentWallpaper.id;
                  return (
                    <li key={w.id} className="w-[150px] shrink-0 snap-start">
                      <button type="button" onClick={() => onWallpaperChange(w.id)} className="flex w-full flex-col items-center gap-2 outline-none">
                        <span className={`relative block w-full rounded-[10px] p-[3px] ${isSel ? "ring-[3px] ring-[color:var(--system-blue)]" : ""}`}>
                          <img
                            src={w.src}
                            alt=""
                            className="aspect-[16/10] w-full rounded-[7px] bg-black/[0.06] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                            style={{ objectPosition: w.objectPosition }}
                            draggable={false}
                          />
                          {isSel && (
                            <span className="absolute bottom-[9px] right-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[color:var(--system-blue)] shadow">
                              <CheckIcon className="h-[11px] w-[11px] text-white" strokeWidth={3.5} />
                            </span>
                          )}
                        </span>
                        <span className={`text-[12px] ${isSel ? "font-semibold text-black/85" : "text-black/60"}`}>{w.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// Tiny window mock-ups for the Appearance choices, drawn in fixed colors so they read the same in either mode.
function ThemeThumb({ kind }: { kind: ThemeSetting }) {
  const light = (
    <span className="flex h-full w-full flex-col bg-[#e9e9ee] p-[6px]">
      <span className="flex gap-[3px]">
        <span className="h-[5px] w-[5px] rounded-full bg-[#ff5f57]" />
        <span className="h-[5px] w-[5px] rounded-full bg-[#febc2e]" />
        <span className="h-[5px] w-[5px] rounded-full bg-[#28c840]" />
      </span>
      <span className="mt-[6px] h-[6px] w-3/4 rounded-[2px] bg-[#c7c7cc]" />
      <span className="mt-[4px] h-[6px] w-1/2 rounded-[2px] bg-[#0088ff]" />
    </span>
  );
  const dark = (
    <span className="flex h-full w-full flex-col bg-[#2c2c2e] p-[6px]">
      <span className="flex gap-[3px]">
        <span className="h-[5px] w-[5px] rounded-full bg-[#ff5f57]" />
        <span className="h-[5px] w-[5px] rounded-full bg-[#febc2e]" />
        <span className="h-[5px] w-[5px] rounded-full bg-[#28c840]" />
      </span>
      <span className="mt-[6px] h-[6px] w-3/4 rounded-[2px] bg-[#5a5a5e]" />
      <span className="mt-[4px] h-[6px] w-1/2 rounded-[2px] bg-[#0088ff]" />
    </span>
  );
  return (
    <span className="relative flex h-[56px] w-[84px] overflow-hidden rounded-[7px]">
      {kind === "dark" ? dark : kind === "light" ? light : (
        <>
          <span className="w-1/2 overflow-hidden">{light}</span>
          <span className="w-1/2 overflow-hidden">{dark}</span>
        </>
      )}
    </span>
  );
}
