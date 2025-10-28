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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#ffe4b5] bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] px-4 sticky top-0 z-10">
        <SidebarTrigger className="-ml-1 text-[#4a3728]" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-[#ffe4b5]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href={`/${locale}/dashboard/company`}
                className="text-[#6b5444] hover:text-[#fa8072] transition-colors"
              >
                {copy.dashboard}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#ffe4b5]" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#4a3728] font-semibold">
                {copy.addRole}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content - Full Width */}
      <main className="flex-1 overflow-auto">
        <div className="w-full h-full bg-linear-to-b from-[#fdf5e6] via-white to-[#ffefd5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            
            {/* Header Section */}
            <div className="mb-8 space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-[#ffa07a] to-[#fa8072] flex items-center justify-center shadow-lg">
                      <ListChecks className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4a3728]">
                        {copy.title}
                      </h1>
                      <p className="text-sm sm:text-base text-[#6b5444] mt-1">
                        {copy.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
                
                <BackButton
                  href={`/${locale}/dashboard/company`}
                  variant="outline"
                  className="border-[#ffe4b5] text-[#4a3728] hover:bg-[#ffefd5] hover:text-[#fa8072] hover:border-[#fa8072] transition-all duration-200"
                >
                  {copy.back}
                </BackButton>
              </div>
            </div>

            {/* Form Card */}
            <Card className="border-2 border-[#ffe4b5] shadow-xl bg-white/95 backdrop-blur">
              <CardHeader className="border-b border-[#ffe4b5] bg-linear-to-r from-[#fdf5e6] to-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-linear-to-br from-[#ffa07a] to-[#fa8072] flex items-center justify-center">
                    <ListChecks className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#4a3728]">{copy.formTitle}</CardTitle>
                    <CardDescription className="text-[#6b5444]">{copy.formDesc}</CardDescription>
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
