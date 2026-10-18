import React from "react";
import { AccessibilityIcon, ALargeSmallIcon, ContrastIcon, PauseIcon } from "lucide-react";

export type A11ySettings = { reduceMotion: boolean; increaseContrast: boolean; largerText: boolean };

// The three settings hiring teams most often check against WCAG 2.2, each mapped to the related success criterion.
const options: {
  key: keyof A11ySettings;
  title: string;
  description: string;
  wcag: string;
  icon: typeof PauseIcon;
  tile: string;
}[] = [
  {
    key: "reduceMotion",
    title: "Reduce motion",
    description: "Turns off the window genie effect, fades and the spinning record.",
    wcag: "WCAG 2.3.3 Animation from Interactions",
    icon: PauseIcon,
    tile: "bg-gradient-to-b from-[#64d264] to-[#28a745]",
  },
  {
    key: "increaseContrast",
    title: "Increase contrast",
    description: "Darker secondary text, stronger borders and solid window toolbars.",
    wcag: "WCAG 1.4.3 / 1.4.6 Contrast",
    icon: ContrastIcon,
    tile: "bg-[#1d1d1f]",
  },
  {
    key: "largerText",
    title: "Larger text",
    description: "Enlarges reading content — case studies, notes, the CV and Kim LLM — by 20%.",
    wcag: "WCAG 1.4.4 Resize Text",
    icon: ALargeSmallIcon,
    tile: "bg-gradient-to-b from-[#5ac8fa] to-[#0a84ff]",
  },
];

export function AccessibilityPane({ value, onChange }: { value: A11ySettings; onChange: (next: A11ySettings) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-[12px] bg-black/[0.04] p-4">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-b from-[#5ac8fa] to-[#0a84ff] text-white">
          <AccessibilityIcon className="h-[20px] w-[20px]" strokeWidth={2} />
        </span>
        <div>
          <p className="font-semibold text-black/85">Accessibility</p>
          <p className="mt-0.5 leading-[18px] text-black/60">
            Adjust this portfolio to work best for you. Settings are saved in this browser and apply straight away.
          </p>
        </div>
      </div>

      <div>
        <h3 className="px-1 pb-2 text-[13px] font-semibold text-black/85">Display &amp; motion</h3>
        <ul className="divide-y divide-black/[0.08] overflow-hidden rounded-[12px] bg-black/[0.04]">
          {options.map(({ key, title, description, wcag, icon: Icon, tile }) => {
            const on = value[key];
            const id = `a11y-${key}`;
            return (
              <li key={key} className="flex items-center gap-3 px-4 py-3">
                <span className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] text-white ${tile}`}>
                  <Icon className="h-[15px] w-[15px]" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={id} className="block font-medium text-black/85">
                    {title}
                  </label>
                  <p id={`${id}-desc`} className="mt-0.5 text-[12px] leading-4 text-black/55">
                    {description}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-black/45">{wcag}</p>
                </div>
                <button
                  id={id}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-describedby={`${id}-desc`}
                  onClick={() => onChange({ ...value, [key]: !on })}
                  className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--system-blue)] ${
                    on ? "bg-[color:var(--system-blue)]" : "bg-black/20"
                  }`}
                >
                  <span
                    className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-[#ffffff] shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-[left] ${on ? "left-[18px]" : "left-[2px]"}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
