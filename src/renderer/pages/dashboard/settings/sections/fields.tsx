import type { ReactNode } from "react";
import { FormField } from "@/renderer/components/common/FormField";
import { InputGroup } from "@/renderer/components/common/InputGroup";
import { SwitchRow } from "@/renderer/components/common/SwitchRow";
import { Input } from "@/renderer/components/ui/input";
import { settingsSections } from "@/renderer/components/dashboard/nav";
import type { AppSettings, SettingsGroup } from "../settings-data";
import { useSettingsForm } from "../settings-store";
import type { FieldPath } from "../validate";

type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T] & string;

/** Section title and description above the section's cards. */
export function SectionHeading({ id }: { id: string }) {
  const section = settingsSections.find((s) => s.id === id);
  if (!section) return null;
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold">{section.label}</h3>
      <p className="text-sm text-muted-foreground">{section.description}</p>
    </div>
  );
}

/** A text setting wired to the settings draft, with its error or hint underneath. */
export function TextSetting<G extends SettingsGroup>({
  group,
  field,
  label,
  required,
  optional,
  hint,
  placeholder,
  inputMode,
  leading,
  trailing,
  className,
}: {
  group: G;
  field: KeysOfType<AppSettings[G], string>;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: ReactNode;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel";
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  const { draft, errors, update } = useSettingsForm();
  const id = `${group}-${field}`;
  const error = errors[`${group}.${field}` as FieldPath];
  const value = String(draft[group][field]);

  const input = (
    <Input
      id={id}
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      // The key is a string-valued field of this group, so this patch has the right shape.
      onChange={(e) => update(group, { [field]: e.target.value } as Partial<AppSettings[G]>)}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
    />
  );

  return (
    <FormField htmlFor={id} label={label} required={required} optional={optional} hint={hint} error={error} className={className}>
      {leading || trailing ? (
        <InputGroup leading={leading} trailing={trailing}>
          {input}
        </InputGroup>
      ) : (
        input
      )}
    </FormField>
  );
}

/** An on/off setting shown as a bordered switch row. */
export function SwitchSetting<G extends SettingsGroup>({
  group,
  field,
  label,
  description,
}: {
  group: G;
  field: KeysOfType<AppSettings[G], boolean>;
  label: string;
  description: string;
}) {
  const { draft, update } = useSettingsForm();
  return (
    <SwitchRow
      id={`${group}-${field}`}
      label={label}
      description={description}
      checked={Boolean(draft[group][field])}
      // The key is a boolean field of this group, so this patch has the right shape.
      onCheckedChange={(checked) => update(group, { [field]: checked } as Partial<AppSettings[G]>)}
    />
  );
}
