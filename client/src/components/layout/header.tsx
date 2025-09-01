import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SiteContent, Sheep, SheepLitter } from "@db/schema";
import MobileNav from "./mobile-nav";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const [isDogDropdownOpen, setIsDogDropdownOpen] = useState(false);
  const [isGoatDropdownOpen, setIsGoatDropdownOpen] = useState(false);
  const [isSheepDropdownOpen, setIsSheepDropdownOpen] = useState(false);
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
  const hasCurrentSheepLitters = sheepLitters.some(l => {
    const dueDate = new Date(l.dueDate);
    const today = new Date();
    return dueDate >= today;
  });
  const hasPastSheepLitters = sheepLitters.some(l => {
    const dueDate = new Date(l.dueDate);
    const today = new Date();
    return dueDate < today;
  });

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-semibold text-[#3F6A52] hover:text-stone-900 transition-colors">Little Way Acres</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {/* Colorado Mountain Dogs Dropdown */}
            <div className="relative">
              <Link href="/dogs">
                <button
                  onMouseEnter={() => setIsDogDropdownOpen(true)}
                  onMouseLeave={() => setIsDogDropdownOpen(false)}
                  className="text-stone-600 hover:text-stone-900 transition-colors duration-75 font-medium py-2 px-1 cursor-pointer"
                >
                  Colorado Mountain Dogs
                </button>
              </Link>
              <div 
                className={`absolute bg-white/95 backdrop-blur-sm border border-stone-200 shadow-xl w-56 py-2 mt-2 right-0 transition-opacity duration-75 ${
                  isDogDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onMouseEnter={() => setIsDogDropdownOpen(true)}
                onMouseLeave={() => setIsDogDropdownOpen(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDogDropdownOpen(false);
                }}
              >
                <Link href="/dogs">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    About
                  </a>
                </Link>
                <Link href="/dogs/males">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Males
                  </a>
                </Link>
                <Link href="/dogs/females">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Females
                  </a>
                </Link>
                <Link href="/dogs/litters/current">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Current Litters
                  </a>
                </Link>
                <Link href="/dogs/litters/past">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Past Litters
                  </a>
                </Link>
                <Link href="/dogs/litters/future">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Future Litters
                  </a>
                </Link>
                <Link href="/dogs/available">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Available Dogs
                  </a>
                </Link>
              </div>
            </div>

            {/* Goats Dropdown */}
            <div className="relative">
              <Link href="/goats">
                <button
                  onMouseEnter={() => setIsGoatDropdownOpen(true)}
                  onMouseLeave={() => setIsGoatDropdownOpen(false)}
                  className="text-stone-600 hover:text-stone-900 transition-colors duration-75 font-medium py-2 px-1 cursor-pointer"
                >
                  Goats
                </button>
              </Link>
              <div 
                className={`absolute bg-white/95 backdrop-blur-sm border border-stone-200 shadow-xl w-56 py-2 mt-2 right-0 transition-opacity duration-75 ${
                  isGoatDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onMouseEnter={() => setIsGoatDropdownOpen(true)}
                onMouseLeave={() => setIsGoatDropdownOpen(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGoatDropdownOpen(false);
                }}
              >
                <Link href="/goats">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    About
                  </a>
                </Link>
                <Link href="/goats/males">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Bucks
                  </a>
                </Link>
                <Link href="/goats/females">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Does
                  </a>
                </Link>
                <Link href="/goats/litters/current">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Current Litters
                  </a>
                </Link>
                <Link href="/goats/litters/past">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Past Litters
                  </a>
                </Link>
                <Link href="/goats/available">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Available Goats
                  </a>
                </Link>
              </div>
            </div>

            {/* Sheep Dropdown */}
            <div className="relative">
              <Link href="/sheep">
                <button
                  onMouseEnter={() => setIsSheepDropdownOpen(true)}
                  onMouseLeave={() => setIsSheepDropdownOpen(false)}
                  className="text-stone-600 hover:text-stone-900 transition-colors duration-75 font-medium py-2 px-1 cursor-pointer"
                >
                  Sheep
                </button>
              </Link>
              <div 
                className={`absolute bg-white/95 backdrop-blur-sm border border-stone-200 shadow-xl w-56 py-2 mt-2 right-0 transition-opacity duration-75 ${
                  isSheepDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onMouseEnter={() => setIsSheepDropdownOpen(true)}
                onMouseLeave={() => setIsSheepDropdownOpen(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSheepDropdownOpen(false);
                }}
              >
                <Link href="/sheep">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    About
                  </a>
                </Link>
                {hasSheep && (
                  <Link href="/sheep/males">
                    <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                      Rams
                    </a>
                  </Link>
                )}
                {hasSheep && (
                  <Link href="/sheep/females">
                    <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                      Ewes
                    </a>
                  </Link>
                )}
                {hasCurrentSheepLitters && (
                  <Link href="/sheep/litters/current">
                    <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                      Current Litters
                    </a>
                  </Link>
                )}
                {hasPastSheepLitters && (
                  <Link href="/sheep/litters/past">
                    <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                      Past Litters
                    </a>
                  </Link>
                )}
                {hasAvailableSheep && (
                  <Link href="/sheep/available">
                    <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                      Available Sheep
                    </a>
                  </Link>
                )}
              </div>
            </div>

            {/* Chickens */}
            <Link href="/chickens" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Chickens
            </Link>

            {/* Bees */}
            <Link href="/bees" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Bees
            </Link>

            {/* Bakery */}
            <Link href="/bakery" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Bakery
            </Link>

            {/* Apparel */}
            <Link href="/market/apparel" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Apparel
            </Link>

            {/* Cart Icon */}
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
          </div>

          <MobileNav />
        </nav>
      </div>
    </header>
  );
}