import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import SitesPage from "@/pages/admin/SitesPage";
import Login from "@/pages/login";
import Dogs from "@/pages/dogs";
import DogDetail from "@/pages/dog-detail";
import LitterDetail from "@/pages/litter-detail";
import UpcomingLitters from "@/pages/upcoming-litters";
import PastLitters from "@/pages/past-litters";
import DogCurrentLitters from "@/pages/dog-current-litters";
import Goats from "@/pages/goats";
import GoatDetail from "@/pages/goat-detail";
import GoatLitterDetail from "@/pages/goat-litter-detail";
import GoatUpcomingLitters from "@/pages/goat-upcoming-litters";
import GoatPastLitters from "@/pages/goat-past-litters";
import GoatCurrentLitters from "@/pages/goat-current-litters";
import Market from "@/pages/market";
import MarketSection from "@/pages/market-section";
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
  const [location] = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      {location !== '/admin' && location !== '/login' && <Header />}
      <ScrollToTop />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/sites" component={SitesPage} />
          {/* Dog Routes */}
          <Route path="/dogs">
            {() => <Dogs />}
          </Route>
          <Route path="/dogs/males">
            {() => <Dogs genderFilter="male" />}
          </Route>
          <Route path="/dogs/females">
            {() => <Dogs genderFilter="female" />}
          </Route>
          <Route path="/dogs/available">
            {() => <Dogs showAvailable={true} />}
          </Route>
          <Route path="/dogs/litters/current" component={DogCurrentLitters} />
          <Route path="/dogs/litters/upcoming" component={UpcomingLitters} />
          <Route path="/dogs/litters/past" component={PastLitters} />
          <Route path="/dogs/litters/:id" component={LitterDetail} />
          <Route path="/dogs/:id" component={DogDetail} />
          {/* Goat Routes */}
          <Route path="/goats">
            {() => <Goats />}
          </Route>
          <Route path="/goats/males">
            {() => <Goats genderFilter="male" />}
          </Route>
          <Route path="/goats/females">
            {() => <Goats genderFilter="female" />}
          </Route>
          <Route path="/goats/available">
            {() => <Goats showAvailable={true} />}
          </Route>
          <Route path="/goats/litters/upcoming" component={GoatUpcomingLitters} />
          <Route path="/goats/litters/current" component={GoatCurrentLitters} />
          <Route path="/goats/litters/past" component={GoatPastLitters} />
          <Route path="/goats/litters/:id" component={GoatLitterDetail} />
          <Route path="/goats/:id" component={GoatDetail} />
          {/* Market Routes */}
          <Route path="/market" component={Market} />
          <Route path="/market/bakery" component={MarketSection} />
          <Route path="/market/market-garden" component={MarketSection} />
          <Route path="/market/animal-products" component={MarketSection} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {location !== '/admin' && location !== '/login' && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;