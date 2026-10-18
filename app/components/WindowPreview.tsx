import React, { type ReactNode, useLayoutEffect, useRef, useState } from "react";

// The thumbnail macOS shows in the Dock for a minimized window: a shrunken copy of the window itself,
// with the app's icon tucked into the bottom-right corner.
// The copy is a static clone of the window's DOM, taken when the window is sent to the Dock.

const box = { w: 64, h: 52 }; // the largest the thumbnail may be (Dock icons are 52px tall)

export function WindowPreview({ windowId, appIcon }: { windowId: string; appIcon: ReactNode }) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const source = document.querySelector<HTMLElement>(`[data-window-id="${CSS.escape(windowId)}"]`);
    if (!host || !source) return;
    const width = source.offsetWidth;
    const height = source.offsetHeight;
    if (!width || !height) return;
    const scale = Math.min(box.w / width, box.h / height);

    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute("data-window-id");
    clone.removeAttribute("aria-label");
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("inert", "");
    clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    clone.querySelectorAll("video").forEach((video) => {
      video.removeAttribute("autoplay");
      video.preload = "metadata";
    });
    Object.assign(clone.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      width: `${width}px`,
      height: `${height}px`,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      zIndex: "auto",
      opacity: "1",
      clipPath: "none",
      pointerEvents: "none",
      transition: "none",
    });
    host.replaceChildren(clone);
    setSize({ w: Math.round(width * scale), h: Math.round(height * scale) });
  }, [windowId]);

  return (
    <span className="relative block" style={size ? { width: size.w, height: size.h } : { width: 44, height: 34 }}>
      <span
        ref={hostRef}
        className="absolute inset-0 overflow-hidden rounded-[3px] bg-white/60 shadow-[0_2px_6px_rgba(0,0,0,0.3),0_0_0_0.5px_rgba(0,0,0,0.25)]"
        aria-hidden="true"
      />
      <span className="absolute -bottom-[3px] -right-[5px] block h-[24px] w-[24px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" aria-hidden="true">
        {appIcon}
      </span>
    </span>
  );
}
