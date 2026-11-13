import { Check, Moon, Palette, Printer, ScanBarcode, Sun } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/renderer/components/common/FormField";
import { FormSection } from "@/renderer/components/common/FormSection";
import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { modes, useTheme, type ThemeMode } from "@/renderer/context/theme-context";
import { cn } from "@/renderer/lib/utils";
import { printers } from "../settings-data";
import { useSettingsForm } from "../settings-store";
import { SectionHeading, SwitchSetting } from "./fields";

/** A tiny drawing of the app in one theme. The `light` / `dark` class scopes that theme's tokens to it. */
function ThemePreview({ mode }: { mode: ThemeMode }) {
  return (
    <div aria-hidden="true" className={cn("overflow-hidden rounded-lg border border-border bg-background", mode)}>
      <div className="flex h-24 bg-background text-foreground">
        <div className="w-1/4 space-y-1.5 border-r border-border bg-sidebar p-2">
          <div className="h-2 w-3/4 rounded-full bg-primary" />
          <div className="h-1.5 w-full rounded-full bg-muted-foreground/30" />
          <div className="h-1.5 w-2/3 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex-1 space-y-2 p-2.5">
          <div className="h-2 w-1/2 rounded-full bg-foreground/70" />
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 rounded-md border border-border bg-card" />
            ))}
          </div>
          <div className="flex justify-end">
            <div className="h-3 w-10 rounded bg-commit" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppearanceSection() {
  const { mode, setMode } = useTheme();

  return (
    <>
      <SectionHeading id="appearance" />
      <FormSection icon={Palette} title="Theme" description="Changes apply right away on this device and don't need saving.">
        <div role="radiogroup" aria-label="Theme" className="grid gap-4 sm:grid-cols-2">
          {modes.map((m) => {
            const selected = mode === m.id;
            const Icon = m.id === "dark" ? Moon : Sun;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMode(m.id)}
                className={cn(
                  "space-y-3 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
                  selected ? "border-primary bg-accent" : "border-border/80 hover:bg-muted/50",
                )}
              >
                <ThemePreview mode={m.id} />
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                  {m.name}
                  {selected && <Check aria-hidden="true" className="ml-auto size-4 text-primary" />}
                </span>
              </button>
            );
          })}
        </div>
      </FormSection>
    </>
  );
}

const STATUS_VARIANT = { Connected: "success", "Not found": "danger", Available: "outline" } as const;

export function HardwareSection() {
  const { draft, update } = useSettingsForm();
  const printer = printers.find((p) => p.id === draft.hardware.printerId) ?? printers[0];

  return (
    <>
      <SectionHeading id="hardware" />
      <FormSection
        icon={Printer}
        title="Receipt printer"
        description="Where receipts print after a sale."
        aside={
          <Badge variant={STATUS_VARIANT[printer.status]} className="gap-1.5">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {printer.status}
          </Badge>
        }
      >
        <div className="flex flex-wrap items-end gap-3">
          <FormField htmlFor="hardware-printerId" label="Printer" className="min-w-64 flex-1">
            <Select value={draft.hardware.printerId} onValueChange={(printerId) => update("hardware", { printerId })}>
              <SelectTrigger id="hardware-printerId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {printers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Printing isn't connected yet", { description: `A test page would go to ${printer.name}.` })}
          >
            Print test page
          </Button>
        </div>
      </FormSection>

      <FormSection icon={ScanBarcode} title="Other devices" description="Scanner and cash drawer behaviour.">
        <div className="space-y-2">
          <SwitchSetting group="hardware" field="scannerEnabled" label="Barcode scanner" description="Scanning a code adds the product to the open invoice." />
          <SwitchSetting group="hardware" field="cashDrawer" label="Open cash drawer on cash sales" description="Sends the drawer-kick signal through the receipt printer." />
        </div>
      </FormSection>
    </>
  );
}
