import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Info, Lightbulb, OctagonAlert } from "lucide-react";
import { cn } from "@/renderer/lib/utils";

export type CalloutTone = "info" | "success" | "warning" | "danger" | "tip";

/**
 * Tone styles. Every callout is a transparent wash of its colour with a tinted border, so it
 * sits on cards and the canvas alike in both themes. The colour sits on the border, wash and
 * icon only; title and body stay in text tokens so contrast never depends on the tone.
 */
const TONES: Record<CalloutTone, { box: string; icon: string; Icon: LucideIcon }> = {
  info: { box: "border-info/25 bg-info/[0.07]", icon: "bg-info/12 text-info", Icon: Info },
  success: { box: "border-success/25 bg-success/[0.07]", icon: "bg-success/12 text-success", Icon: CheckCircle2 },
  warning: { box: "border-warning/30 bg-warning/[0.08]", icon: "bg-warning/14 text-warning", Icon: AlertTriangle },
  danger: { box: "border-destructive/25 bg-destructive/[0.07]", icon: "bg-destructive/12 text-destructive", Icon: OctagonAlert },
  tip: { box: "border-primary/20 bg-primary/[0.06]", icon: "bg-primary/12 text-primary", Icon: Lightbulb },
};

/**
 * Info, success, warning, danger or tip message. Pass `role="alert"` for errors that appear in
 * response to an action, and `role="status"` for live non-urgent updates. Static notes need no role.
 */
export function Callout({
  tone = "info",
  title,
  icon,
  action,
  compact = false,
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "title"> & {
  tone?: CalloutTone;
  title?: ReactNode;
  /** Override the tone's default icon, or pass `null` to hide it. */
  icon?: LucideIcon | null;
  /** Optional trailing control, e.g. a small button. */
  action?: ReactNode;
  /** Tighter padding for inline hints inside a form. */
  compact?: boolean;
}) {
  const style = TONES[tone];
  const Icon = icon === undefined ? style.Icon : icon;

  return (
    <div
      data-slot="callout"
      data-tone={tone}
      className={cn(
        "flex items-start gap-3 rounded-xl border text-sm text-foreground",
        compact ? "px-3 py-2.5" : "p-4",
        style.box,
        className,
      )}
      {...props}
    >
      {Icon && (
        <span
          aria-hidden="true"
          className={cn("flex shrink-0 items-center justify-center rounded-lg", compact ? "h-6 w-6" : "h-8 w-8", style.icon)}
        >
          <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </span>
      )}
      <div className={cn("min-w-0 flex-1", !compact && Icon && "pt-1")}>
        {title && <p className="leading-snug font-semibold">{title}</p>}
        {children && <div className={cn("leading-relaxed text-muted-foreground", title && "mt-1")}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
