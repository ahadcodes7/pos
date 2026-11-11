import { cn } from "@/renderer/lib/utils";

/**
 * The Ledger N: two cream ledger strokes and a coral diagonal on a charcoal tile.
 * The tile is a fixed brand asset, not a theme token, so the mark is identical in
 * light and dark mode and matches the app icon.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-[#181a1f] shadow-sm",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[62%] w-[62%]">
        <path d="M7 18V6" stroke="#F7F3EA" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M7 6L17 18" stroke="#FF7A66" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M17 18V6" stroke="#F7F3EA" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-[-0.03em]", className)}>
      NayaHisab
      <span aria-hidden="true" className="text-brand">
        .
      </span>
    </span>
  );
}

export function BrandLockup({
  className,
  subtitle = "Point of Sale",
  markClassName,
  wordmarkClassName,
  subtitleClassName,
}: {
  className?: string;
  subtitle?: string | null;
  markClassName?: string;
  wordmarkClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark className={cn("h-9 w-9", markClassName)} />
      <div className="min-w-0">
        <div className={cn("text-[15px] leading-tight", wordmarkClassName)}>
          <BrandWordmark />
        </div>
        {subtitle && (
          <div
            className={cn(
              "mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.16em] opacity-70",
              subtitleClassName,
            )}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
