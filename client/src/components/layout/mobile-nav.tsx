import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4 mt-8">
          <Link href="/dogs">
            <a className="block px-2 py-1 text-lg text-stone-600 hover:text-stone-900">
              Colorado Mountain Dogs
            </a>
          </Link>
          <Link href="/#goats">
            <a className="block px-2 py-1 text-lg text-stone-600 hover:text-stone-900">
              Nigerian Dwarfs
            </a>
          </Link>
          <Link href="/#market">
            <a className="block px-2 py-1 text-lg text-stone-600 hover:text-stone-900">
              Farmers Market
            </a>
          </Link>
          <Link href="/admin">
            <a className="block px-2 py-1 text-lg text-stone-600 hover:text-stone-900">
              Admin
            </a>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
