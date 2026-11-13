import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/renderer/components/ui/card";
import { cn } from "@/renderer/lib/utils";

/**
 * One titled block of a long form: a violet icon tile, title and one-line description,
 * then the fields. Renders as a card with a hairline between header and body.
 */
export function FormSection({
  icon: Icon,
  title,
  description,
  aside,
  className,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Optional element on the header's right, e.g. a badge. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-[18px] w-[18px]" />
            </span>
          )}
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-base font-semibold">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {aside}
      </div>
      <div className="space-y-5 px-6 py-5">{children}</div>
    </Card>
  );
}
