"use client";

import { CandidateSidebar } from "@/components/candidate-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function CandidateDashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <CandidateSidebar />
      <SidebarInset className="w-full">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
