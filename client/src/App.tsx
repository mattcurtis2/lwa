import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import Login from "@/pages/login";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const { data: deploymentStatus } = useQuery({
    queryKey: ["/api/deployment-status"],
  });

  useEffect(() => {
    // In development mode, allow direct access
    if (deploymentStatus && !deploymentStatus.isProduction) {
      return;
    }

    // In production, check session
    fetch("/api/auth/check-session").then(res => {
      if (!res.ok) {
        setLocation("/login");
      }
    });
  }, [setLocation, deploymentStatus]);

  return <Component />;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/admin">
            {() => <ProtectedRoute component={Admin} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;