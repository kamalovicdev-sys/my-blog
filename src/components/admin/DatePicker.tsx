"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, addMonths, daysBetween, formatMonth, formatWeekdayDate, weekdayIndex } from "@/lib/date";

type Props = { value: string; today: string; onChange: (value: string) => void };

const WEEKDAYS = [
  ["Mo", "Monday"],
  ["Tu", "Tuesday"],
  ["We", "Wednesday"],
  ["Th", "Thursday"],
  ["Fr", "Friday"],
  ["Sa", "Saturday"],
  ["Su", "Sunday"],
];
const QUICK_PICKS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In a week", days: 7 },
];
const KEY_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
const NAV_BUTTON = "flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition";

function relativeLabel(date: string, today: string) {
  const days = daysBetween(today, date);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `In ${days} days` : `${-days} days ago`;
}

// Oy jadvali 1-sana tushgan haftaning dushanbasidan boshlanadi. Har doim 6 hafta: oy almashganda oyna balandligi sakramaydi
function calendarWeeks(date: string) {
  const first = `${date.slice(0, 7)}-01`;
  const start = addDays(first, -weekdayIndex(first));
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
}

function dayClassName(selected: boolean, isToday: boolean, inMonth: boolean) {
  const base =
    "relative flex h-9 w-full items-center justify-center rounded-lg text-sm tabular-nums outline-none transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";
  // Bugungi kun ostida kichik nuqta
  const dot = isToday ? ` after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full ${selected ? "after:bg-background" : "after:bg-accent"}` : "";
  if (selected) return `${base}${dot} bg-accent font-bold text-background`;
  if (isToday) return `${base}${dot} font-bold text-white hover:bg-white/10`;
  return `${base} ${inMonth ? "text-gray-200 hover:bg-white/10" : "text-gray-600 hover:bg-white/5 hover:text-gray-400"}`;
}

// Brauzerning oddiy kalendari o'rniga admin panel uslubidagi sana tanlash oynasi.
// Klaviatura: strelkalar kun/hafta, PageUp/PageDown oy (Shift bilan yil), Home/End hafta boshi/oxiri, Esc yopadi
export default function DatePicker({ value, today, onChange }: Props) {
  const [open, setOpen] = useState(false);
  // Fokusdagi kun: ko'rsatilayotgan oy shundan olinadi
  const [focused, setFocused] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // Oyna ochilganda va klaviatura bilan yurilganda fokus render'dan keyin kerakli kunga o'tkaziladi
  const focusDay = useRef(false);
  const headingId = useId();
  const monthPrefix = focused.slice(0, 7);
  const future = value > today;

  useEffect(() => {
    if (!open || !focusDay.current) return;
    focusDay.current = false;
    popoverRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  });

  // Panel pastida ochilgan oyna ko'rinadigan joyga suriladi, tashqariga bosilsa yopiladi
  useEffect(() => {
    if (!open) return;
    popoverRef.current?.scrollIntoView({ block: "nearest" });
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const show = () => {
    setFocused(value);
    focusDay.current = true;
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const select = (date: string) => {
    onChange(date);
    close();
  };

  const handleGridKeyDown = (event: React.KeyboardEvent) => {
    let next: string | null = null;
    if (event.key in KEY_STEPS) next = addDays(focused, KEY_STEPS[event.key]);
    else if (event.key === "Home") next = addDays(focused, -weekdayIndex(focused));
    else if (event.key === "End") next = addDays(focused, 6 - weekdayIndex(focused));
    else if (event.key === "PageUp" || event.key === "PageDown") next = addMonths(focused, (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1));
    if (!next) return;
    event.preventDefault();
    focusDay.current = true;
    setFocused(next);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        // Esc faqat kalendarni yopadi: preventDefault PostEditor'dagi Esc (sozlamalar panelini yopish) ishlamasligi uchun
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
      onBlur={(event) => {
        // Tab bilan kalendardan chiqib ketilganda yopiladi
        if (open && event.relatedTarget && !rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
        className={`flex w-full items-center gap-2.5 rounded-lg border bg-background px-3 py-2 text-left text-sm outline-none transition focus-visible:border-gray-400 ${open ? "border-gray-400" : "border-gray-700 hover:border-gray-500"}`}
      >
        <CalendarDays className={`size-4 shrink-0 ${future ? "text-accent" : "text-gray-400"}`} />
        <span className="min-w-0 flex-1 truncate">{formatWeekdayDate(value)}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${future ? "bg-accent/15 text-accent" : "bg-white/5 text-gray-400"}`}>{relativeLabel(value, today)}</span>
        <ChevronDown className={`size-4 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-labelledby={headingId}
          className="absolute inset-x-0 top-full z-50 mt-1 origin-top rounded-xl border border-gray-700 bg-surface p-3 shadow-2xl shadow-black/50 transition-[opacity,scale] duration-150 starting:scale-95 starting:opacity-0 motion-reduce:transition-none"
        >
          <div className="mb-1 flex items-center justify-between">
            <button type="button" onClick={() => setFocused(addMonths(focused, -1))} aria-label="Previous month" className={NAV_BUTTON}>
              <ChevronLeft className="size-4" />
            </button>
            <p id={headingId} aria-live="polite" className="text-sm font-bold">
              {formatMonth(focused)}
            </p>
            <button type="button" onClick={() => setFocused(addMonths(focused, 1))} aria-label="Next month" className={NAV_BUTTON}>
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div role="grid" aria-labelledby={headingId} onKeyDown={handleGridKeyDown} className="space-y-0.5">
            <div role="row" className="grid grid-cols-7">
              {WEEKDAYS.map(([short, long]) => (
                <span key={short} role="columnheader" aria-label={long} className="py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {short}
                </span>
              ))}
            </div>
            {calendarWeeks(focused).map((week) => (
              <div key={week[0]} role="row" className="grid grid-cols-7 gap-0.5">
                {week.map((date) => (
                  <div key={date} role="gridcell" aria-selected={date === value}>
                    <button
                      type="button"
                      data-date={date}
                      tabIndex={date === focused ? 0 : -1}
                      aria-label={formatWeekdayDate(date, "long")}
                      aria-current={date === today ? "date" : undefined}
                      onClick={() => select(date)}
                      className={dayClassName(date === value, date === today, date.startsWith(monthPrefix))}
                    >
                      {Number(date.slice(8))}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-2 flex gap-1 border-t border-gray-700/70 pt-2">
            {QUICK_PICKS.map(({ label, days }) => (
              <button
                key={label}
                type="button"
                onClick={() => select(addDays(today, days))}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
