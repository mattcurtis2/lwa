import React from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import SiteManager from "@/components/admin/SiteManager";

const SitesPage = () => {
  return (
    <AdminLayout>
      <SiteManager />
    </AdminLayout>
  );
};

export default SitesPage;