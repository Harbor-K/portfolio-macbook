import React, { useRef, useState } from "react";
import { CalendarClockIcon, FileTextIcon, PauseIcon, PlayIcon, UserRoundIcon, VideoIcon } from "lucide-react";
import { aboutPortrait, aboutVideo } from "../data/aboutVideo";
import { cv } from "../data/cv";
import { meeting } from "../data/meeting";

type Mode = "video" | "about";

// Harbor's introduction, styled like a calm video-call window rather than a playful Photo Booth:
// a clean video tile with a name tag, an About card, and clear next steps (view the CV, book a call).
export function IntroCall({
  initialShowInfo = false,
  onBookCall,
  onOpenCv,
}: {
  initialShowInfo?: boolean;
  onBookCall: () => void;
  onOpenCv: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>(initialShowInfo ? "about" : "video");
  const [playing, setPlaying] = useState(false);
  const hasVideo = aboutVideo.url.length > 0;

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }

  const tab = (id: Mode, label: string, Icon: typeof VideoIcon) => (
    <button
      type="button"
      aria-pressed={mode === id}
      onClick={() => setMode(id)}
      className={`flex h-[26px] items-center gap-1.5 rounded-[7px] px-2.5 text-[12px] font-medium transition-colors ${
        mode === id ? "bg-white text-black/85 shadow-[0_1px_2px_rgba(0,0,0,0.12)]" : "text-black/55 hover:text-black/80"
      }`}
    >
      <Icon className="h-[13px] w-[13px]" strokeWidth={2} />
      {label}
    </button>
  );

  return (
    <div className="flex h-full select-none flex-col bg-white">
      <div className="relative min-h-[160px] flex-1 p-[10px] pb-0">
        {mode === "video" ? (
          <div className="group relative h-full w-full overflow-hidden rounded-[12px] bg-[#111]">
            {hasVideo ? (
              <video
                ref={videoRef}
                src={aboutVideo.url}
                poster={aboutVideo.poster}
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onClick={togglePlay}
              />
            ) : (
              <img src={aboutPortrait} alt="Harbor" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
            )}
            {/* Name tag, as in a video call. Top-left, so it never sits on the subtitles burned into the bottom of the video. */}
            <span className="pointer-events-none absolute left-3 top-3 rounded-[8px] bg-black/50 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
              Harbor · Product Designer
            </span>
            {hasVideo && (
              <button
                type="button"
                aria-label={playing ? "Pause intro video" : "Play intro video"}
                onClick={togglePlay}
                className={`absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black/80 shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-opacity ${
                  playing ? "opacity-0 group-hover:opacity-100 focus-visible:opacity-100" : "opacity-100"
                }`}
              >
                {playing ? <PauseIcon className="h-6 w-6 fill-current" strokeWidth={0} /> : <PlayIcon className="ml-0.5 h-6 w-6 fill-current" strokeWidth={0} />}
              </button>
            )}
          </div>
        ) : (
          <article data-readable="" className="h-full overflow-auto rounded-[12px] bg-[#f6f6f8] px-6 py-5 text-[13px] leading-[19px] text-black/75">
            <div className="flex items-center gap-3">
              <img src={aboutPortrait} alt="" className="h-12 w-12 rounded-full object-cover object-[50%_30%]" draggable={false} />
              <div>
                <h1 className="text-[16px] font-semibold leading-[20px] text-black/90">{cv.name}</h1>
                <p className="text-[12px] text-black/50">{cv.headline}</p>
              </div>
            </div>
            <p className="mt-4">
              Product designer with 3+ years across fintech, crypto wallets, digital banking, and e-learning. I work mostly in Figma —
              design systems, prototyping, and multilingual products localized into up to 11 languages.
            </p>
            <p className="mt-2.5">I came to interfaces from a fine art background, and I&apos;ve lived and worked in Australia and the UK.</p>
            <p className="mt-4 text-[12px] text-black/50">
              links&nbsp;&nbsp;
              <a href={`mailto:${meeting.email}`} className="rounded-[3px] bg-[#F8FC68] px-1 text-black/85 hover:underline">
                Email
              </a>{" "}
              <button type="button" onClick={onOpenCv} className="rounded-[3px] bg-[#F8FC68] px-1 text-black/85 hover:underline">
                CV
              </button>
            </p>
          </article>
        )}
      </div>

      {/* Bottom bar: switch view on the left, next steps on the right */}
      <div className="flex h-[56px] shrink-0 items-center gap-2 px-[10px]">
        <div className="flex items-center gap-[2px] rounded-[9px] bg-black/[0.06] p-[2px]" role="group" aria-label="View">
          {tab("video", "Intro", VideoIcon)}
          {tab("about", "About", UserRoundIcon)}
        </div>
        <button
          type="button"
          onClick={onOpenCv}
          className="ml-auto flex h-[30px] items-center gap-1.5 rounded-[8px] bg-black/[0.06] px-3 text-[12px] font-medium text-black/80 hover:bg-black/[0.1]"
        >
          <FileTextIcon className="h-[13px] w-[13px]" strokeWidth={2} />
          CV
        </button>
        <button
          type="button"
          onClick={onBookCall}
          className="flex h-[30px] items-center gap-1.5 rounded-[8px] bg-[color:var(--system-blue)] px-3 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.15)] hover:brightness-105"
        >
          <CalendarClockIcon className="h-[13px] w-[13px]" strokeWidth={2.2} />
          Book a call
        </button>
      </div>
    </div>
  );
}
