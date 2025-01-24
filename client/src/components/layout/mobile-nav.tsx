
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <nav className="flex flex-col gap-4">
          <Link href="/" className="text-lg font-medium">
            Home
          </Link>
          <Link href="/dogs" className="text-lg font-medium">
            Dogs
          </Link>
          <Link href="/upcoming-litters" className="text-lg font-medium">
            Upcoming Litters
          </Link>
          <Link href="/past-litters" className="text-lg font-medium">
            Past Litters
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
