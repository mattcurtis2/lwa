import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import MobileNav from "./mobile-nav";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function Header() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const logo = siteContent?.find(content => content.key === "logo");

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#FDF7EB' }}>
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
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Colorado Mountain Dogs</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid p-4 w-[400px] gap-3">
                      <Link href="/dogs">
                        <NavigationMenuLink className="block px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                          About
                        </NavigationMenuLink>
                      </Link>
                      <Link href="/dogs/males">
                        <NavigationMenuLink className="block px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                          Males
                        </NavigationMenuLink>
                      </Link>
                      <Link href="/dogs/females">
                        <NavigationMenuLink className="block px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                          Females
                        </NavigationMenuLink>
                      </Link>
                      <Link href="/dogs/litters/upcoming">
                        <NavigationMenuLink className="block px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                          Upcoming Litters
                        </NavigationMenuLink>
                      </Link>
                      <Link href="/dogs/litters/past">
                        <NavigationMenuLink className="block px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                          Past Litters
                        </NavigationMenuLink>
                      </Link>
                      <Link href="/dogs/available">
                        <NavigationMenuLink className="block px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                          Available Dogs
                        </NavigationMenuLink>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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