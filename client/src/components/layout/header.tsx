import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import MobileNav from "./mobile-nav";
import { useState } from "react";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const logo = siteContent?.find(content => content.key === "logo");

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <img 
  src="/uploads/file-1737496486671-646235489.png"
  alt="Little Way Acres" 
  className="h-16 object-contain transition-transform duration-200 hover:scale-105"
/>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
                className="text-stone-600 hover:text-stone-900 transition-colors duration-75 font-medium py-2 px-1 cursor-pointer"
              >
                Colorado Mountain Dogs
              </button>
              <div 
                className={`absolute bg-white/95 backdrop-blur-sm border border-stone-200 shadow-xl w-56 py-2 mt-2 right-0 transition-opacity duration-75 ${
                  isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <Link href="/dogs" onClick={() => setIsDropdownOpen(false)}>
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    About
                  </a>
                </Link>
                <Link href="/dogs/males" onClick={() => setIsDropdownOpen(false)}>
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Males
                  </a>
                </Link>
                <Link href="/dogs/females" onClick={() => setIsDropdownOpen(false)}>
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Females
                  </a>
                </Link>
                <Link href="/dogs/litters/upcoming" onClick={() => setIsDropdownOpen(false)}>
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Upcoming Litters
                  </a>
                </Link>
                <Link href="/dogs/litters/past" onClick={() => setIsDropdownOpen(false)}>
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Past Litters
                  </a>
                </Link>
                <Link href="/dogs/available" onClick={() => setIsDropdownOpen(false)}>
                  <a className="block px-4 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 hover:pl-6 transition-all duration-75 font-medium">
                    Available Dogs
                  </a>
                </Link>
              </div>
            </div>
            <Link href="/#goats">
              <a className="text-stone-600 hover:text-stone-900 transition-colors duration-75 font-medium py-2 px-1">Nigerian Dwarfs</a>
            </Link>
            <Link href="/#market">
              <a className="text-stone-600 hover:text-stone-900 transition-colors duration-75 font-medium py-2 px-1">Farmers Market</a>
            </Link>
          </div>

          <MobileNav />
        </nav>
      </div>
    </header>
  );
}