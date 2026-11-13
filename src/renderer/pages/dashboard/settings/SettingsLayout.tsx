import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/renderer/components/ui/button";
import { Callout } from "@/renderer/components/ui/callout";
import { PageHeader } from "@/renderer/components/dashboard/PageHeader";
import { SETTINGS_PATH, settingsSections } from "@/renderer/components/dashboard/nav";
import { cn } from "@/renderer/lib/utils";
import type { AppSettings, SettingsGroup } from "./settings-data";
import { useSettingsStore, type SettingsForm } from "./settings-store";
import { groupsWithErrors, validateSettings } from "./validate";

const GROUPS = ["Business", "App", "Admin"] as const;

/** Section ids whose fields live in a settings group (sections without fields have none). */
const SECTION_GROUP: Partial<Record<string, SettingsGroup>> = {
  business: "business",
  invoices: "invoices",
  tax: "tax",
  inventory: "inventory",
  hardware: "hardware",
};

/** Settings shell: section menu, the section (via Outlet), and the unsaved-changes bar. */
export default function SettingsLayout() {
  const { saved, save } = useSettingsStore();
  const [draft, setDraft] = useState<AppSettings>(saved);
  const { pathname } = useLocation();

  const errors = useMemo(() => validateSettings(draft), [draft]);
  const errorGroups = groupsWithErrors(errors);
  const hasErrors = errorGroups.size > 0;
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const form: SettingsForm = {
    draft,
    errors,
    update: (group, patch) => setDraft((d) => ({ ...d, [group]: { ...d[group], ...patch } })),
  };

  const onSave = () => {
    save(draft);
    toast.success("Settings saved", { description: "They're kept until you close the app." });
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <PageHeader title="Settings" description="Business, invoicing and app preferences." className="mb-4" />
      <Callout tone="info" compact className="mb-6">
        Preview: settings are kept until you close the app. Saving them to your database comes later.
      </Callout>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <nav aria-label="Settings sections" className="shrink-0 lg:sticky lg:top-6 lg:w-60 lg:self-start">
          <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-5 lg:overflow-visible lg:pb-0">
            {GROUPS.map((group) => (
              <div key={group} className="flex gap-1 lg:block">
                <p className="hidden px-3 pb-1.5 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase lg:block">{group}</p>
                <ul className="flex gap-1 lg:block lg:space-y-0.5">
                  {settingsSections
                    .filter((s) => s.group === group)
                    .map((section) => {
                      const Icon = section.icon;
                      const fieldGroup = SECTION_GROUP[section.id];
                      const invalid = fieldGroup !== undefined && errorGroups.has(fieldGroup);
                      return (
                        <li key={section.id} className="shrink-0">
                          <NavLink
                            to={`${SETTINGS_PATH}/${section.id}`}
                            className={({ isActive }) =>
                              cn(
                                "flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                isActive
                                  ? "bg-primary/[0.08] font-semibold text-foreground"
                                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                              )
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <Icon aria-hidden="true" className={cn("size-4 shrink-0", isActive && "text-primary")} />
                                <span className="flex-1">{section.label}</span>
                                {invalid && (
                                  <>
                                    <span aria-hidden="true" className="size-1.5 rounded-full bg-destructive" />
                                    <span className="sr-only">(has errors)</span>
                                  </>
                                )}
                              </>
                            )}
                          </NavLink>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="min-w-0 max-w-3xl flex-1">
          {/* Keyed by path so each section starts at its own top when switching. */}
          <div key={pathname} className="space-y-6">
            <Outlet context={form} />
          </div>

          <div
            role="region"
            aria-label="Unsaved changes"
            hidden={!dirty}
            className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-lg backdrop-blur"
          >
            <span aria-hidden="true" className="size-2 rounded-full bg-warning" />
            <p className="text-sm font-medium">
              You have unsaved changes
              {hasErrors && <span className="font-normal text-destructive"> · fix the highlighted fields to save</span>}
            </p>
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(saved)}>
                Discard
              </Button>
              <Button type="button" size="sm" onClick={onSave} disabled={hasErrors}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
