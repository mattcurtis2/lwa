
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DogManagement from "@/components/admin/dog-management";
import LitterManagement from "@/components/admin/litter-management";
import GoatManagement from "@/components/admin/goat-management";
import GoatLitterManagement from "@/components/admin/goat-litter-management";
import ContentSection from "@/components/admin/content-section";

export default function AdminDashboard() {
  const [_, navigate] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="dogs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dogs">Dogs</TabsTrigger>
          <TabsTrigger value="litters">Dog Litters</TabsTrigger>
          <TabsTrigger value="goats">Goats</TabsTrigger>
          <TabsTrigger value="goat-litters">Goat Litters</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        <TabsContent value="dogs">
          <DogManagement />
        </TabsContent>
        <TabsContent value="litters">
          <LitterManagement />
        </TabsContent>
        <TabsContent value="goats">
          <GoatManagement />
        </TabsContent>
        <TabsContent value="goat-litters">
          <GoatLitterManagement />
        </TabsContent>
        <TabsContent value="content">
          <ContentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
