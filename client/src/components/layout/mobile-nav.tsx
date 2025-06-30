
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const handleSelect = () => {
    setOpen(false);
  };

  return (
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
            <Link href="/market/market-garden">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Market Garden
              </a>
            </Link>
            <Link href="/market/animal-products">
              <a onClick={handleSelect} className="block px-4 py-1 text-stone-600 hover:text-stone-900 hover:pl-6 transition-all duration-75">
                Animal Products
              </a>
            </Link>
          </div>

          {/* Photo Gallery */}
          <div className="flex flex-col gap-2">
            <Link href="/gallery">
              <a onClick={handleSelect} className="block px-2 py-1 text-lg font-medium text-stone-600 hover:text-stone-900">
                Photo Gallery
              </a>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
