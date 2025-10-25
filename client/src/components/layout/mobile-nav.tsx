import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheep, SheepLitter } from "@db/schema";
import { useCart } from "@/contexts/cart-context";
import { parseApiDate } from "@/lib/date-utils";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { getTotalItems } = useCart();

  // Fetch sheep data to determine what links to show
  const { data: sheep = [] } = useQuery<Sheep[]>({
    queryKey: ["/api/sheep"],
  });

  const { data: sheepLitters = [] } = useQuery<SheepLitter[]>({
    queryKey: ["/api/sheep-litters"],
  });

  // Check if there are sheep matching various criteria
  const hasSheep = sheep.length > 0;
  const hasAvailableSheep = sheep.some(s => s.available && s.display !== false);
  const hasCurrentSheepLitters = sheepLitters.some(l => l.isVisible && l.isCurrentLitter);
  const hasUpcomingSheepLitters = sheepLitters.some(l => l.isVisible && l.isPlannedLitter);
  const hasPastSheepLitters = sheepLitters.some(l => l.isVisible && l.isPastLitter);

  const handleSelect = () => {
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-4 md:hidden">
      {/* Cart Icon for Mobile */}
      <Link href="/cart">
        <div className="relative cursor-pointer group">
          <ShoppingCart className="h-6 w-6 text-stone-600 group-hover:text-stone-900 transition-colors duration-75" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </div>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
        <nav className="flex flex-col gap-4 h-full overflow-y-auto px-6 py-8">
          {/* Colorado Mountain Dogs */}
          <div className="flex flex-col gap-2">
            <Link href="/dogs">
              <a onClick={handleSelect} className="block px-2 py-1 text-lg font-medium text-stone-600 hover:text-stone-900">
                Colorado Mountain Dogs
              </a>
            </Link>
            <Link href="/dogs">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                About
              </a>
            </Link>
            <Link href="/dogs/males">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Males
              </a>
            </Link>
            <Link href="/dogs/females">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Females
              </a>
            </Link>
            <Link href="/dogs/litters/current">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Current Litters
              </a>
            </Link>
            <Link href="/dogs/litters/past">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Past Litters
              </a>
            </Link>
            <Link href="/dogs/available">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Available Dogs
              </a>
            </Link>
          </div>

          {/* Nigerian Dwarf Goats */}
          <div className="flex flex-col gap-2">
            <Link href="/goats">
              <a onClick={handleSelect} className="block px-2 py-1 text-lg font-medium text-stone-600 hover:text-stone-900">
                Nigerian Dwarf Goats
              </a>
            </Link>
            <Link href="/goats">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                About
              </a>
            </Link>
            <Link href="/goats/males">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Males
              </a>
            </Link>
            <Link href="/goats/females">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Females
              </a>
            </Link>
            <Link href="/goats/litters/current">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Current Litters
              </a>
            </Link>
            <Link href="/goats/litters/past">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Past Litters
              </a>
            </Link>
            <Link href="/goats/available">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Available Goats
              </a>
            </Link>
          </div>

          {/* Katahdin Sheep */}
          <div className="flex flex-col gap-2">
            <Link href="/sheep">
              <a onClick={handleSelect} className="block px-2 py-1 text-lg font-medium text-stone-600 hover:text-stone-900">
                Katahdin Sheep
              </a>
            </Link>
            <Link href="/sheep">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                About
              </a>
            </Link>
            {hasSheep && (
              <Link href="/sheep/males">
                <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                  Rams
                </a>
              </Link>
            )}
            {hasSheep && (
              <Link href="/sheep/females">
                <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                  Ewes
                </a>
              </Link>
            )}
            {hasCurrentSheepLitters && (
              <Link href="/sheep/litters/current">
                <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                  Current Litters
                </a>
              </Link>
            )}
            {hasUpcomingSheepLitters && (
              <Link href="/sheep/litters/upcoming">
                <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                  Upcoming Litters
                </a>
              </Link>
            )}
            {hasPastSheepLitters && (
              <Link href="/sheep/litters/past">
                <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                  Past Litters
                </a>
              </Link>
            )}
            {hasAvailableSheep && (
              <Link href="/sheep/available">
                <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                  Available Sheep
                </a>
              </Link>
            )}
          </div>

          {/* Bees */}
          <div className="flex flex-col gap-2">
            <Link href="/bees">
              <a onClick={handleSelect} className="block px-2 py-1 text-lg font-medium text-stone-600 hover:text-stone-900">
                Bees
              </a>
            </Link>
            <Link href="/bees">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Purpose
              </a>
            </Link>
            <Link href="/bees">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Goals
              </a>
            </Link>
            <Link href="/bees">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Products
              </a>
            </Link>
          </div>

          {/* Farmers Market */}
          <div className="flex flex-col gap-2">
            <Link href="/market">
              <a onClick={handleSelect} className="block px-2 py-1 text-lg font-medium text-stone-600 hover:text-stone-900">
                Farmers Market
              </a>
            </Link>
            <Link href="/market">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                About
              </a>
            </Link>
            <Link href="/market/bakery">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Bakery
              </a>
            </Link>

            <Link href="/market/animal-products">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Animal Products
              </a>
            </Link>
          </div>

          {/* Apparel */}
          <div className="flex flex-col gap-2">
            <Link href="/market/apparel">
              <a onClick={handleSelect} className="block px-2 py-1 text-lg font-medium text-stone-600 hover:text-stone-900">
                Apparel
              </a>
            </Link>
          </div>

          {/* Cart Link in Mobile Menu */}
          <div className="flex flex-col gap-2 border-t pt-4 mt-4">
            <Link href="/cart">
              <div onClick={handleSelect} className="flex items-center gap-2 px-2 py-1 text-lg font-medium text-stone-600 hover:text-stone-900">
                <ShoppingCart className="h-5 w-5" />
                Cart
                {getTotalItems() > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
    </div>
  );
}