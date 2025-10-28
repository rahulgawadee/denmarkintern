'use client';

import { useParams } from 'next/navigation';
import NotificationsView from '@/components/notifications/NotificationsView';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';

export default function CandidateNotificationsPage() {
  const params = useParams();
  const locale = params?.locale || 'en';

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#ffe4b5] px-4 bg-white sticky top-0 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-[#ffe4b5]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href={`/${locale}/dashboard/candidate`}
                className="text-[#6b5444] hover:text-[#fa8072]"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#4a3728] font-semibold">
                {locale === 'da' ? 'Notifikationer' : 'Notifications'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      
      <main className="flex flex-1 flex-col overflow-auto">
        <NotificationsView locale={locale} />
      </main>
    </>
  );
}
