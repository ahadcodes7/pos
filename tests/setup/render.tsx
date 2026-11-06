import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "@/renderer/context/auth-context";

/** Renders the current pathname so tests can assert navigation without timing. */
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

/**
 * Renders `<Route>` elements inside the app's real providers (QueryClient with retries off,
 * AuthProvider, router) starting at `initialPath`. Each call gets a fresh QueryClient so no
 * cache leaks between tests. Read the current path with `getByTestId("location")`.
 */
export function renderRoutes(routes: ReactNode, { initialPath = "/" }: { initialPath?: string } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>{routes}</Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}
