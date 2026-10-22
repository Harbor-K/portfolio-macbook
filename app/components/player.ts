import { useSyncExternalStore } from "react";
import { tracks } from "../data/spinIt";

// One shared music player for the whole desktop, so the Control Center's Now Playing tile and the
// Spin it record player show and control the same song. The <audio> element is created on first use.
export type PlayerState = { index: number; playing: boolean; current: number; duration: number; volume: number };

let state: PlayerState = { index: 0, playing: false, current: 0, duration: 0, volume: 0.8 };
const listeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;

function set(patch: Partial<PlayerState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function element() {
  if (audio || typeof Audio === "undefined") return audio;
  audio = new Audio();
  audio.preload = "metadata";
  audio.volume = state.volume;
  audio.src = tracks[state.index]?.src ?? "";
  audio.addEventListener("timeupdate", () => set({ current: audio!.currentTime }));
  audio.addEventListener("loadedmetadata", () => set({ duration: audio!.duration }));
  audio.addEventListener("play", () => set({ playing: true }));
  audio.addEventListener("pause", () => set({ playing: false }));
  audio.addEventListener("ended", () => (tracks.length > 1 ? player.step(1) : set({ playing: false, current: 0 })));
  return audio;
}

export const player = {
  toggle() {
    const a = element();
    if (!a || !tracks[state.index]?.src) return;
    if (a.paused) void a.play().catch(() => set({ playing: false }));
    else a.pause();
  },
  step(delta: number) {
    const a = element();
    if (!a || tracks.length === 0) return;
    // Like a music app: "previous" restarts the song if it is a few seconds in.
    if (delta < 0 && a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    const index = (state.index + delta + tracks.length) % tracks.length;
    const wasPlaying = !a.paused;
    a.src = tracks[index].src;
    set({ index, current: 0, duration: 0 });
    if (wasPlaying) void a.play().catch(() => set({ playing: false }));
  },
  seek(seconds: number) {
    const a = element();
    if (!a || !state.duration) return;
    a.currentTime = Math.min(state.duration, Math.max(0, seconds));
  },
  setVolume(volume: number) {
    const v = Math.min(1, Math.max(0, volume));
    const a = element();
    if (a) a.volume = v;
    set({ volume: v });
  },
};

export function usePlayer() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state,
  );
}

export const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
