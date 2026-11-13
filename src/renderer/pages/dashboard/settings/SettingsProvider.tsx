import { useMemo, useState, type ReactNode } from "react";
import { defaultSettings, type AppSettings } from "./settings-data";
import { SettingsStoreContext } from "./settings-store";

/** Holds saved settings for the session, so they survive leaving the Settings page. */
export function SettingsProvider({ children, initial = defaultSettings }: { children: ReactNode; initial?: AppSettings }) {
  const [saved, setSaved] = useState(initial);
  const value = useMemo(() => ({ saved, save: setSaved }), [saved]);
  return <SettingsStoreContext.Provider value={value}>{children}</SettingsStoreContext.Provider>;
}
