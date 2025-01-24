import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import MobileNav from "./mobile-nav";

export default function Header() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContent = (key: string) => siteContent?.find(c => c.key === key)?.value;
  const logoUrl = getContent("logo_url") || "/images/logo.png";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto">
        <nav className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src={logoUrl} 
              alt={getContent("site_title") || "Little Way Acres"} 
              className="h-12 w-auto"
            />
          </Link>
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}