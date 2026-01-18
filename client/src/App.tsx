import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { SiteProvider } from "@/providers/site-provider";
import { Suspense } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { LazyAdmin } from "@/components/lazy-loaded";
import Login from "@/pages/login";
import Dogs from "@/pages/dogs";
import DogDetail from "@/pages/dog-detail";
import HowToPurchase from "@/pages/how-to-purchase";
import BreedingGoals from "@/pages/breeding-goals";
import LitterDetail from "@/pages/litter-detail";
import UpcomingLitters from "@/pages/upcoming-litters";
import PastLitters from "@/pages/past-litters";
import DogCurrentLitters from "@/pages/dog-current-litters";
import DogFutureLitters from "@/pages/dog-future-litters";
import Goats from "@/pages/goats";
import GoatDetail from "@/pages/goat-detail";
import GoatLitterDetail from "@/pages/goat-litter-detail";
import Sheep from "@/pages/sheep";
import GoatUpcomingLitters from "@/pages/goat-upcoming-litters";
import SheepCurrentLitters from "@/pages/sheep-current-litters";
import SheepUpcomingLitters from "@/pages/sheep-upcoming-litters";
import SheepPastLitters from "@/pages/sheep-past-litters";
import SheepLitterDetail from "@/pages/sheep-litter-detail";
import TotalVegetationManagement from "@/pages/total-vegetation-management";
import GoatPastLitters from "@/pages/goat-past-litters";
import GoatCurrentLitters from "@/pages/goat-current-litters";
import Gallery from "@/pages/gallery";
import Market from "@/pages/market";
import MarketSection from "@/pages/market-section";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import OrderConfirmation from "@/pages/order-confirmation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { CartProvider } from "@/contexts/cart-context";
import { useEffect } from "react";
import BeesPage from "./pages/bees";
import Chickens from "./pages/chickens";

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
          <Route path="/admin">
            {() => (
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Admin...</div>}>
                <LazyAdmin />
              </Suspense>
            )}
          </Route>
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
          <Route path="/dogs/litters/future" component={DogFutureLitters} />
          <Route path="/dogs/litters/upcoming" component={UpcomingLitters} />
          <Route path="/dogs/litters/past" component={PastLitters} />
          <Route path="/dogs/litters/:id" component={LitterDetail} />
          <Route path="/dogs/how-to-purchase" component={HowToPurchase} />
          <Route path="/dogs/breeding-goals" component={BreedingGoals} />
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
          {/* Sheep Routes */}
          <Route path="/sheep">
            {() => <Sheep />}
          </Route>
          <Route path="/sheep/males">
            {() => <Sheep genderFilter="male" />}
          </Route>
          <Route path="/sheep/females">
            {() => <Sheep genderFilter="female" />}
          </Route>
          <Route path="/sheep/available">
            {() => <Sheep showAvailable={true} />}
          </Route>
          <Route path="/sheep/litters/upcoming" component={SheepUpcomingLitters} />
          <Route path="/sheep/litters/current" component={SheepCurrentLitters} />
          <Route path="/sheep/litters/past" component={SheepPastLitters} />
          <Route path="/sheep/litters/:id" component={SheepLitterDetail} />
          <Route path="/sheep/total-vegetation-management" component={TotalVegetationManagement} />
          {/* Gallery Route */}
          <Route path="/gallery" component={Gallery} />
          {/* Market Routes */}
          <Route path="/market" component={Market} />
          <Route path="/market/bakery" component={MarketSection} />
          <Route path="/market/animal-products" component={MarketSection} />
          <Route path="/market/apparel" component={MarketSection} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/order-confirmation" component={OrderConfirmation} />
          {/* Bees Route */}
          <Route path="/bees" component={BeesPage} />
          {/* Chickens Route */}
          <Route path="/chickens" component={Chickens} />
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
        <SiteProvider>
          <CartProvider>
            <Router />
            <Toaster />
          </CartProvider>
        </SiteProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;