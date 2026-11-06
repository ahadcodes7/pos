import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading } = useQuery({
    queryKey: ["auth", "status"],
    queryFn: async () => {
      const status = await window.electronAPI.auth.status();
      return status.isAuthenticated ? status.user : null;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await window.electronAPI.auth.login(credentials);

      if (!response.success) {
        throw new Error(response?.message || "Login Failed");
      }

      return response.data;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["auth", "status"], userData);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await window.electronAPI.auth.logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "status"], null);
      queryClient.clear();
    },
  });

  const login = async (credentials) => {
    try {
      const user = await loginMutation.mutateAsync(credentials);
      return { success: true, user };
    } catch (error) {
      throw new Error(error.message || "Login failed");
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

  const value = {
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
