"use client";

import { CompanySidebar } from "@/components/company-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function CompanyDashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <CompanySidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
