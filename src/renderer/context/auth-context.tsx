import { createContext, useContext, type ReactNode } from "react";
import type { AuthUser, LoginInput } from "@/shared/contracts/auth.contract";
import { useAuthStatus, useLogin, useLogout } from "@/renderer/modules/auth/api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginInput) => Promise<{ success: true; user: AuthUser }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loginLoading: boolean;
  logoutLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading: loading } = useAuthStatus();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (credentials: LoginInput) => {
    try {
      const user = await loginMutation.mutateAsync(credentials);
      return { success: true as const, user };
    } catch (error) {
      throw new Error((error instanceof Error && error.message) || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const value: AuthContextValue = {
    user: user || null,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    loginLoading: loginMutation.isPending,
    logoutLoading: logoutMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
