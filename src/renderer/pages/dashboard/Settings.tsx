import { useTheme, themes, modes } from "@/renderer/context/theme-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/renderer/lib/utils";

export default function Settings() {
  const { theme, mode, setTheme, setMode } = useTheme();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your dashboard appearance</p>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred color theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Grid */}
          <div>
            <h3 className="text-sm font-medium mb-3">Color Theme</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                    theme === t.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div
                    className="w-6 h-6 rounded-full shrink-0"
                    style={{ backgroundColor: t.primary }}
                  />
                  <span className="text-sm font-medium">{t.name}</span>
                  {theme === t.id && (
                    <Check className="w-4 h-4 absolute top-2 right-2 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Appearance</h3>
            <div className="flex gap-3">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                    mode === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  {m.id === "light" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{m.name}</span>
                  {mode === m.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Preview</h3>
            <div
              className="rounded-lg border p-4 space-y-3"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  P
                </div>
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    Sample Product
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Rs. 1,500
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: "var(--secondary)",
                    color: "var(--secondary-foreground)",
                  }}
                >
                  In Stock
                </div>
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--accent-foreground)",
                  }}
                >
                  Active
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
