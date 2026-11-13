import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Settings, Sun } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { useAuth } from "@/renderer/context/auth-context";
import { useTheme } from "@/renderer/context/theme-context";
import { initialsOf } from "./nav";

/**
 * The account menu: who is signed in, Settings, the theme switch and Sign out. The sidebar
 * footer and the navbar avatar both open it; `trigger` is the element that opens it.
 */
export function UserMenu({
  trigger,
  side = "bottom",
  align = "end",
}: {
  trigger: ReactNode;
  side?: "top" | "bottom" | "right";
  align?: "start" | "end";
}) {
  const { user, logout, logoutLoading } = useAuth();
  const { mode, setMode } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const nextMode = mode === "dark" ? "light" : "dark";

  const signOut = async () => {
    try {
      // On success auth status becomes null and ProtectedRoute sends the user to /login.
      await logout();
    } catch {
      toast.error("Couldn't sign out. Please try again.");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="w-60">
        <DropdownMenuLabel className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-semibold text-primary-foreground">
            {initialsOf(user?.username ?? "")}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{user?.username ?? "Signed in"}</span>
            <span className="block text-xs font-normal text-muted-foreground">Signed in</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/dashboard/settings")}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            // Keep the menu open so the change is visible in place.
            e.preventDefault();
            setMode(nextMode);
          }}
        >
          {nextMode === "dark" ? <Moon /> : <Sun />}
          {nextMode === "dark" ? "Dark mode" : "Light mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={logoutLoading} onSelect={() => void signOut()}>
          <LogOut />
          {logoutLoading ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
