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
    <header className="bg-white border-b border-stone-200">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/">
            {logo?.value ? (
              <img 
                src={logo.value} 
                alt="Little Way Acres" 
                className="h-12 object-contain"
              />
            ) : (
              <a className="text-2xl font-bold" style={{ color: '#476251' }}>Little Way Acres</a>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/dogs">
              <a className="text-stone-600 hover:text-stone-900">Colorado Mountain Dogs</a>
            </Link>
            <Link href="/#goats">
              <a className="text-stone-600 hover:text-stone-900">Nigerian Dwarfs</a>
            </Link>
            <Link href="/#market">
              <a className="text-stone-600 hover:text-stone-900">Farmers Market</a>
            </Link>
          </div>

          <MobileNav />
        </nav>
      </div>
    </header>
  );
}