import { Link } from "wouter";
import MobileNav from "./mobile-nav";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const { getTotalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-semibold text-[#3F6A52] hover:text-stone-900 transition-colors">Little Way Acres</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {/* CMDs */}
            <Link href="/dogs" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              CMDs
            </Link>

            {/* Goats */}
            <Link href="/goats" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Goats
            </Link>

            {/* Sheep */}
            <Link href="/sheep" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Sheep
            </Link>

            {/* Bakery */}
            <Link href="/market/bakery" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Bakery
            </Link>

            {/* Bees */}
            <Link href="/bees" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Bees
            </Link>

            {/* Apparel */}
            <Link href="/market/apparel" className="text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Apparel
            </Link>

            {/* Cart Icon */}
            <Link href="/cart">
              <div className="relative cursor-pointer group">
                <ShoppingCart className="h-6 w-6 text-stone-600 group-hover:text-stone-900 transition-colors duration-75" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <MobileNav />
        </nav>
      </div>
    </header>
  );
}