import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, SearchIcon, SparklesIcon } from "lucide-react";
import { kimLlm } from "../data/kimLlm";

type Answer = { question: string; text: string };

// Spotlight-style "Kim LLM" panel: a blurred glass sheet with a big prompt field and suggested
// questions. Answers are canned (see data/kimLlm.ts) and appear with a short "thinking" delay.
export function KimLLM({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [thinking, setThinking] = useState(false);
  const [shown, setShown] = useState("");

  // Reset each time the panel opens, and focus the field.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setAnswer(null);
    setThinking(false);
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open]);

  // Esc closes (or steps back from an answer to the suggestions).
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (answer) {
        setAnswer(null);
        inputRef.current?.focus();
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, answer, onClose]);

  // Reveal the answer word by word, like a streamed reply.
  useEffect(() => {
    if (!answer || thinking) return;
    const words = answer.text.split(" ");
    let i = 0;
    setShown("");
    const id = window.setInterval(() => {
      i += 1;
      setShown(words.slice(0, i).join(" "));
      if (i >= words.length) window.clearInterval(id);
    }, 35);
    return () => window.clearInterval(id);
  }, [answer, thinking]);

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const match = kimLlm.suggestions.find((s) => s.question.toLowerCase() === q.toLowerCase());
    setQuery(q);
    setAnswer({ question: q, text: match ? match.answer : kimLlm.fallbackAnswer });
    setThinking(true);
    window.setTimeout(() => setThinking(false), 650);
  }

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[300] flex items-start justify-center bg-black/25 px-6 pt-[72px] backdrop-blur-[2px]" onPointerDown={onClose}>
      <style>{`@keyframes kimIn { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: none; } }`}</style>
      <div
        role="dialog"
        aria-label="Kim LLM"
        className="w-full max-w-[680px] animate-[kimIn_180ms_ease-out] overflow-hidden rounded-[22px] border border-white/50 bg-[rgba(238,238,242,0.82)] shadow-[0_30px_80px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-[40px] backdrop-saturate-[1.6]"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <form
          className="flex items-center gap-3 px-6 pb-4 pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            ask(query);
          }}
        >
          {answer ? (
            <button
              type="button"
              aria-label="Back to suggestions"
              onClick={() => {
                setAnswer(null);
                inputRef.current?.focus();
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black/50 hover:bg-black/[0.06]"
            >
              <ArrowLeftIcon className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          ) : (
            <SearchIcon className="h-[22px] w-[22px] shrink-0 text-black/45" strokeWidth={2.2} />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (answer) setAnswer(null);
            }}
            placeholder={kimLlm.placeholder}
            aria-label="Ask Kim LLM"
            className="min-w-0 flex-1 bg-transparent text-[24px] font-light leading-[32px] tracking-[-0.01em] text-black/85 outline-none placeholder:text-black/35"
          />
          <kbd className="shrink-0 rounded-[7px] bg-black/[0.07] px-2.5 py-1 font-sans text-[12px] text-black/45">esc</kbd>
        </form>

        <div className="min-h-[180px] px-3 pb-3">
          {answer ? (
            <div className="px-3 pb-2 pt-1">
              <p className="flex items-center gap-2 text-[12px] font-semibold text-black/45">
                <SparklesIcon className="h-[14px] w-[14px] text-[color:var(--system-purple)]" strokeWidth={2.2} />
                Kim LLM
              </p>
              {thinking ? (
                <div className="mt-3 flex gap-1.5" aria-label="Thinking">
                  {[0, 1, 2].map((dot) => (
                    <span key={dot} className="h-2 w-2 animate-bounce rounded-full bg-black/30" style={{ animationDelay: `${dot * 120}ms` }} />
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[15px] leading-[1.6] text-black/80">{shown}</p>
              )}
            </div>
          ) : (
            <ul aria-label="Suggested questions">
              {kimLlm.suggestions.map((item) => (
                <li key={item.question}>
                  <button
                    type="button"
                    onClick={() => ask(item.question)}
                    className="flex w-full items-center gap-4 rounded-[12px] px-3 py-[11px] text-left text-[15px] text-black/80 transition-colors hover:bg-black/[0.05] focus-visible:bg-black/[0.05] focus-visible:outline-none"
                  >
                    <span className="w-6 text-center text-[19px]" aria-hidden="true">
                      {item.emoji}
                    </span>
                    {item.question}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="border-t border-black/[0.08] px-6 py-3 text-[12px] text-black/40">{kimLlm.footer}</p>
      </div>
    </div>
  );
}
