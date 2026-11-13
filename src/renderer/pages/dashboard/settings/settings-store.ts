import { createContext, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import type { AppSettings, SettingsGroup } from "./settings-data";
import type { SettingsErrors } from "./validate";

export interface SettingsStore {
  /** The last saved settings (in memory; reset when the app closes). */
  saved: AppSettings;
  save: (next: AppSettings) => void;
}

export const SettingsStoreContext = createContext<SettingsStore | undefined>(undefined);

export function useSettingsStore(): SettingsStore {
  const store = useContext(SettingsStoreContext);
  if (!store) throw new Error("useSettingsStore must be used within a SettingsProvider");
  return store;
}

/** What SettingsLayout hands each section through the router outlet. */
export interface SettingsForm {
  draft: AppSettings;
  errors: SettingsErrors;
  update: <G extends SettingsGroup>(group: G, patch: Partial<AppSettings[G]>) => void;
}

export function useSettingsForm(): SettingsForm {
  return useOutletContext<SettingsForm>();
}
