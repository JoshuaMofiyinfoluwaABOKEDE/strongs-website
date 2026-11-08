/**
 * Days, hours, minutes and seconds until a start time. Updated every second by CarouselScript.
 * Shows a "happening now" line between start and end, and a thank-you line afterwards.
 */
export function Countdown({
  to,
  end,
  label = "The crusade begins in",
  live = "The crusade is on now. Come today!",
  over = "The crusade has ended. Thank you for praying and coming.",
  className = "",
}: {
  to: string;
  end?: string;
  label?: string;
  live?: string;
  over?: string;
  className?: string;
}) {
  const units = [
    ["days", "Days"],
    ["hours", "Hours"],
    ["minutes", "Minutes"],
    ["seconds", "Seconds"],
  ];
  return (
    <div data-countdown={to} data-countdown-end={end} className={className} role="timer" aria-live="off">
      <div data-when="soon">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">{label}</p>
        <div className="flex gap-2.5 sm:gap-3.5">
          {units.map(([k, l]) => (
            <div key={k} className="flex min-w-[4.25rem] flex-col items-center rounded-2xl border border-navy-line bg-navy-2 px-3 py-3 sm:min-w-[5.25rem]">
              <span data-cd={k} className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-none tabular-nums text-white">
                --
              </span>
              <span className="mt-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-pale">{l}</span>
            </div>
          ))}
        </div>
      </div>
      <p data-when="live" className="rounded-2xl bg-gold px-5 py-4 text-lg font-bold text-navy">{live}</p>
      <p data-when="over" className="rounded-2xl border border-navy-line px-5 py-4 text-lg font-semibold text-white">{over}</p>
    </div>
  );
}
