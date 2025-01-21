import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white border-b border-stone-200">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold" style={{ color: '#476251' }}>Little Way Acres</a>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/#dogs">
              <a className="text-stone-600 hover:text-stone-900">Colorado Mountain Dogs</a>
            </Link>
            <Link href="/#goats">
              <a className="text-stone-600 hover:text-stone-900">Nigerian Dwarfs</a>
            </Link>
            <Link href="/#market">
              <a className="text-stone-600 hover:text-stone-900">Farmers Market</a>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}