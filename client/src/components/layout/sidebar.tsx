import { useLocation } from "wouter";
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
  onNavigate?: (section: string) => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const [location] = useLocation();

  const getSection = () => {
    if (location.includes('?')) {
      const params = new URLSearchParams(location.split('?')[1]);
      return params.get('section') || 'home';
    }
    return 'home';
  };

  const currentSection = getSection();

  const navigation = [
    { name: 'Home Content', section: 'home', icon: HomeIcon },
    { name: 'Carousel', section: 'carousel', icon: ImageIcon },
    { name: 'Dogs', section: 'dogs', icon: DogIcon },
    { name: 'Animals', section: 'animals', icon: UsersIcon },
    { name: 'Products', section: 'products', icon: ShoppingBagIcon },
    { name: 'Contact', section: 'contact', icon: PhoneIcon },
    { name: 'Settings', section: 'settings', icon: Settings2Icon },
  ];

  return (
    <div className={cn("pb-12 min-h-screen bg-sidebar border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Dashboard</h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => onNavigate?.(item.section)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  currentSection === item.section ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}