import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Navigate } from "react-router-dom";
import { AlertCircle, Check, Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { BrandLockup, BrandMark, BrandWordmark } from "./brand/BrandMark";

const VALUE_POINTS = ["Works offline, no internet needed", "Fast checkout at the counter", "Stock and books in one place"];

// Faint ledger grid on the brand panel; drawn with gradients so it stays crisp at any size.
const LEDGER_GRID = {
  backgroundImage:
    "linear-gradient(rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.05) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const { login, loginLoading, isAuthenticated } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login({ username, password });
      toast.success(`Welcome back, ${result.user.username}!`);
      setSignedIn(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message);
      toast.error(message);
    }
  };

  const trackCapsLock = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  // Navigate only once the auth state shows the new user. Navigating as soon as login()
  // resolves let ProtectedRoute render before the query update arrived and bounce back here.
  if (signedIn && isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex h-full overflow-y-auto bg-background">
      {/* Brand panel: a fixed brand surface (like the logo tile), identical in light and dark */}
      <aside className="relative hidden w-[44%] max-w-xl shrink-0 flex-col justify-between overflow-hidden bg-[#0f1013] p-10 text-white lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={LEDGER_GRID} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#7c3aed]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#f0e100]/10 blur-3xl"
        />

        <BrandLockup
          className="relative [--brand:#a78bfa]"
          markClassName="h-10 w-10"
          wordmarkClassName="text-lg"
        />

        <div className="relative space-y-8">
          <h2 className="max-w-sm text-[2rem] leading-[1.15] font-bold">
            Sell, track stock and keep your books <span className="text-[#a78bfa]">— even offline.</span>
          </h2>
          <ul className="space-y-3.5">
            {VALUE_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-[15px] text-white/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#a78bfa]/15 text-[#a78bfa]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">Point of sale, inventory and bookkeeping for your shop.</p>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-full flex-1 flex-col px-6 py-10">
        <div className="m-auto w-full max-w-[380px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark className="h-10 w-10" />
            <BrandWordmark className="text-lg" />
          </div>

          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your workspace to start selling.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-field border border-destructive/20 bg-destructive-surface px-3.5 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="Enter your username"
                  disabled={loginLoading}
                  className="h-11 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={trackCapsLock}
                  onKeyUp={trackCapsLock}
                  onBlur={() => setCapsLockOn(false)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={loginLoading}
                  className="h-11 pr-11 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={loginLoading}
                  className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-field-hover hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsLockOn && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Caps Lock is on
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loginLoading}>
              {loginLoading && <Loader2 aria-hidden="true" className="animate-spin" />}
              {loginLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your data stays on this device
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
