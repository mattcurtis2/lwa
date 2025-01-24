
import { useState } from "react";
import DogManagement from "@/components/admin/dog-management";
import LitterManagement from "@/components/admin/litter-management";
import ContentSection from "@/components/admin/content-section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dogs");

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="dogs" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dogs">Dogs</TabsTrigger>
          <TabsTrigger value="litters">Litters</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="dogs">
          <DogManagement />
        </TabsContent>

        <TabsContent value="litters">
          <LitterManagement />
        </TabsContent>

        <TabsContent value="content">
          <ContentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
