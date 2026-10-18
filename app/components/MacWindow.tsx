import React, { type PointerEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Maximize2Icon, Minimize2Icon, MinusIcon, XIcon } from "lucide-react";

type WindowPosition = { x: number; y: number };
export type WindowSize = { w: number; h: number };
type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type DragHandleProps = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onDoubleClick: () => void;
};

type RenderContext = { dragHandleProps: DragHandleProps; lights: ReactNode; zoomed: boolean };

type MacWindowProps = {
  title: string;
  /** Stable id for this window (used to copy it into its Dock thumbnail when minimized). */
  windowId?: string;
  initialPosition: WindowPosition;
  /** Size the window opens at. Overrides the size in widthClassName. */
  initialSize?: WindowSize;
  widthClassName: string;
  isActive: boolean;
  zIndex: number;
  onFocus: () => void;
  onClose?: () => void;
  /** Yellow button: send the window to the Dock. */
  onMinimize?: () => void;
  minimized?: boolean;
  appearance?: "light" | "dark";
  titleAlign?: "center" | "leading";
  /** Let the user drag the window's edges and corners to resize it, like macOS. */
  resizable?: boolean;
  minSize?: WindowSize;
  /** Pass a function to draw your own unified toolbar (e.g. Finder) instead of the default title bar. */
  children: ReactNode | ((ctx: RenderContext) => ReactNode);
};

export function TrafficLights({
  isActive,
  dark,
  title,
  zoomed,
  onClose,
  onMinimize,
  onZoom,
}: {
  isActive: boolean;
  dark?: boolean;
  title: string;
  zoomed?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onZoom?: () => void;
}) {
  // 14px dots (up from 12px) inside 22px hit areas, so they are easy to click while the dots keep 8px gaps.
  const hit = "flex h-[22px] w-[22px] items-center justify-center rounded-full outline-none";
  const base = "flex h-[14px] w-[14px] items-center justify-center rounded-full transition-colors";
  const off = dark ? "bg-[#48484a]" : "bg-[#d1d1d6]";
  const glyph = "h-[9px] w-[9px] opacity-0 transition-opacity group-hover:opacity-100";
  const ZoomGlyph = zoomed ? Minimize2Icon : Maximize2Icon;
  return (
    <div className="group relative z-10 -mx-[4px] flex items-center" onPointerDown={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}>
      <button type="button" aria-label={`Close ${title}`} onClick={onClose} className={hit}>
        <span className={`${base} ${isActive ? "bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" : `${off} group-hover:bg-[#ff5f57]`}`}>
          <XIcon className={`${glyph} text-[#7a0b06]`} strokeWidth={3.2} />
        </span>
      </button>
      <button type="button" aria-label={`Minimize ${title}`} onClick={onMinimize} className={hit}>
        <span className={`${base} ${isActive ? "bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" : `${off} group-hover:bg-[#febc2e]`}`}>
          <MinusIcon className={`${glyph} text-[#8a5a00]`} strokeWidth={3.2} />
        </span>
      </button>
      <button type="button" aria-label={zoomed ? `Exit full screen` : `Enter full screen`} onClick={onZoom} className={hit}>
        <span className={`${base} ${isActive ? "bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" : `${off} group-hover:bg-[#28c840]`}`}>
          <ZoomGlyph className={`${glyph} text-[#0a5c14]`} strokeWidth={3} />
        </span>
      </button>
    </div>
  );
}

// Invisible hit areas along each edge and corner. Cursors match the macOS resize pointers.
const resizeHandles: { edge: ResizeEdge; className: string }[] = [
  { edge: "n", className: "left-[10px] right-[10px] top-0 h-[5px] cursor-ns-resize" },
  { edge: "s", className: "bottom-0 left-[10px] right-[10px] h-[5px] cursor-ns-resize" },
  { edge: "e", className: "bottom-[10px] right-0 top-[10px] w-[5px] cursor-ew-resize" },
  { edge: "w", className: "bottom-[10px] left-0 top-[10px] w-[5px] cursor-ew-resize" },
  { edge: "nw", className: "left-0 top-0 h-[10px] w-[10px] cursor-nwse-resize" },
  { edge: "se", className: "bottom-0 right-0 h-[10px] w-[10px] cursor-nwse-resize" },
  { edge: "ne", className: "right-0 top-0 h-[10px] w-[10px] cursor-nesw-resize" },
  { edge: "sw", className: "bottom-0 left-0 h-[10px] w-[10px] cursor-nesw-resize" },
];

export function MacWindow({
  title,
  windowId,
  initialPosition,
  initialSize,
  widthClassName,
  isActive,
  zIndex,
  onFocus,
  onClose,
  onMinimize,
  minimized = false,
  appearance = "light",
  titleAlign = "center",
  resizable = false,
  minSize = { w: 420, h: 300 },
  children,
}: MacWindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState<WindowSize | null>(initialSize ?? null);
  const [zoomed, setZoomed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; windowX: number; windowY: number } | null>(null);
  const resizeOrigin = useRef<{ edge: ResizeEdge; pointerX: number; pointerY: number; x: number; y: number; w: number; h: number } | null>(null);
  const isDark = appearance === "dark";

  // Minimize / restore with a macOS-style Genie effect: the window funnels down into its slot
  // in the Dock (and pours back out on restore). Uses the Web Animations API so it can follow
  // the real Dock position, and falls back to a short fade when the visitor prefers reduced motion.
  const wasMinimized = useRef(minimized);
  const genieRef = useRef<Animation | null>(null);
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el || wasMinimized.current === minimized) return;
    wasMinimized.current = minimized;
    genieRef.current?.cancel();

    const box = el.getBoundingClientRect();
    const dock = document.querySelector('nav[aria-label="Dock"]');
    const slot = minimized ? document.querySelector(`nav[aria-label="Dock"] button[aria-label="Restore ${title}"]`) : null;
    const slotBox = slot?.getBoundingClientRect();
    const dockBox = dock?.getBoundingClientRect();
    // Where the window lands: its own Dock thumbnail when minimizing; the Dock's right end when
    // restoring (the thumbnail has already been removed by then, and that is where it was).
    const targetX = slotBox ? slotBox.left + slotBox.width / 2 : dockBox ? dockBox.right - 4 : window.innerWidth / 2;
    const targetY = slotBox ? slotBox.top + slotBox.height / 2 : dockBox ? dockBox.top + dockBox.height / 2 : window.innerHeight - 40;
    const dx = targetX - (box.left + box.width / 2);
    const dy = targetY - (box.top + box.height / 2);
    // Horizontal point (as % of the window width) the bottom edge funnels toward.
    const f = Math.min(100, Math.max(0, ((targetX - box.left) / box.width) * 100));
    const pct = (n: number) => `${n.toFixed(1)}%`;
    const full = "polygon(-10% -10%, 110% -10%, 110% 110%, -10% 110%)";
    const funnel = (top: number, bottom: number) =>
      `polygon(${pct(-10 + (f + 10) * top)} -10%, ${pct(110 - (110 - f) * top)} -10%, ${pct(f + bottom)} 110%, ${pct(f - bottom)} 110%)`;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || Boolean(el.closest(".a11y-reduce-motion"));
    const frames: Keyframe[] = reduceMotion
      ? [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "scale(0.96)" },
        ]
      : [
          { offset: 0, transform: "translate(0px, 0px) scale(1, 1)", clipPath: full, opacity: 1 },
          // The bottom edge pinches toward the Dock first, while the top barely moves.
          { offset: 0.35, transform: `translate(${dx * 0.08}px, ${dy * 0.12}px) scale(1, 0.96)`, clipPath: funnel(0.05, 14), opacity: 1 },
          // Then the whole window is drawn down the funnel.
          { offset: 0.7, transform: `translate(${dx * 0.6}px, ${dy * 0.7}px) scale(0.45, 0.4)`, clipPath: funnel(0.55, 6), opacity: 1 },
          { offset: 1, transform: `translate(${dx}px, ${dy}px) scale(0.06, 0.06)`, clipPath: funnel(0.9, 2), opacity: 0 },
        ];

    const animation = el.animate(frames, {
      duration: reduceMotion ? 180 : 560,
      easing: minimized ? "cubic-bezier(0.55, 0, 0.7, 0.25)" : "cubic-bezier(0.3, 0.75, 0.45, 1)",
      direction: minimized ? "normal" : "reverse",
      fill: "forwards",
    });
    genieRef.current = animation;
    // After restoring, drop the finished animation so the window's normal styles take over again.
    if (!minimized) animation.onfinish = () => animation.cancel();
  }, [minimized, title]);

  // Esc leaves full screen, like macOS.
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  function toggleZoom() {
    onFocus();
    setZoomed((value) => !value);
  }

  function minimize() {
    setZoomed(false);
    onMinimize?.();
  }

  const dragHandleProps: DragHandleProps = {
    onPointerDown(event) {
      onFocus();
      if (zoomed) return;
      dragOrigin.current = { pointerX: event.clientX, pointerY: event.clientY, windowX: position.x, windowY: position.y };
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event) {
      if (!dragOrigin.current) return;
      const nextX = Math.max(8, dragOrigin.current.windowX + event.clientX - dragOrigin.current.pointerX);
      const nextY = Math.max(28, dragOrigin.current.windowY + event.clientY - dragOrigin.current.pointerY);
      setPosition({ x: nextX, y: nextY });
    },
    onPointerUp() {
      dragOrigin.current = null;
      setDragging(false);
    },
    // Double-clicking the title bar zooms, as on macOS.
    onDoubleClick: toggleZoom,
  };

  function startResize(edge: ResizeEdge, event: PointerEvent<HTMLElement>) {
    event.stopPropagation();
    onFocus();
    const el = sectionRef.current;
    if (zoomed || !el) return;
    const rect = el.getBoundingClientRect();
    resizeOrigin.current = { edge, pointerX: event.clientX, pointerY: event.clientY, x: position.x, y: position.y, w: rect.width, h: rect.height };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveResize(event: PointerEvent<HTMLElement>) {
    const o = resizeOrigin.current;
    if (!o) return;
    const dx = event.clientX - o.pointerX;
    const dy = event.clientY - o.pointerY;
    let { x, y, w, h } = o;
    if (o.edge.includes("e")) w = Math.max(minSize.w, o.w + dx);
    if (o.edge.includes("w")) {
      w = Math.max(minSize.w, o.w - dx);
      x = o.x + (o.w - w);
      if (x < 8) {
        w -= 8 - x;
        x = 8;
      }
    }
    if (o.edge.includes("s")) h = Math.max(minSize.h, o.h + dy);
    if (o.edge.includes("n")) {
      h = Math.max(minSize.h, o.h - dy);
      y = o.y + (o.h - h);
      // Keep the title bar below the menu bar.
      if (y < 28) {
        h -= 28 - y;
        y = 28;
      }
    }
    setSize({ w, h });
    setPosition({ x, y });
  }

  function endResize() {
    resizeOrigin.current = null;
    setDragging(false);
  }

  const lights = (
    <TrafficLights isActive={isActive} dark={isDark} title={title} zoomed={zoomed} onClose={onClose} onMinimize={minimize} onZoom={toggleZoom} />
  );

  const frameStyle: React.CSSProperties = zoomed
    ? { left: 0, top: 0, width: "100%", height: "100%", zIndex: 400 }
    : { left: position.x, top: position.y, zIndex, ...(size ? { width: size.w, height: size.h } : {}) };

  return (
    <section
      ref={sectionRef}
      className={`absolute flex flex-col overflow-hidden ${zoomed ? "rounded-none" : "rounded-[12px]"} ${
        dragging ? "" : "transition-[left,top,width,height,border-radius] duration-[350ms] ease-[cubic-bezier(.2,.8,.2,1)]"
      } ${isDark ? "bg-[#1c1c1e] ring-1 ring-white/10" : "bg-[#e8e6e3] ring-1 ring-black/15"} ${
        isActive ? "shadow-[0_28px_70px_rgba(0,0,0,0.30),0_4px_14px_rgba(0,0,0,0.14)]" : "shadow-[0_14px_36px_rgba(0,0,0,0.18)]"
      } ${zoomed ? "" : widthClassName} ${minimized ? "pointer-events-none" : ""}`}
      style={{ ...frameStyle, transformOrigin: "center center" }}
      aria-label={title}
      aria-hidden={minimized}
      data-themed=""
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      {typeof children === "function" ? (
        children({ dragHandleProps, lights, zoomed })
      ) : (
        <>
          <div
            {...dragHandleProps}
            className={`relative flex h-[28px] shrink-0 select-none items-center px-[10px] ${
              isDark ? "border-b border-black/50 bg-[#2c2c2e]" : "border-b border-black/[0.08] bg-[#e8e6e3]"
            }`}
          >
            {lights}
            <h2
              className={`pointer-events-none text-[13px] font-semibold ${
                titleAlign === "leading" ? "ml-4" : "absolute inset-x-0 text-center"
              } ${isDark ? (isActive ? "text-white/85" : "text-white/45") : isActive ? "text-black/80" : "text-black/40"}`}
            >
              {title}
            </h2>
          </div>
          <div className="min-h-0 flex-1">{children}</div>
        </>
      )}

      {resizable &&
        !zoomed &&
        !minimized &&
        resizeHandles.map(({ edge, className }) => (
          <div
            key={edge}
            aria-hidden="true"
            className={`absolute z-30 touch-none ${className}`}
            onPointerDown={(event) => startResize(edge, event)}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          />
        ))}
    </section>
  );
}
