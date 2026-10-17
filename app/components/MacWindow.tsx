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
  const base = "flex h-3 w-3 items-center justify-center rounded-full transition-colors";
  const off = dark ? "bg-[#48484a]" : "bg-[#d1d1d6]";
  const glyph = "h-[8px] w-[8px] opacity-0 transition-opacity group-hover:opacity-100";
  const ZoomGlyph = zoomed ? Minimize2Icon : Maximize2Icon;
  return (
    <div className="group relative z-10 flex items-center gap-2" onPointerDown={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-label={`Close ${title}`}
        onClick={onClose}
        className={`${base} ${isActive ? "bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" : `${off} group-hover:bg-[#ff5f57]`}`}
      >
        <XIcon className={`${glyph} text-[#7a0b06]`} strokeWidth={3.2} />
      </button>
      <button
        type="button"
        aria-label={`Minimize ${title}`}
        onClick={onMinimize}
        className={`${base} ${isActive ? "bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" : `${off} group-hover:bg-[#febc2e]`}`}
      >
        <MinusIcon className={`${glyph} text-[#8a5a00]`} strokeWidth={3.2} />
      </button>
      <button
        type="button"
        aria-label={zoomed ? `Exit full screen` : `Enter full screen`}
        onClick={onZoom}
        className={`${base} ${isActive ? "bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" : `${off} group-hover:bg-[#28c840]`}`}
      >
        <ZoomGlyph className={`${glyph} text-[#0a5c14]`} strokeWidth={3} />
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
  const [dockTransform, setDockTransform] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; windowX: number; windowY: number } | null>(null);
  const resizeOrigin = useRef<{ edge: ResizeEdge; pointerX: number; pointerY: number; x: number; y: number; w: number; h: number } | null>(null);
  const isDark = appearance === "dark";

  // Minimize: shrink the window toward the Dock (bottom centre of the desktop), then hide it.
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!minimized || !el) {
      setDockTransform(null);
      return;
    }
    const parent = el.offsetParent as HTMLElement | null;
    const box = el.getBoundingClientRect();
    const area = parent?.getBoundingClientRect() ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const dx = area.left + area.width / 2 - (box.left + box.width / 2);
    const dy = area.top + area.height - 44 - (box.top + box.height / 2);
    setDockTransform(`translate(${dx}px, ${dy}px) scale(0.06)`);
  }, [minimized]);

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
        dragging ? "" : "transition-[left,top,width,height,transform,opacity,border-radius] duration-[350ms] ease-[cubic-bezier(.2,.8,.2,1)]"
      } ${isDark ? "bg-[#1c1c1e] ring-1 ring-white/10" : "bg-[#e8e6e3] ring-1 ring-black/15"} ${
        isActive ? "shadow-[0_28px_70px_rgba(0,0,0,0.30),0_4px_14px_rgba(0,0,0,0.14)]" : "shadow-[0_14px_36px_rgba(0,0,0,0.18)]"
      } ${zoomed ? "" : widthClassName} ${minimized ? "pointer-events-none" : ""}`}
      style={{
        ...frameStyle,
        transform: minimized && dockTransform ? dockTransform : undefined,
        opacity: minimized ? 0 : 1,
        transformOrigin: "center center",
      }}
      aria-label={title}
      aria-hidden={minimized}
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
