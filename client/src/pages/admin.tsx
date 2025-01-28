import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DogManagement from "@/components/admin/dog-management";
import LitterManagement from "@/components/admin/litter-management";
import GoatManagement from "@/components/admin/goat-management";
import GoatLitterManagement from "@/components/admin/goat-litter-management";
import ContentSection from "@/components/admin/content-section";
import MarketScheduleManager from "@/components/admin/market-schedule-manager";
import MarketItemsManager from "@/components/admin/market-items-manager";
import {
  LayoutDashboard,
  Dog as DogIcon,
  Cat,
  ShoppingBag,
} from "lucide-react";

export default function Admin() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dogs");
  const [activeDogTab, setActiveDogTab] = useState("overview");
  const [activeGoatTab, setActiveGoatTab] = useState("overview");
  const [activeMarketTab, setActiveMarketTab] = useState("schedule");

  return (
    <div className="flex min-h-screen">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="w-full"
      >
        {/* Sidebar */}
        <div className="w-64 border-r bg-card fixed h-screen overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
            <TabsList className=" flex-col gap-2">
              <TabsTrigger
                value="dogs"
                className="w-full justify-start data-[state=active]:bg-muted"
              >
                <DogIcon className="h-4 w-4 mr-2" />
                Dogs
              </TabsTrigger>
              <TabsTrigger
                value="goats"
                className="w-full justify-start data-[state=active]:bg-muted"
              >
                <Cat className="h-4 w-4 mr-2" />
                Goats
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="w-full justify-start data-[state=active]:bg-muted"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Market
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="w-full justify-start data-[state=active]:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 pl-64">
          <div className="container mx-auto p-6">
            <TabsContent value="dogs">
              <Tabs value={activeDogTab} onValueChange={setActiveDogTab}>
                <TabsList className="mb-4">
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
                <TabsList className="mb-4">
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
                  <TabsList className="mb-4">
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
