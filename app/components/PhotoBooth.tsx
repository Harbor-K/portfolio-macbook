import React, { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { CameraIcon, ChevronsRightIcon, LayoutGridIcon, SquareUserIcon, VideoIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { aboutPhoto } from "../data/aboutMedia";
import { aboutVideo } from "../data/aboutVideo";

type Mode = "info" | "photo" | "video";

// File name used when the shutter saves a screenshot of the whole desktop.
const screenshotName = "Harbor Portfolio.png";
// 1x1 transparent PNG, used if an image on the page can't be fetched for the screenshot.
const blankPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function fmt(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* Player glyphs: solid shapes with softly rounded corners. */
function PlayGlyph() {
  return (
    <svg viewBox="0 0 22 24" className="h-[24px] w-[22px]" aria-hidden="true">
      <path d="M4.5 3 L4.5 21 L19.5 12 Z" fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 22 24" className="h-[24px] w-[22px]" aria-hidden="true">
      <rect x="4" y="3" width="5" height="18" rx="1.6" fill="currentColor" />
      <rect x="13" y="3" width="5" height="18" rx="1.6" fill="currentColor" />
    </svg>
  );
}

function SkipGlyph({ direction }: { direction: "back" | "forward" }) {
  const shapes =
    direction === "back"
      ? ["M11.5 2 L11.5 12 L2.5 7 Z", "M21.5 2 L21.5 12 L12.5 7 Z"]
      : ["M2.5 2 L2.5 12 L11.5 7 Z", "M12.5 2 L12.5 12 L21.5 7 Z"];
  return (
    <svg viewBox="0 0 24 14" className="h-[14px] w-[24px]" aria-hidden="true">
      {shapes.map((d) => (
        <path key={d} d={d} fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/* Thin track with a white pill-shaped thumb. */
function PillSlider({
  value,
  max,
  step,
  label,
  disabled,
  fillClassName,
  className = "",
  onChange,
}: {
  value: number;
  max: number;
  step: number;
  label: string;
  disabled?: boolean;
  fillClassName: string;
  className?: string;
  onChange: (value: number) => void;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const thumbWidth = 20;
  return (
    <div className={`relative h-[14px] ${className}`}>
      <div className="absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-white/30" />
      <div className={`absolute left-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full ${fillClassName}`} style={{ width: `${pct}%` }} />
      <span
        className="absolute top-1/2 h-[14px] -translate-y-1/2 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
        style={{ width: thumbWidth, left: `calc(${pct}% - ${(pct / 100) * thumbWidth}px)` }}
      />
      <input
        type="range"
        min={0}
        max={max || 0}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
      />
    </div>
  );
}

export function PhotoBooth({ initialShowInfo = false }: { initialShowInfo?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const capturing = useRef(false);
  const hasVideo = aboutVideo.url.length > 0;
  const [mode, setMode] = useState<Mode>(initialShowInfo ? "info" : "photo");
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [flash, setFlash] = useState(false);
  const [effectOn, setEffectOn] = useState(false);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  // A clicked HUD button keeps keyboard focus, which would keep the HUD visible after the pointer leaves.
  // Drop that focus when the pointer leaves the video, so the HUD only shows on hover (keyboard users are unaffected).
  function releaseHudFocus() {
    const active = document.activeElement;
    if (active instanceof HTMLElement && hudRef.current?.contains(active)) active.blur();
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
  }

  function skip(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || 0);
  }

  function seek(value: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = value;
    setCurrent(value);
  }

  // Shutter: flash, then save a PNG of the whole desktop (the element that holds every window).
  async function snap() {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 160);

    const desktop = rootRef.current?.closest("section[aria-label]")?.parentElement;
    if (!desktop || capturing.current) return;
    capturing.current = true;
    try {
      const dataUrl = await toPng(desktop, {
        pixelRatio: window.devicePixelRatio || 1,
        imagePlaceholder: blankPixel,
        // Leave the white shutter flash out of the picture.
        filter: (node) => !(node instanceof HTMLElement && node.dataset.captureIgnore === "true"),
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = screenshotName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Screenshot failed", error);
    } finally {
      capturing.current = false;
    }
  }

  const segment = "flex h-[22px] w-[30px] items-center justify-center rounded-[5px] text-black/70 transition-colors";
  const showInfo = mode === "info";

  return (
    <div ref={rootRef} className="flex h-full select-none flex-col bg-[#e8e6e3]">
      {/* Video area: fills whatever space the (resizable) window gives it, above the toolbar. */}
      <div className="group relative min-h-[160px] w-full flex-1 overflow-hidden bg-black" onMouseLeave={releaseHudFocus}>
        <div className={`h-full w-full transition-[filter] duration-300 ${effectOn ? "grayscale contrast-125" : ""}`}>
          {hasVideo ? (
            <video
              ref={videoRef}
              src={aboutVideo.url}
              poster={aboutVideo.poster}
              crossOrigin="anonymous"
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onClick={togglePlay}
            />
          ) : (
            <img src={aboutPhoto} alt="Harbor in Photo Booth" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          )}
        </div>

        {showInfo && (
          <article className="absolute inset-0 overflow-auto bg-[#1c1c1e]/75 px-10 py-9 text-[13px] leading-[17px] text-white/85 backdrop-blur-2xl">
            <h1 className="text-[22px] font-bold leading-[26px] text-white">Harbor</h1>
            <p className="mt-1 text-white/55">UI/UX &amp; Product Designer · Geoje, South Korea</p>
            <p className="mt-5">
              Product designer with 3+ years across fintech, crypto wallets, digital banking, and e-learning. I work mostly in Figma —
              design systems, prototyping, and multilingual products localized into up to 11 languages.
            </p>
            <p className="mt-3">I came to interfaces from a fine art background, and I&apos;ve lived and worked in Australia and the UK.</p>
            <p className="mt-5 text-white/55">
              links&nbsp;&nbsp;
              <a href="#" className="text-[#5cb8ff] hover:underline">Email</a>,{" "}
              <a href="#" className="text-[#5cb8ff] hover:underline">LinkedIn</a>,{" "}
              <a href="#" className="text-[#5cb8ff] hover:underline">Instagram</a>,{" "}
              <a href="#" className="text-[#5cb8ff] hover:underline">CV</a>
            </p>
          </article>
        )}

        {!showInfo && (
          /* Player HUD: blurred gray panel, two rows. Shown only on hover or keyboard focus. */
          <div
            ref={hudRef}
            className="pointer-events-none absolute bottom-[18px] left-1/2 w-[372px] -translate-x-1/2 rounded-[16px] border border-white/10 bg-[rgba(92,90,88,0.55)] px-[15px] pb-[13px] pt-[12px] text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-[24px] backdrop-saturate-[1.4] transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100"
          >
            <div className="relative flex h-[28px] items-center">
              <button
                type="button"
                aria-label={volume > 0 ? "Mute" : "Unmute"}
                onClick={() => setVolume((v) => (v > 0 ? 0 : 1))}
                className="flex h-6 w-6 shrink-0 items-center text-white/95"
              >
                {volume > 0 ? <Volume2Icon className="h-[17px] w-[17px]" strokeWidth={2} /> : <VolumeXIcon className="h-[17px] w-[17px]" strokeWidth={2} />}
              </button>
              <PillSlider value={volume} max={1} step={0.01} label="Volume" fillClassName="bg-white" className="ml-[2px] w-[76px]" onChange={setVolume} />

              <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-[20px] text-white">
                <button type="button" aria-label="Back 10 seconds" onClick={() => skip(-10)} disabled={!hasVideo} className="disabled:opacity-50">
                  <SkipGlyph direction="back" />
                </button>
                <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={togglePlay} disabled={!hasVideo} className="disabled:opacity-50">
                  {playing ? <PauseGlyph /> : <PlayGlyph />}
                </button>
                <button type="button" aria-label="Forward 10 seconds" onClick={() => skip(10)} disabled={!hasVideo} className="disabled:opacity-50">
                  <SkipGlyph direction="forward" />
                </button>
              </div>

              <ChevronsRightIcon className="ml-auto h-[18px] w-[18px] text-white/85" strokeWidth={1.6} aria-hidden="true" />
            </div>

            <div className="mt-[12px] flex items-center gap-[12px] text-[12px] leading-none tabular-nums text-white/90">
              <span className="w-[36px] shrink-0">{fmt(current)}</span>
              <PillSlider
                value={current}
                max={duration}
                step={0.01}
                label="Seek"
                disabled={!hasVideo}
                fillClassName="bg-white/60"
                className="flex-1"
                onChange={seek}
              />
              <span className="w-[36px] shrink-0 text-right">{hasVideo ? fmt(duration) : "--:--"}</span>
            </div>
          </div>
        )}

        <span
          data-capture-ignore="true"
          className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${flash ? "opacity-90" : "opacity-0"}`}
          aria-hidden="true"
        />
      </div>

      {/* Bottom toolbar from the reference: view segments on the left, red shutter in the middle, Effects on the right. */}
      <div className="relative flex h-[56px] shrink-0 items-center justify-center border-t border-black/[0.08] bg-[#e8e6e3] px-3">
        <div className="absolute left-3 flex items-center gap-[2px] rounded-[7px] bg-black/[0.06] p-[2px]" role="group" aria-label="View">
          <button type="button" aria-label="About Harbor" aria-pressed={mode === "info"} onClick={() => setMode("info")} className={`${segment} ${mode === "info" ? "bg-black/[0.12]" : "hover:bg-black/[0.05]"}`}>
            <LayoutGridIcon className="h-[15px] w-[15px]" strokeWidth={1.6} />
          </button>
          <button type="button" aria-label="Photo" aria-pressed={mode === "photo"} onClick={() => setMode("photo")} className={`${segment} ${mode === "photo" ? "bg-black/[0.12]" : "hover:bg-black/[0.05]"}`}>
            <SquareUserIcon className="h-[15px] w-[15px]" strokeWidth={1.6} />
          </button>
          <button type="button" aria-label="Video" aria-pressed={mode === "video"} onClick={() => setMode("video")} className={`${segment} ${mode === "video" ? "bg-black/[0.12]" : "hover:bg-black/[0.05]"}`}>
            <VideoIcon className="h-[16px] w-[16px]" strokeWidth={1.6} />
          </button>
        </div>

        <button
          type="button"
          aria-label="Take screenshot"
          onClick={() => void snap()}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#e0352b] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-100 active:scale-95"
        >
          <CameraIcon className="h-[21px] w-[21px] text-white" strokeWidth={2.2} />
        </button>

        <button
          type="button"
          aria-pressed={effectOn}
          onClick={() => setEffectOn((on) => !on)}
          className={`absolute right-3 h-[24px] w-[88px] rounded-[6px] text-[13px] text-black/80 transition-colors ${effectOn ? "bg-black/[0.14]" : "bg-black/[0.07] hover:bg-black/[0.1]"}`}
        >
          Effects
        </button>
      </div>
    </div>
  );
}
