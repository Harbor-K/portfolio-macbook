import React, { useEffect, useRef, useState } from "react";
import type { DragHandleProps } from "./MacWindow";
import { labelImage, tracks } from "../data/spinIt";

// Caramel leather deck sampled from the Dock's turntable icon (kept from the first version).
const deck = "linear-gradient(160deg, #d4a376 0%, #b48356 45%, #a7764a 100%)";
const ink = "#fffaf3"; // warm white text and controls
const textShadow = "0 1px 2px rgba(70,35,10,0.45)";

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// A record player: a vinyl with a photo label and a tonearm on the left; the song title,
// a progress bar and previous / play-pause / next on the right.
export function SpinIt({ dragHandleProps, lights }: { dragHandleProps: DragHandleProps; lights: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const track = tracks[index];
  const hasAudio = Boolean(track?.src);

  // Keep the <audio> element in step with the play button.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (playing) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing, hasAudio, index]);

  function step(delta: number) {
    if (tracks.length === 0) return;
    const audio = audioRef.current;
    // Like a music app: "previous" restarts the song if it is a few seconds in.
    if (delta < 0 && audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => (i + delta + tracks.length) % tracks.length);
    setCurrent(0);
    setDuration(0);
  }

  function seek(event: React.PointerEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    audio.currentTime = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * duration;
  }

  const progress = duration ? Math.min(1, current / duration) : 0;

  return (
    <div
      {...dragHandleProps}
      className="relative flex h-full select-none items-center gap-[22px] overflow-hidden pb-3 pl-[18px] pr-6 pt-7"
      style={{ background: deck, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 6px rgba(80,40,10,0.25)" }}
    >
      <style>{`@keyframes spinIt { to { transform: rotate(360deg); } }`}</style>
      {/* Leather grain */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={{ backgroundImage: "radial-gradient(rgba(90,50,20,0.55) 0.6px, transparent 0.8px)", backgroundSize: "3px 3px" }}
      />
      <div className="absolute left-[14px] top-[11px] z-10">{lights}</div>

      {hasAudio && (
        <audio
          ref={audioRef}
          src={track.src}
          preload="metadata"
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => (tracks.length > 1 ? step(1) : setPlaying(false))}
        />
      )}

      {/* Vinyl with a photo label */}
      <div className="relative h-[146px] w-[146px] shrink-0">
        <div
          className="absolute inset-0 rounded-full shadow-[0_8px_18px_rgba(60,30,10,0.45)]"
          style={{
            background: "repeating-radial-gradient(circle, #0d0d0f 0 1.4px, #18181b 1.4px 2.8px)",
            animation: "spinIt 2.4s linear infinite",
            animationPlayState: playing ? "running" : "paused",
          }}
        >
          {/* sheen */}
          <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_210deg,transparent_0deg,rgba(255,255,255,0.10)_35deg,transparent_80deg,transparent_180deg,rgba(255,255,255,0.07)_225deg,transparent_270deg)]" />
          {/* centre label: the track's artwork */}
          <span className="absolute left-1/2 top-1/2 h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-[0_0_0_2px_rgba(0,0,0,0.35)]">
            <img src={labelImage} alt="" className="h-full w-full object-cover" draggable={false} />
          </span>
        </div>

        {/* Tonearm: dark round pivot with a silver cap, thin arm and cartridge. Swings onto the record while playing. */}
        <svg
          viewBox="0 0 48 128"
          className="absolute -right-[22px] -top-[8px] h-[128px] w-[48px] origin-[30px_16px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)] transition-transform duration-700 ease-[cubic-bezier(.3,.8,.3,1)]"
          style={{ transform: playing ? "rotate(14deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <circle cx="30" cy="16" r="13" fill="#2a2a2e" />
          <circle cx="30" cy="16" r="7" fill="#d9d9dc" stroke="#9a9a9e" strokeWidth="1" />
          <rect x="26" y="0" width="8" height="7" rx="1.5" fill="#e8e8ea" stroke="#9a9a9e" strokeWidth="0.8" />
          <path d="M30 22 L30 84 L16 108" fill="none" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="7" y="104" width="13" height="16" rx="2.5" transform="rotate(32 13.5 112)" fill="#ececee" stroke="#9a9a9e" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Title, progress and controls */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col pl-3" onPointerDown={(e) => e.stopPropagation()} style={{ color: ink }}>
        <p className="line-clamp-2 font-serif text-[24px] font-bold leading-[28px]" style={{ textShadow }} title={track?.title}>
          {track?.title ?? "Spin it"}
        </p>
        <p className="truncate font-serif text-[16px] font-semibold leading-[20px] opacity-85" style={{ textShadow }}>
          {track ? `by ${track.artist}` : "Songs coming soon"}
        </p>

        <div
          role="slider"
          aria-label="Song position"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          aria-valuetext={`${clock(current)} of ${clock(duration)}`}
          tabIndex={hasAudio ? 0 : -1}
          onPointerDown={seek}
          onKeyDown={(e) => {
            const audio = audioRef.current;
            if (!audio || !duration) return;
            if (e.key === "ArrowRight") audio.currentTime = Math.min(duration, audio.currentTime + 5);
            if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
          }}
          className="mt-2.5 h-[14px] cursor-pointer py-[5px]"
        >
          <div className="h-[4px] overflow-hidden rounded-full bg-[rgba(255,250,243,0.35)]">
            <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: ink }} />
          </div>
        </div>
        <div className="mt-0.5 flex justify-between text-[12px] font-medium tabular-nums" style={{ textShadow }}>
          <span>{clock(current)}</span>
          <span>{hasAudio ? clock(duration || track?.seconds || 0) : "–:––"}</span>
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1">
          <ControlButton label="Previous" onClick={() => step(-1)}>
            <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor" aria-hidden="true">
              <rect x="4" y="5" width="3" height="14" rx="1.2" />
              <path d="M19.5 5.8v12.4a1 1 0 0 1-1.5.86L8.6 13.3a1.5 1.5 0 0 1 0-2.6L18 4.94a1 1 0 0 1 1.5.86Z" />
            </svg>
          </ControlButton>
          <ControlButton label={playing ? "Pause" : "Play"} onClick={() => setPlaying((v) => !v)} big>
            {playing ? (
              <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="currentColor" aria-hidden="true">
                <rect x="5" y="3.5" width="4.6" height="17" rx="2" />
                <rect x="14.4" y="3.5" width="4.6" height="17" rx="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="currentColor" aria-hidden="true">
                <path d="M6.5 4.6v14.8a1.2 1.2 0 0 0 1.82 1.03l12.1-7.4a1.2 1.2 0 0 0 0-2.06l-12.1-7.4A1.2 1.2 0 0 0 6.5 4.6Z" />
              </svg>
            )}
          </ControlButton>
          <ControlButton label="Next" onClick={() => step(1)}>
            <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor" aria-hidden="true">
              <rect x="17" y="5" width="3" height="14" rx="1.2" />
              <path d="M4.5 5.8v12.4a1 1 0 0 0 1.5.86l9.4-5.76a1.5 1.5 0 0 0 0-2.6L6 4.94a1 1 0 0 0-1.5.86Z" />
            </svg>
          </ControlButton>
        </div>
      </div>
    </div>
  );
}

function ControlButton({ label, onClick, big, children }: { label: string; onClick: () => void; big?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex items-center justify-center rounded-full transition-transform active:scale-90 ${big ? "h-11 w-11" : "h-9 w-9"}`}
      style={{ filter: "drop-shadow(0 1px 2px rgba(70,35,10,0.45))" }}
    >
      {children}
    </button>
  );
}
