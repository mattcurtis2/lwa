import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  DogIcon,
  ImageIcon,
  ShoppingBagIcon,
  UsersIcon,
  PhoneIcon,
  Settings2Icon,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const currentSection = location.split('?')[1]?.split('=')[1] || 'home';

  const navigation = [
    { name: 'Home Content', href: '/admin?section=home', icon: HomeIcon },
    { name: 'Carousel', href: '/admin?section=carousel', icon: ImageIcon },
    { name: 'Dogs', href: '/admin?section=dogs', icon: DogIcon },
    { name: 'Animals', href: '/admin?section=animals', icon: UsersIcon },
    { name: 'Products', href: '/admin?section=products', icon: ShoppingBagIcon },
    { name: 'Contact', href: '/admin?section=contact', icon: PhoneIcon },
    { name: 'Settings', href: '/admin?section=settings', icon: Settings2Icon },
  ];

  return (
    <div className={cn("pb-12 min-h-screen bg-sidebar border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Dashboard</h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  currentSection === item.href.split('=')[1] ? "bg-accent" : "transparent",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}