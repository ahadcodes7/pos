import { User } from "lucide-react";
import { ThemeToggle } from "@/renderer/components/ui/theme-toggle";
import { Button } from "@/renderer/components/ui/button";
import { useAuth } from "@/renderer/context/auth-context";
import { cn } from "@/renderer/lib/utils";

const Navbar = () => {
  const { user } = useAuth();
  // NOTE: AuthUser has no `name`, so this is always undefined and the icon is shown.
  // Kept as-is (pre-existing behavior); use `username` if initials are wanted.
  const name = (user as { name?: string } | null)?.name;

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Left - Page Title/Breadcrumb */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative rounded-full w-9 h-9",
            "bg-primary hover:bg-primary/90",
            "text-primary-foreground",
          )}
        >
          {name ? (
            <span className="text-sm font-medium">
              {getInitials(name)}
            </span>
          ) : (
            <User className="w-5 h-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
