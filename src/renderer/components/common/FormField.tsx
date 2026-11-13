import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "@/renderer/components/ui/label";
import { cn } from "@/renderer/lib/utils";

/**
 * Label + control + hint/error, laid out the same everywhere. The control keeps its own `id`
 * (pass the same value as `htmlFor`). The error renders as `${htmlFor}-error` and the hint as
 * `${htmlFor}-hint`; point the control's `aria-describedby` at them so they are announced.
 */
export function FormField({
  htmlFor,
  label,
  required = false,
  optional = false,
  hint,
  error,
  className,
  children,
}: {
  htmlFor?: string;
  label: string;
  required?: boolean;
  /** Shows a muted "Optional" marker for fields that are easy to skip. */
  optional?: boolean;
  hint?: ReactNode;
  error?: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Fixed row height so a field with the "Optional" marker lines up with its neighbours. */}
      <div className="flex h-3.5 items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-destructive">
              *
            </span>
          )}
        </Label>
        {optional && <span className="text-xs leading-none text-muted-foreground">Optional</span>}
      </div>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
