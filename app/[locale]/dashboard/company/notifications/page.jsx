'use client';

import { useParams } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Bell } from 'lucide-react';
import NotificationsView from '@/components/notifications/NotificationsView';

export default function CompanyNotificationsPage() {
  const params = useParams();
  const locale = params?.locale || 'da';

  return (
    <>
      {/* Header with Breadcrumb - No Border */}
      <header className="flex h-16 shrink-0 items-center gap-2 bg-white px-4 sticky top-0 z-10">
        <SidebarTrigger className="-ml-1 text-[#2b2b2b]" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-[#d4d4d4]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#2b2b2b] font-semibold">
                {locale === 'da' ? 'Notifikationer' : locale === 'sv' ? 'Aviseringar' : 'Notifications'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="w-full h-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#2b2b2b] flex items-center justify-center shadow-md">
                  <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2b2b2b]">
                    {locale === 'da' ? 'Notifikationer' : locale === 'sv' ? 'Aviseringar' : 'Notifications'}
                  </h1>
                  <p className="text-sm sm:text-base text-[#737373] mt-1">
                    {locale === 'da' 
                      ? 'Hold styr på matches, interviews og vigtige opdateringer'
                      : locale === 'sv'
                      ? 'Håll koll på matchningar, intervjuer och viktiga uppdateringar'
                      : 'Track matches, interviews, and important updates'}
                  </p>
                </div>
              </div>
            </div>

            <NotificationsView locale={locale} />
          </div>
        </div>
      </main>
    </>
  );
}
