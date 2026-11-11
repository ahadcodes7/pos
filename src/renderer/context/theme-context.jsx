import { createContext, useContext, useEffect, useState } from "react";

export const modes = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
];

const ThemeContext = createContext({
  mode: "light",
  setMode: () => null,
});

export function ThemeProvider({
  children,
  defaultMode = "light",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [mode, setMode] = useState(
    () => localStorage.getItem(`${storageKey}-mode`) || defaultMode
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.mode = mode;
    localStorage.setItem(`${storageKey}-mode`, mode);
    localStorage.removeItem(`${storageKey}-theme`);
  }, [storageKey, mode]);

  const value = {
    mode,
    setMode,
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
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
