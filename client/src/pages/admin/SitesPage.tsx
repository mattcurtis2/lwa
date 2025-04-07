import React from 'react';
import SiteManager from '@/components/admin/SiteManager';
import AdminLayout from '@/components/layouts/admin-layout';

const SitesPage = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <SiteManager />
      </div>
    </AdminLayout>
  );
};

export default SitesPage;