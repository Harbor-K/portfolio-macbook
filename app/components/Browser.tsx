import React from "react";
import { ChevronLeftIcon, ChevronRightIcon, LockIcon, PlusIcon, RotateCwIcon, ShareIcon } from "lucide-react";
import type { DragHandleProps } from "./MacWindow";
import type { CaseStudy } from "../data/caseStudies";

const glass =
  "bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl";

// A Safari-style window showing a mock case-study page (not a real website).
export function Browser({
  dragHandleProps,
  lights,
  article,
  onBack,
  onForward,
}: {
  dragHandleProps: DragHandleProps;
  lights: React.ReactNode;
  article: CaseStudy;
  /** Go to the previous / next project's page; leave undefined to disable the arrow. */
  onBack?: () => void;
  onForward?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Unified toolbar: traffic lights, back/forward, address field, actions */}
      <div {...dragHandleProps} className="flex h-[52px] shrink-0 select-none items-center gap-3 border-b border-black/[0.08] bg-[#f5f5f7] px-[14px]">
        {lights}
        <div className={`ml-2 flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label="Previous project"
            title="Previous project"
            onClick={onBack}
            disabled={!onBack}
            className="flex h-7 w-7 items-center justify-center rounded-full text-black/70 hover:bg-black/5 disabled:text-black/25 disabled:hover:bg-transparent"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next project"
            title="Next project"
            onClick={onForward}
            disabled={!onForward}
            className="flex h-7 w-7 items-center justify-center rounded-full text-black/70 hover:bg-black/5 disabled:text-black/25 disabled:hover:bg-transparent"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        <div
          className={`mx-auto flex h-8 min-w-0 max-w-[420px] flex-1 items-center justify-center gap-1.5 rounded-full px-3 ${glass}`}
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <LockIcon className="h-[11px] w-[11px] shrink-0 text-black/45" strokeWidth={2.4} />
          <span className="truncate text-[13px] text-black/75">{article.url}</span>
          <RotateCwIcon className="ml-auto h-[12px] w-[12px] shrink-0 text-black/40" strokeWidth={2.2} />
        </div>
        <div className={`flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          <span className="flex h-7 w-8 items-center justify-center text-black/55">
            <ShareIcon className="h-[15px] w-[15px]" />
          </span>
          <span className="flex h-7 w-8 items-center justify-center text-black/55">
            <PlusIcon className="h-[16px] w-[16px]" />
          </span>
        </div>
      </div>

      {/* Page */}
      <div key={article.url} data-keep-light="" data-readable="" className="min-h-0 flex-1 select-text overflow-auto bg-white text-[#1d1d1f]">
        <header className="px-10 pb-12 pt-10 text-white" style={{ background: article.brandColor }}>
          <img src={article.logo} alt="" className={article.logoClassName ?? "h-[44px] w-auto rounded-[4px]"} draggable={false} />
          <p className="mt-10 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/80">{article.eyebrow}</p>
          <h1 className="mt-3 max-w-[640px] text-[34px] font-bold leading-[1.12] tracking-[-0.02em]">{article.title}</h1>
          <p className="mt-4 max-w-[600px] text-[16px] leading-[1.5] text-white/90">{article.summary}</p>
        </header>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-b border-black/[0.08] px-10 py-6 md:grid-cols-4">
          {article.meta.map((item) => (
            <div key={item.label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/45">{item.label}</dt>
              <dd className="mt-1 text-[13px] leading-[1.4] text-black/80">{item.value}</dd>
            </div>
          ))}
        </dl>

        <article className="max-w-[680px] px-10 pb-16 pt-8">
          {article.sections.map((section) => (
            <section key={section.heading} className="mb-9">
              <h2 className="text-[20px] font-semibold tracking-[-0.01em]">{section.heading}</h2>
              {section.body && <p className="mt-2 text-[15px] leading-[1.6] text-black/75">{section.body}</p>}
              {section.list && (
                <ul className="mt-3 space-y-2">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-[1.55] text-black/75">
                      <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: article.brandColor }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
