import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import Dogs from "@/pages/dogs";
import DogDetail from "@/pages/dog-detail";
import LitterDetail from "@/pages/litter-detail";
import UpcomingLitters from "@/pages/upcoming-litters";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useEffect } from "react";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ScrollToTop />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dogs">
            {() => <Dogs />}
          </Route>
          <Route path="/dogs/males">
            {() => <Dogs genderFilter="male" />}
          </Route>
          <Route path="/dogs/females">
            {() => <Dogs genderFilter="female" />}
          </Route>
          <Route path="/dogs/litters/upcoming" component={UpcomingLitters} />
          <Route path="/dogs/litters/:id" component={LitterDetail} />
          <Route path="/dogs/:id" component={DogDetail} />
          <Route path="/admin" component={Admin} />
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