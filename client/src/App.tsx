import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Challenge from "@/pages/challenge";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <div className="screen-overlay"></div>
          <div className="scan-line"></div>
          
          <Switch>
            <ProtectedRoute path="/" component={Dashboard} />
            <ProtectedRoute path="/challenge/:id" component={Challenge} />
            <Route path="/auth" component={AuthPage} />
            <Route component={NotFound} />
          </Switch>
          
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
