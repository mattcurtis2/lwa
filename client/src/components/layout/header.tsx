import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import MobileNav from "./mobile-nav";
import { useState } from "react";

export default function Header() {
  const [isDogDropdownOpen, setIsDogDropdownOpen] = useState(false);
  const [isGoatDropdownOpen, setIsGoatDropdownOpen] = useState(false);
  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState(false);
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const logo = siteContent?.find(content => content.key === "logo");

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
                <Link href="/dogs/litters/upcoming">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Upcoming Litters
                  </a>
                </Link>
                <Link href="/dogs/litters/past">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Past Litters
                  </a>
                </Link>
                <Link href="/dogs/available">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Available Dogs
                  </a>
                </Link>
              </div>
            </div>

            {/* Nigerian Dwarf Goats Dropdown */}
            <div className="relative">
              <Link href="/goats">
                <button
                  onMouseEnter={() => setIsGoatDropdownOpen(true)}
                  onMouseLeave={() => setIsGoatDropdownOpen(false)}
                  className="text-stone-600 hover:text-stone-900 transition-colors duration-75 font-medium py-2 px-1 cursor-pointer"
                >
                  Nigerian Dwarf Goats
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
                    Males
                  </a>
                </Link>
                <Link href="/goats/females">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Females
                  </a>
                </Link>
                <Link href="/goats/litters/upcoming">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Upcoming Litters
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

            {/* Farmers Market Dropdown */}
            <div className="relative">
              <Link href="/market">
                <button
                  onMouseEnter={() => setIsMarketDropdownOpen(true)}
                  onMouseLeave={() => setIsMarketDropdownOpen(false)}
                  className="text-stone-600 hover:text-stone-900 transition-colors duration-75 font-medium py-2 px-1 cursor-pointer"
                >
                  Farmers Market
                </button>
              </Link>
              <div 
                className={`absolute bg-white/95 backdrop-blur-sm border border-stone-200 shadow-xl w-56 py-2 mt-2 right-0 transition-opacity duration-75 ${
                  isMarketDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onMouseEnter={() => setIsMarketDropdownOpen(true)}
                onMouseLeave={() => setIsMarketDropdownOpen(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMarketDropdownOpen(false);
                }}
              >
                <Link href="/market">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    About
                  </a>
                </Link>
                <Link href="/market/bakery">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Bakery
                  </a>
                </Link>
                <Link href="/market/market-garden">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Market Garden
                  </a>
                </Link>
                <Link href="/market/animal-products">
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Animal Products
                  </a>
                </Link>
              </div>
            </div>
          </div>

          <MobileNav />
        </nav>
      </div>
    </header>
  );
}