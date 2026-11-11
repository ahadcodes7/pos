import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setWindowChrome } from "@/renderer/modules/chrome/api";

export type ThemeMode = "light" | "dark";

export const modes = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
] as const satisfies ReadonlyArray<{ id: ThemeMode; name: string }>;

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readMode(storageKey: string, fallback: ThemeMode): ThemeMode {
  const stored = localStorage.getItem(`${storageKey}-mode`);
  return stored === "light" || stored === "dark" ? stored : fallback;
}

export function ThemeProvider({
  children,
  defaultMode = "light",
  storageKey = "vite-ui-theme",
  ...props
}: {
  children: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}) {
  const [mode, setMode] = useState<ThemeMode>(() => readMode(storageKey, defaultMode));

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.mode = mode;
    localStorage.setItem(`${storageKey}-mode`, mode);
    localStorage.removeItem(`${storageKey}-theme`);

    // Windows paints its caption buttons in a fixed color: keep it equal to the
    // themed title strip so the native controls never show a seam.
    const styles = window.getComputedStyle(root);
    const color = styles.getPropertyValue("--sidebar").trim();
    const symbolColor = styles.getPropertyValue("--sidebar-foreground").trim();
    if (color && symbolColor) {
      void setWindowChrome({ color, symbolColor }).catch(() => {});
    }
  }, [storageKey, mode]);

  return (
    <ThemeContext.Provider {...props} value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
