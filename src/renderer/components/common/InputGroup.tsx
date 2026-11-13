import type { ReactNode } from "react";
import { cn } from "@/renderer/lib/utils";

/**
 * Wraps one Input/Select trigger with a leading icon or prefix ("Rs") and/or a trailing unit
 * ("kg"), and pads the control so text never runs under them.
 */
export function InputGroup({
  leading,
  trailing,
  className,
  children,
}: {
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative",
        leading && "[&>input]:pl-10",
        trailing && "[&>input]:pr-12",
        className,
      )}
    >
      {leading && (
        <span className="pointer-events-none absolute top-1/2 left-3.5 flex -translate-y-1/2 items-center text-sm text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
          {leading}
        </span>
      )}
      {children}
      {trailing && (
        <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-medium text-muted-foreground">
          {trailing}
        </span>
      )}
    </div>
  );
}
