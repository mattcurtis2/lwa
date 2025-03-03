
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
import PastLitters from "@/pages/past-litters";
import Goats from "@/pages/goats";
import GoatDetail from "@/pages/goat-detail";
import GoatLitterDetail from "@/pages/goat-litter-detail";
import GoatUpcomingLitters from "@/pages/goat-upcoming-litters";
import GoatPastLitters from "@/pages/goat-past-litters";
import Market from "@/pages/market";
import MarketSection from "@/pages/market-section";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useEffect } from "react";
import Login from "@/pages/login";

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
      <ScrollToTop />
      <Header />
      <main className="flex-1 container py-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dogs" component={Dogs} />
          <Route path="/dog/:id" component={DogDetail} />
          <Route path="/litter/:id" component={LitterDetail} />
          <Route path="/upcoming-litters" component={UpcomingLitters} />
          <Route path="/past-litters" component={PastLitters} />
          <Route path="/goats" component={Goats} />
          <Route path="/goat/:id" component={GoatDetail} />
          <Route path="/goat-litter/:id" component={GoatLitterDetail} />
          <Route path="/goat-upcoming-litters" component={GoatUpcomingLitters} />
          <Route path="/goat-past-litters" component={GoatPastLitters} />
          <Route path="/market" component={Market} />
          <Route path="/market/:section" component={MarketSection} />
          <Route path="/admin" component={Admin} />
          <Route path="/login" component={Login} />
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
