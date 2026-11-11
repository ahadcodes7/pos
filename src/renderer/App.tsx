import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { ThemeProvider } from "./context/theme-context";
import { AuthProvider } from "./context/auth-context";
import { Toaster } from "./components/ui/sonner";
import { routes } from "./routes/index";
import MenuBar from "./components/layout/MenuBar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  return useRoutes(routes);
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultMode="dark" storageKey="pos-ui-theme-v2">
        <AuthProvider>
          <Router>
            <div className="flex h-screen flex-col overflow-hidden bg-background">
              <MenuBar />
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <AppRoutes />
              </div>
              <Toaster expand={false} richColors duration={4000} />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
