import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "../../context/theme-context";

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const label = mode === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMode(mode === "light" ? "dark" : "light")}
      aria-label={label}
      title={label}
      className="relative h-9 w-9 rounded-full text-muted-foreground shadow-none hover:bg-foreground/[0.06] hover:text-foreground"
    >
      <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
