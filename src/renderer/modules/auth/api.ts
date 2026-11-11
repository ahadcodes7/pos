import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthUser, LoginInput } from "@/shared/contracts/auth.contract";
import { unwrap } from "@/renderer/lib/ipc";

// Server/IPC state for the auth module. Components use these hooks (via AuthProvider),
// never window.electronAPI directly.

export const authKeys = {
  status: ["auth", "status"] as const,
};

/** Current user, or null when signed out. */
export function useAuthStatus() {
  return useQuery({
    queryKey: authKeys.status,
    queryFn: async (): Promise<AuthUser | null> => {
      const status = await unwrap(window.electronAPI.auth.status());
      return status.isAuthenticated ? status.user : null;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginInput) => unwrap(window.electronAPI.auth.login(credentials)),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.status, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await window.electronAPI.auth.logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.status, null);
      queryClient.clear();
    },
  });
}
