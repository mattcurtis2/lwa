import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import MobileNav from "./mobile-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const logo = siteContent?.find(content => content.key === "logo");

  return (
    <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#FDF7EB' }}>
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
            <DropdownMenu>
              <DropdownMenuTrigger className="text-stone-600 hover:text-stone-900 data-[state=open]:text-stone-900">
                Colorado Mountain Dogs
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48"
                sideOffset={8}
              >
                <Link href="/dogs">
                  <DropdownMenuItem className="cursor-pointer text-stone-600 hover:text-stone-900">
                    About
                  </DropdownMenuItem>
                </Link>
                <Link href="/dogs/males">
                  <DropdownMenuItem className="cursor-pointer text-stone-600 hover:text-stone-900">
                    Males
                  </DropdownMenuItem>
                </Link>
                <Link href="/dogs/females">
                  <DropdownMenuItem className="cursor-pointer text-stone-600 hover:text-stone-900">
                    Females
                  </DropdownMenuItem>
                </Link>
                <Link href="/dogs/litters/upcoming">
                  <DropdownMenuItem className="cursor-pointer text-stone-600 hover:text-stone-900">
                    Upcoming Litters
                  </DropdownMenuItem>
                </Link>
                <Link href="/dogs/litters/past">
                  <DropdownMenuItem className="cursor-pointer text-stone-600 hover:text-stone-900">
                    Past Litters
                  </DropdownMenuItem>
                </Link>
                <Link href="/dogs/available">
                  <DropdownMenuItem className="cursor-pointer text-stone-600 hover:text-stone-900">
                    Available Dogs
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
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