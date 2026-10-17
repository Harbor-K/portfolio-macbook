import React, { useMemo, useState } from "react";
import { CheckIcon, ListIcon, PanelLeftIcon, PlusIcon, SearchIcon } from "lucide-react";
import type { DragHandleProps } from "./MacWindow";
import { meeting } from "../data/meeting";

type Slot = { id: string; start: Date };

const glass =
  "bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_0_0_0.5px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl";

// Upcoming weekday slots, built in Harbor's time zone, grouped by the visitor's local day.
function buildSlots(now: Date) {
  const offsetMs = meeting.hostTimeZoneOffsetHours * 3600_000;
  const hostToday = new Date(now.getTime() + offsetMs); // read with getUTC* = Harbor's wall clock
  const groups: { key: string; label: string; slots: Slot[] }[] = [];
  for (let d = 1; d <= meeting.daysAhead; d += 1) {
    const day = new Date(Date.UTC(hostToday.getUTCFullYear(), hostToday.getUTCMonth(), hostToday.getUTCDate() + d));
    const weekday = day.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    for (const hour of meeting.slotHours) {
      const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour) - offsetMs);
      const key = start.toDateString();
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, label: start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }), slots: [] };
        groups.push(group);
      }
      group.slots.push({ id: start.toISOString(), start });
    }
  }
  return groups;
}

const timeOf = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// A Reminders-style window (light mode) for booking a chat with Harbor.
export function Reminders({ dragHandleProps, lights }: { dragHandleProps: DragHandleProps; lights: React.ReactNode }) {
  const groups = useMemo(() => buildSlots(new Date()), []);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [requested, setRequested] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const canSend = Boolean(selected && name.trim() && /\S+@\S+\.\S+/.test(email));

  function send() {
    if (!selected || !canSend) return;
    const when = selected.start.toLocaleString([], { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
    const subject = `${meeting.title} — ${when}`;
    const body = [
      `Hi Harbor,`,
      ``,
      `I'd like to book a ${meeting.title.toLowerCase()} on ${when} (${timeZone}).`,
      topic.trim() ? `\nWhat I'd like to talk about:\n${topic.trim()}\n` : ``,
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
    ].join("\n");
    window.location.href = `mailto:${meeting.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setRequested(selected);
    setSelected(null);
  }

  return (
    <div className="flex h-full flex-col bg-white text-[13px] text-black/85">
      {/* Toolbar, as in Reminders: lights, sidebar/list buttons, add, search */}
      <div {...dragHandleProps} className="flex h-[52px] shrink-0 select-none items-center gap-3 px-[14px]">
        {lights}
        <div className={`ml-2 flex h-8 items-center rounded-full px-1 ${glass}`} onPointerDown={(e) => e.stopPropagation()}>
          <span className="flex h-7 w-8 items-center justify-center text-black/55">
            <ListIcon className="h-[15px] w-[15px]" />
          </span>
          <span className="flex h-7 w-8 items-center justify-center text-black/55">
            <PanelLeftIcon className="h-[15px] w-[15px]" />
          </span>
        </div>
        <span className={`ml-auto flex h-8 w-8 items-center justify-center rounded-full text-black/60 ${glass}`}>
          <PlusIcon className="h-[16px] w-[16px]" />
        </span>
        <div className={`flex h-8 w-[150px] items-center gap-1.5 rounded-full px-3 ${glass}`} onPointerDown={(e) => e.stopPropagation()}>
          <SearchIcon className="h-[14px] w-[14px] text-black/45" />
          <span className="text-black/35">Search</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-[14px] pb-4">
        <h1 className="mt-1 text-[28px] font-bold leading-[34px] tracking-[-0.01em] text-[color:var(--system-red)]">{meeting.listName}</h1>
        <p className="mt-2 border-b border-black/[0.08] pb-2 text-black/50">{meeting.intro}</p>

        {requested && (
          <section className="border-b border-black/[0.08] py-2">
            <h2 className="text-[17px] font-bold">Requested</h2>
            <div className="flex items-start gap-3 py-2">
              <span className="mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[color:var(--system-red)]">
                <CheckIcon className="h-[11px] w-[11px] text-white" strokeWidth={3.5} />
              </span>
              <div>
                <p className="text-black/45 line-through">{meeting.title}</p>
                <p className="text-[12px] text-black/45">
                  {requested.start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} ·{" "}
                  <span className="text-[color:var(--system-red)]">{timeOf(requested.start)}</span> · Your email app opened with the request
                </p>
              </div>
            </div>
          </section>
        )}

        {groups.map((group) => (
          <section key={group.key} className="border-b border-black/[0.08] py-2">
            <h3 className="text-[11px] font-semibold text-black/45">{group.label}</h3>
            <ul>
              {group.slots.map((slot) => {
                const isSelected = selected?.id === slot.id;
                const isRequested = requested?.id === slot.id;
                return (
                  <li key={slot.id}>
                    <button
                      type="button"
                      disabled={isRequested}
                      onClick={() => setSelected(isSelected ? null : slot)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-start gap-3 rounded-[8px] py-2 pl-1 text-left transition-colors disabled:opacity-40 ${
                        isSelected ? "bg-[rgba(255,56,60,0.07)]" : "hover:bg-black/[0.03]"
                      }`}
                    >
                      <span
                        className={`mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                          isSelected ? "border-[color:var(--system-red)]" : "border-black/25"
                        }`}
                      >
                        {isSelected && <span className="h-[10px] w-[10px] rounded-full bg-[color:var(--system-red)]" />}
                      </span>
                      <span>
                        <span className="block font-medium">{meeting.title}</span>
                        <span className="block text-[12px] text-black/45">
                          {meeting.kind} <span className="text-[color:var(--system-red)]">{timeOf(slot.start)}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <p className="pt-3 text-[11px] text-black/35">Your time zone: {timeZone}</p>
      </div>

      {/* Details sheet: appears once a time is picked */}
      {selected && (
        <form
          className="shrink-0 border-t border-black/[0.08] bg-[#f6f6f8] px-[14px] py-3"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <p className="text-[12px] text-black/55">
            {selected.start.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
            <span className="font-medium text-[color:var(--system-red)]">{timeOf(selected.start)}</span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="h-8 rounded-[7px] border border-black/[0.1] bg-white px-2.5 outline-none focus:border-[color:var(--system-blue)]"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              aria-label="Email"
              className="h-8 rounded-[7px] border border-black/[0.1] bg-white px-2.5 outline-none focus:border-[color:var(--system-blue)]"
            />
          </div>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What would you like to talk about? (optional)"
            aria-label="Topic"
            rows={2}
            className="mt-2 w-full resize-none rounded-[7px] border border-black/[0.1] bg-white px-2.5 py-1.5 outline-none focus:border-[color:var(--system-blue)]"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setSelected(null)} className="h-7 rounded-[6px] px-3 text-black/60 hover:bg-black/[0.05]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSend}
              className="h-7 rounded-[6px] bg-[color:var(--system-blue)] px-3 font-medium text-white disabled:opacity-40"
            >
              Request meeting
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
