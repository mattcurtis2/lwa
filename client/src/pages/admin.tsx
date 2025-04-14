import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/providers/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DogManagement from "@/components/admin/dog-management";
import LitterManagement from "@/components/admin/litter-management";
import GoatManagement from "@/components/admin/goat-management";
import GoatLitterManagement from "@/components/admin/goat-litter-management";
import ContentSection from "@/components/admin/content-section";
import MarketScheduleManager from "@/components/admin/market-schedule-manager";
import MarketItemsManager from "@/components/admin/market-items-manager";
import SiteSelector from "@/components/admin/site-selector";
import {
  LayoutDashboard,
  Dog as DogIcon,
  Cat,
  ShoppingBag,
  Loader2,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Admin() {
  const [_, navigate] = useLocation();
  const { isLoggedIn, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dogs");
  const [activeDogTab, setActiveDogTab] = useState("overview");
  const [activeGoatTab, setActiveGoatTab] = useState("overview");
  const [activeMarketTab, setActiveMarketTab] = useState("schedule");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Close sidebar after selecting tab on mobile
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const SidebarContent = () => (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6">
        <Link href="/">
          <a className="hover:text-primary transition-colors">Admin Panel</a>
        </Link>
      </h2>
      
      <TabsList className="flex-col gap-1 bg-transparent p-0 mb-6">
        <button
          onClick={() => handleTabChange("dogs")}
          className={`flex w-full items-center justify-start px-4 py-2 text-left text-sm ${activeTab === "dogs" ? "bg-muted font-medium" : "bg-transparent hover:bg-muted/50"} transition-colors rounded-md`}
        >
          <DogIcon className="h-4 w-4 mr-2" />
          Dogs
        </button>
        <button
          onClick={() => handleTabChange("goats")}
          className={`flex w-full items-center justify-start px-4 py-2 text-left text-sm ${activeTab === "goats" ? "bg-muted font-medium" : "bg-transparent hover:bg-muted/50"} transition-colors rounded-md`}
        >
          <Cat className="h-4 w-4 mr-2" />
          Goats
        </button>
        <button
          onClick={() => handleTabChange("market")}
          className={`flex w-full items-center justify-start px-4 py-2 text-left text-sm ${activeTab === "market" ? "bg-muted font-medium" : "bg-transparent hover:bg-muted/50"} transition-colors rounded-md`}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Market
        </button>
        <button
          onClick={() => handleTabChange("content")}
          className={`flex w-full items-center justify-start px-4 py-2 text-left text-sm ${activeTab === "content" ? "bg-muted font-medium" : "bg-transparent hover:bg-muted/50"} transition-colors rounded-md`}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Content
        </button>
      </TabsList>
      
      {/* Site Manager Card added below tabs */}
      <div className="mt-6">
        <SiteSelector />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation={isMobile ? "horizontal" : "vertical"}
        className="w-full"
      >
        {/* Mobile Sidebar */}
        {isMobile ? (
          <div className="sticky top-0 z-30 bg-background border-b">
            <div className="flex items-center justify-between p-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] pt-6 px-0 pb-0">
                  <div className="px-6 mb-6">
                    <SiteSelector />
                  </div>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Desktop Sidebar */
          <div className="w-64 border-r bg-card fixed h-screen overflow-y-auto hidden md:block">
            <SidebarContent />
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 ${isMobile ? 'pl-0' : 'md:pl-64'}`}>
          <div className="container p-4 md:p-6">
            {!isMobile && (
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            )}
            <TabsContent value="dogs">
              <Tabs value={activeDogTab} onValueChange={setActiveDogTab}>
                <TabsList className="mb-4 flex flex-wrap">
                  <TabsTrigger value="overview">Dogs</TabsTrigger>
                  <TabsTrigger value="litters">Litters</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <DogManagement />
                </TabsContent>
                <TabsContent value="litters">
                  <LitterManagement />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="goats">
              <Tabs value={activeGoatTab} onValueChange={setActiveGoatTab}>
                <TabsList className="mb-4 flex flex-wrap">
                  <TabsTrigger value="overview">Goats</TabsTrigger>
                  <TabsTrigger value="litters">Litters</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <GoatManagement />
                </TabsContent>
                <TabsContent value="litters">
                  <GoatLitterManagement />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="market">
              <div>
                <Tabs
                  value={activeMarketTab}
                  onValueChange={setActiveMarketTab}
                >
                  <TabsList className="mb-4 flex flex-wrap">
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="items">Items</TabsTrigger>
                  </TabsList>
                  <TabsContent value="schedule">
                    <MarketScheduleManager />
                  </TabsContent>
                  <TabsContent value="items">
                    <MarketItemsManager />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="content">
              <ContentSection />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}