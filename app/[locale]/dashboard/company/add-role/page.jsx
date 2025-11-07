'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BackButton } from '@/components/ui/back-button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { ListChecks } from 'lucide-react';
import FullRoleForm from '@/components/forms/FullRoleForm';

export default function AddRolePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const user = useSelector((state) => state.auth.user);

  const copy = locale === 'da' ? {
    title: 'Opret praktikrolle',
    subtitle: 'Udfyld formularen nedenfor for at oprette en ny praktikrolle',
    formTitle: 'Rolleoplysninger',
    formDesc: '📋 Detaljeret trin-for-trin guide med alle muligheder',
    back: 'Tilbage',
    dashboard: 'Dashboard',
    addRole: 'Opret rolle',
  } : {
    title: 'Create Internship Role',
    subtitle: 'Fill out the form below to create a new internship role',
    formTitle: 'Role Information',
    formDesc: '📋 Detailed step-by-step guide with all options',
    back: 'Back',
    dashboard: 'Dashboard',
    addRole: 'Add Role',
  };

  return (
    <>
      {/* Header with Breadcrumb */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#d4d4d4] bg-white px-4 sticky top-0 z-10">
        <SidebarTrigger className="-ml-1 text-[#2b2b2b]" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-[#d4d4d4]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href={`/${locale}/dashboard/company`}
                className="text-[#737373] hover:text-[#2b2b2b] transition-colors"
              >
                {copy.dashboard}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#d4d4d4]" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#2b2b2b] font-semibold">
                {copy.addRole}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content - Full Width */}
      <main className="flex-1 overflow-auto">
        <div className="w-full h-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            
            {/* Header Section */}
            <div className="mb-8 space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[#2b2b2b] flex items-center justify-center shadow-lg">
                      <ListChecks className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2b2b2b]">
                        {copy.title}
                      </h1>
                      <p className="text-sm sm:text-base text-[#737373] mt-1">
                        {copy.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
                
                <BackButton
                  href={`/${locale}/dashboard/company`}
                  variant="outline"
                  className="border-[#d4d4d4] text-[#2b2b2b] hover:bg-[#f5f5f5] hover:text-[#525252] hover:border-[#2b2b2b] transition-all duration-200"
                >
                  {copy.back}
                </BackButton>
              </div>
            </div>

            {/* Form Card */}
            <Card className="border-2 border-[#d4d4d4] shadow-xl bg-white/95 backdrop-blur">
              <CardHeader className="border-b border-[#d4d4d4] bg-[#f5f5f5]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#2b2b2b] flex items-center justify-center">
                    <ListChecks className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#2b2b2b]">{copy.formTitle}</CardTitle>
                    <CardDescription className="text-[#737373]">{copy.formDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <FullRoleForm locale={locale} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
