import React from "react";
import { AccessibilityIcon, CheckIcon, ChevronRightIcon, ContrastIcon } from "lucide-react";
import type { A11ySettings } from "./AccessibilityPane";
import type { SettingsPane, ThemeSetting } from "./Settings";

// Drop-down menu for a menu bar icon, like the menus macOS shows under its status icons:
// a dark translucent rounded panel with a header row (icon in a circle, name, chevron), thin separators,
// small grey section labels and plain rows. A tick marks the current choice.
export type MenuBarMenuKind = "appearance" | "accessibility";

const themeRows: { id: ThemeSetting; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "auto", label: "Auto (match my device)" },
];

const a11yGroups: { title: string; rows: { key: keyof A11ySettings; label: string }[] }[] = [
  {
    title: "Vision",
    rows: [
      { key: "increaseContrast", label: "Increase contrast" },
      { key: "largerText", label: "Larger text" },
    ],
  },
  { title: "Motion", rows: [{ key: "reduceMotion", label: "Reduce motion" }] },
];

export function MenuBarMenu({
  kind,
  theme,
  onThemeChange,
  a11y,
  onA11yChange,
  onOpenSettings,
  onClose,
}: {
  kind: MenuBarMenuKind;
  theme: ThemeSetting;
  onThemeChange: (theme: ThemeSetting) => void;
  a11y: A11ySettings;
  onA11yChange: (next: A11ySettings) => void;
  onOpenSettings: (pane: SettingsPane) => void;
  onClose: () => void;
}) {
  const isAppearance = kind === "appearance";
  const Icon = isAppearance ? ContrastIcon : AccessibilityIcon;
  const title = isAppearance ? "Appearance" : "Accessibility";

  return (
    <div
      role="menu"
      aria-label={title}
      onClick={(event) => event.stopPropagation()}
      className="absolute right-[-6px] top-[calc(100%+6px)] z-[110] w-[264px] rounded-[14px] border border-white/10 bg-[#2b2b2d]/85 p-[5px] text-left text-[14px] font-normal text-white/90 shadow-[0_14px_40px_rgba(0,0,0,0.35),inset_0_0.5px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl [text-shadow:none]"
    >
      {/* Header row: opens the matching pane of System Settings, like the chevron row in macOS menus. */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onOpenSettings(kind);
          onClose();
        }}
        className="flex w-full items-center gap-3 rounded-[9px] px-[9px] py-[7px] text-left hover:bg-white/10"
      >
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-white/15">
          <Icon className="h-[16px] w-[16px]" strokeWidth={2.2} />
        </span>
        <span className="flex-1 text-[15px]">{title}</span>
        <ChevronRightIcon className="h-[16px] w-[16px] text-white/60" strokeWidth={2.2} />
      </button>

      <Separator />

      {isAppearance ? (
        <>
          <SectionLabel>Mode</SectionLabel>
          {themeRows.map((row) => (
            <Row
              key={row.id}
              checked={theme === row.id}
              onClick={() => {
                onThemeChange(row.id);
                onClose();
              }}
            >
              {row.label}
            </Row>
          ))}
        </>
      ) : (
        a11yGroups.map((group, i) => (
          <React.Fragment key={group.title}>
            {i > 0 && <Separator />}
            <SectionLabel>{group.title}</SectionLabel>
            {group.rows.map((row) => (
              <Row
                key={row.key}
                checked={a11y[row.key]}
                onClick={() => {
                  onA11yChange({ ...a11y, [row.key]: !a11y[row.key] });
                  onClose();
                }}
              >
                {row.label}
              </Row>
            ))}
          </React.Fragment>
        ))
      )}
    </div>
  );
}

function Separator() {
  return <div aria-hidden="true" className="mx-[10px] my-[5px] h-px bg-white/15" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-[10px] pb-[2px] pt-[6px] text-[12px] font-semibold text-white/45">{children}</p>;
}

function Row({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-[9px] px-[10px] py-[6px] text-left hover:bg-white/10"
    >
      <span className="flex w-[14px] shrink-0 justify-center">{checked && <CheckIcon className="h-[13px] w-[13px]" strokeWidth={3} />}</span>
      <span className="flex-1">{children}</span>
    </button>
  );
}
