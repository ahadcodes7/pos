import { flushSync } from "react-dom";
import { useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { cn } from "@/renderer/lib/utils";

/**
 * A text input for a number that keeps the raw text while typing and only commits a parsed value
 * on blur or Enter. Invalid text snaps back to the last committed value, so the stored number is
 * never a half-typed string.
 */
export function NumberInput({
  value,
  format,
  parse,
  onCommit,
  className,
  onKeyDown,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number;
  /** How the stored value is shown while not editing. */
  format: (value: number) => string;
  /** Returns the parsed value, or null when the text is not acceptable. */
  parse: (text: string) => number | null;
  onCommit: (value: number) => void;
}) {
  // While focused, `draft` holds what the user typed; otherwise the formatted value is shown.
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const parsed = parse(draft);
    if (parsed !== null && parsed !== value) onCommit(parsed);
    setDraft(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Commit synchronously so a form submitted by this same Enter sees the new value.
    if (e.key === "Enter") flushSync(commit);
    if (e.key === "Escape") setDraft(null);
    onKeyDown?.(e);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={draft ?? format(value)}
      onFocus={(e) => {
        setDraft(format(value));
        e.currentTarget.select();
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      className={cn("tabular-nums", className)}
      {...props}
    />
  );
}
