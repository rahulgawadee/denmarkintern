'use client';

import { useParams } from 'next/navigation';
import NotificationsView from '@/components/notifications/NotificationsView';

export default function CompanyNotificationsPage() {
  const params = useParams();
  const locale = params?.locale || 'da';

  return <NotificationsView locale={locale} />;
}
