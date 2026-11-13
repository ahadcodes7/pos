import { Switch } from "@/renderer/components/ui/switch";
import { cn } from "@/renderer/lib/utils";

/** A bordered row with a label, a one-line description and a switch; the whole row toggles it. */
export function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border/80 px-4 py-3 transition-colors hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
        className,
      )}
    >
      <span className="space-y-0.5">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </label>
  );
}
