'use client';

import { useParams } from 'next/navigation';
import NotificationsView from '@/components/notifications/NotificationsView';

export default function CandidateNotificationsPage() {
  const params = useParams();
  const locale = params?.locale || 'en';

  return <NotificationsView locale={locale} />;
}
