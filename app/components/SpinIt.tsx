import React, { useState } from "react";
import { ChevronDownIcon, PauseIcon, PlayIcon } from "lucide-react";
import type { DragHandleProps } from "./MacWindow";
import { playlists } from "../data/spinIt";

// Colors sampled from the Dock's turntable icon: caramel leather deck, black vinyl, red label, brushed metal.
const deck = "linear-gradient(160deg, #d4a376 0%, #b48356 45%, #a7764a 100%)";
const labelRed = "#cf0028";

// A small turntable player styled after the Dock icon. Play spins the record and drops the tonearm;
// there are no songs yet, so nothing actually plays.
export function SpinIt({ dragHandleProps, lights }: { dragHandleProps: DragHandleProps; lights: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const [playlistId, setPlaylistId] = useState(playlists[0].id);
  const playlist = playlists.find((p) => p.id === playlistId) ?? playlists[0];
  const hasTracks = playlist.tracks.length > 0;

  return (
    <div
      {...dragHandleProps}
      className="relative flex h-full select-none items-center gap-[46px] overflow-hidden px-5 pb-4 pt-9"
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

      {/* Platter + vinyl */}
      <div className="relative h-[136px] w-[136px] shrink-0">
        <div className="absolute inset-[-6px] rounded-full bg-[#3a2a1f]/30 shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]" />
        <div
          className="absolute inset-0 rounded-full shadow-[0_6px_14px_rgba(60,30,10,0.45)]"
          style={{
            background:
              "radial-gradient(circle, transparent 0 30%, rgba(255,255,255,0.05) 30.5%, transparent 31%), repeating-radial-gradient(circle, #191311 0 1.6px, #241b18 1.6px 3px)",
            animation: "spinIt 1.8s linear infinite",
            animationPlayState: playing ? "running" : "paused",
          }}
        >
          {/* sheen */}
          <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,transparent_0deg,rgba(255,255,255,0.12)_40deg,transparent_90deg,transparent_180deg,rgba(255,255,255,0.08)_220deg,transparent_270deg)]" />
          {/* red label */}
          <span className="absolute left-1/2 top-1/2 flex h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full" style={{ background: labelRed }}>
            <span className="absolute top-[9px] text-[7px] font-bold uppercase tracking-[0.12em] text-white/85">Harbor</span>
            <span className="h-[6px] w-[6px] rounded-full bg-[#e9e6e2] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]" />
          </span>
        </div>

        {/* Tonearm: rests off the record, swings on when playing */}
        <svg
          viewBox="0 0 60 120"
          className="absolute -right-[30px] -top-[10px] h-[120px] w-[60px] origin-[44px_14px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)] transition-transform duration-700 ease-[cubic-bezier(.3,.8,.3,1)]"
          style={{ transform: playing ? "rotate(18deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <circle cx="44" cy="14" r="10" fill="#c9c9cc" stroke="#818084" strokeWidth="1.5" />
          <circle cx="44" cy="14" r="4" fill="#818084" />
          <path d="M44 14 L44 78 L30 100" fill="none" stroke="#dcdcdf" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="22" y="96" width="14" height="10" rx="2" transform="rotate(35 29 101)" fill="#e9e9ec" stroke="#818084" strokeWidth="1" />
        </svg>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col" onPointerDown={(e) => e.stopPropagation()}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5a3a20]/75">{playing ? "Now spinning" : "Spin it"}</p>
        <label className="relative mt-1.5 block">
          <span className="sr-only">Playlist</span>
          <select
            value={playlistId}
            onChange={(e) => {
              setPlaylistId(e.target.value);
              setPlaying(false);
            }}
            className="h-9 w-full cursor-pointer appearance-none rounded-[10px] border border-[#8a5a32]/25 bg-[#f6ead9] pl-3 pr-8 text-[13px] font-semibold text-[#3d2614] shadow-[inset_0_1px_2px_rgba(80,40,10,0.15)] outline-none focus:border-[#8a5a32]/60"
          >
            {playlists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b4426]" strokeWidth={2.2} />
        </label>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => setPlaying((v) => !v)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-[0_3px_8px_rgba(120,0,20,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform active:scale-95"
            style={{ background: `radial-gradient(circle at 35% 30%, #ff3b55, ${labelRed} 70%)` }}
          >
            {playing ? <PauseIcon className="h-5 w-5 fill-white" strokeWidth={0} /> : <PlayIcon className="ml-0.5 h-5 w-5 fill-white" strokeWidth={0} />}
          </button>
          <p className="text-[11px] leading-[14px] text-[#4a2e18]/80">{hasTracks ? `${playlist.tracks.length} songs` : "Songs coming soon"}</p>
        </div>
      </div>

      {/* Speed knob, as on the icon */}
      <span aria-hidden="true" className="absolute bottom-[10px] left-[10px] h-[14px] w-[14px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#f2f2f4,#818084)] shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
    </div>
  );
}
