"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, GraduationCap } from "lucide-react";

export function RoleTabs({ companyContent, studentContent, defaultTab = "student" }) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="student" className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Student
        </TabsTrigger>
        <TabsTrigger value="company" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Company
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="student" className="mt-0">
        {studentContent}
      </TabsContent>
      
      <TabsContent value="company" className="mt-0">
        {companyContent}
      </TabsContent>
    </Tabs>
  );
}
