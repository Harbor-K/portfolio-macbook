import React, { useState } from "react";
import { DownloadIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import type { DragHandleProps } from "./MacWindow";
import { cv } from "../data/cv";

const glass =
  "bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl";

// A Preview-style document window: unified toolbar, gray canvas, white A4 page.
export function Preview({ dragHandleProps, lights, zoomed }: { dragHandleProps: DragHandleProps; lights: React.ReactNode; zoomed: boolean }) {
  const [scale, setScale] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const effective = zoomed ? scale * 1.25 : scale;

  // Save the PDF with a proper file name. The file lives on another origin (jsDelivr), where the
  // <a download> attribute is ignored, so fetch it as a blob first; if that fails, open it in a new tab.
  async function downloadPdf() {
    if (!cv.downloadUrl || downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(cv.downloadUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = cv.downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch {
      window.open(cv.downloadUrl, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#f5f5f7]">
      <div {...dragHandleProps} className="flex h-[52px] shrink-0 select-none items-center gap-3 border-b border-black/[0.08] bg-[#f5f5f7] px-[14px]">
        {lights}
        <div className="ml-2 flex flex-col">
          <span className="text-[13px] font-semibold leading-4 text-black/85">{cv.fileName}</span>
          <span className="text-[11px] leading-[14px] text-black/45">Page 1 of 1</span>
        </div>
        <div className="ml-auto flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          <div className={`flex h-8 items-center rounded-full px-1 ${glass}`}>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setScale((s) => Math.max(0.6, +(s - 0.1).toFixed(2)))}
              className="flex h-7 w-8 items-center justify-center rounded-full text-black/70 hover:bg-black/5"
            >
              <ZoomOutIcon className="h-[15px] w-[15px]" />
            </button>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setScale((s) => Math.min(1.8, +(s + 0.1).toFixed(2)))}
              className="flex h-7 w-8 items-center justify-center rounded-full text-black/70 hover:bg-black/5"
            >
              <ZoomInIcon className="h-[15px] w-[15px]" />
            </button>
          </div>
          <button
            type="button"
            aria-label="Download PDF"
            title="Download PDF"
            onClick={downloadPdf}
            disabled={downloading}
            className={`flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-black/70 transition-opacity hover:text-black/90 disabled:opacity-50 ${glass}`}
          >
            <DownloadIcon className="h-[15px] w-[15px]" />
            Download
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[#d9d9de] px-6 py-6">
        {cv.pdfUrl ? (
          <iframe src={`${cv.pdfUrl}#toolbar=0&view=FitH`} title={cv.fileName} className="mx-auto block h-full w-full max-w-[900px] rounded-[2px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]" />
        ) : (
          <div data-readable="" className="mx-auto w-fit" style={{ zoom: effective } as React.CSSProperties}>
            <CvPage />
          </div>
        )}
      </div>
    </div>
  );
}

function CvPage() {
  return (
    <article data-keep-light="" className="min-h-[764px] w-[540px] select-text bg-white px-[46px] py-[50px] text-[11px] leading-[16px] text-[#1d1d1f] shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
      <h1 className="text-[24px] font-bold leading-[28px] tracking-[-0.01em]">{cv.name}</h1>
      <p className="mt-1 text-[12px] text-black/55">{cv.headline}</p>
      <hr className="my-5 border-black/10" />

      <Section title="Profile">
        <p className="text-black/80">{cv.profile}</p>
      </Section>

      <Section title="Experience">
        <ul className="space-y-2">
          {cv.experience.map((item) => (
            <li key={item.org} className="flex items-baseline justify-between gap-4">
              <span className="font-semibold">{item.org}</span>
              <span className="text-black/55">{item.detail}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Selected projects">
        <ul className="space-y-2">
          {cv.projects.map((item) => (
            <li key={item.name} className="flex items-baseline justify-between gap-4">
              <span className="font-semibold">{item.name}</span>
              <span className="text-right text-black/55">{item.detail}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Skills">
        <p className="text-black/80">{cv.skills.join(" · ")}</p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/45">{title}</h2>
      {children}
    </section>
  );
}
