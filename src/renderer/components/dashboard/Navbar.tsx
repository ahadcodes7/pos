import { ChevronRight, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "@/renderer/components/ui/theme-toggle";
import { useAuth } from "@/renderer/context/auth-context";
import { initialsOf, pageTitleFor } from "./nav";
import { UserMenu } from "./UserMenu";

const Navbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { section, title } = pageTitleFor(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/80 px-6 backdrop-blur">
      {/* Left - page title with its parent section */}
      <div className="flex min-w-0 items-center gap-2 text-sm">
        {section && (
          <>
            <span className="truncate text-muted-foreground">{section}</span>
            <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          </>
        )}
        <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />

        <UserMenu
          trigger={
            <button
              type="button"
              aria-label={user ? `Account menu for ${user.username}` : "Account menu"}
              title={user ? `Signed in as ${user.username}` : undefined}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-[0_0_0_3px] shadow-primary/15 ring-2 ring-background transition-shadow outline-none hover:shadow-primary/30 focus-visible:shadow-[0_0_0_4px] focus-visible:shadow-ring/40 data-[state=open]:shadow-primary/30"
            >
              {user ? (
                <span className="text-xs font-semibold tracking-wide">{initialsOf(user.username)}</span>
              ) : (
                <User aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          }
        />
      </div>
    </header>
  );
};

export default Navbar;
