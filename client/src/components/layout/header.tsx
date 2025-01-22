import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import MobileNav from "./mobile-nav";

export default function Header() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const logo = siteContent?.find(content => content.key === "logo");

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/">
            {logo?.value ? (
              <img 
                src={logo.value} 
                alt="Little Way Acres" 
                className="h-12 object-contain transition-transform duration-200 hover:scale-105"
              />
            ) : (
              <a className="text-2xl font-bold transition-colors duration-200" style={{ color: '#476251' }}>Little Way Acres</a>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative group">
              <Link href="/dogs">
                <a className="text-stone-600 hover:text-stone-900 transition-colors duration-75 font-medium py-2 px-1 cursor-pointer">
                  Colorado Mountain Dogs
                </a>
              </Link>
              <div className="absolute opacity-0 group-hover:opacity-100 invisible group-hover:visible bg-white/95 backdrop-blur-sm border border-stone-200 shadow-xl w-56 py-2 mt-2 right-0 transition-all duration-75">
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