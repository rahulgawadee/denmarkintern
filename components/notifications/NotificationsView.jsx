"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const formatDate = (value, locale) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(locale === 'da' ? 'da-DK' : locale === 'sv' ? 'sv-SE' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '—';
  }
};

const categoryLabels = {
  general: { da: 'Generelt', en: 'General', sv: 'Allmänt' },
  match: { da: 'Match', en: 'Match', sv: 'Matchning' },
  interview: { da: 'Interview', en: 'Interview', sv: 'Intervju' },
  application: { da: 'Ansøgning', en: 'Application', sv: 'Ansökan' },
  offer: { da: 'Tilbud', en: 'Offer', sv: 'Erbjudande' },
  reminder: { da: 'Påmindelse', en: 'Reminder', sv: 'Påminnelse' },
  system: { da: 'System', en: 'System', sv: 'System' },
};

const getCategoryLabel = (category, locale) => {
  const entry = categoryLabels[category] || categoryLabels.general;
  if (locale === 'da') return entry.da;
  if (locale === 'sv') return entry.sv;
  return entry.en;
};

const statusCopy = {
  da: {
    heading: 'Notifikationer',
    description: 'Hold styr på matches, interviews og vigtige opdateringer.',
    unread: 'Ulæste',
    markAll: 'Marker alle som læst',
    empty: 'Ingen notifikationer endnu',
    emptyHelper: 'Nye opdateringer fra teamet vises her.',
    read: 'Marker som læst',
    unreadAction: 'Marker som ulæst',
    delete: 'Fjern',
  },
  sv: {
    heading: 'Aviseringar',
    description: 'Håll koll på matchningar, intervjuer och viktiga uppdateringar.',
    unread: 'Olästa',
    markAll: 'Markera alla som lästa',
    empty: 'Inga aviseringar ännu',
    emptyHelper: 'Nya uppdateringar från teamet visas här.',
    read: 'Markera som läst',
    unreadAction: 'Markera som oläst',
    delete: 'Ta bort',
  },
  en: {
    heading: 'Notifications',
    description: 'Track matches, interviews, and important updates.',
    unread: 'Unread',
    markAll: 'Mark all as read',
    empty: 'No notifications yet',
    emptyHelper: 'You will see updates from the team here.',
    read: 'Mark as read',
    unreadAction: 'Mark as unread',
    delete: 'Remove',
  },
};

export default function NotificationsView({ locale = 'en' }) {
  const token = useSelector((state) => state.auth.token);
  const copy = useMemo(() => statusCopy[locale] || statusCopy.en, [locale]);

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const emitRefresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event('notifications:refresh'));
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.headers.get('content-type')?.includes('application/json')) {
          try {
            const data = JSON.parse(text);
            setError(data.error || 'Failed to load notifications');
          } catch (parseError) {
            console.error('⚠️ Failed to parse error payload for notifications', parseError);
            setError('Failed to load notifications');
          }
        } else {
          console.error('⚠️ Non-JSON response when fetching notifications:', text);
          setError('Failed to load notifications');
        }
        return;
      }

      const text = await res.text();
      try {
        const data = JSON.parse(text || '{}');
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (parseError) {
        console.error('⚠️ Failed to parse notifications payload', parseError, text);
        setError('Failed to load notifications');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      emitRefresh();
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [emitRefresh, token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const updateNotification = async (id, read) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ read }),
      });

      if (!res.ok) {
        throw new Error('Failed to update notification');
      }

      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, read, readAt: read ? new Date().toISOString() : null } : item)));
      setUnreadCount((prev) => {
        if (read) {
          return Math.max(0, prev - 1);
        }
        return prev + 1;
      });
      emitRefresh();
    } catch (err) {
      console.error('⚠️ Failed to update notification', err);
    } finally {
      setUpdating(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to remove notification');
      }

      let removedWasUnread = false;
      setNotifications((prev) => {
        return prev.filter((item) => {
          if (item._id === id) {
            removedWasUnread = !item.read;
            return false;
          }
          return true;
        });
      });
      if (removedWasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      emitRefresh();
    } catch (err) {
      console.error('⚠️ Failed to delete notification', err);
    } finally {
      setUpdating(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setUpdating(true);
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to mark notifications');
      }

      setNotifications((prev) => prev.map((item) => ({ ...item, read: true, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
      emitRefresh();
    } catch (err) {
      console.error('⚠️ Failed to mark notifications', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              {copy.heading}
            </CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500 text-white">
              {copy.unread}: {unreadCount}
            </Badge>
            <Button variant="outline" onClick={markAllAsRead} disabled={updating || unreadCount === 0}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {copy.markAll}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : null}
          {!loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-zinc-500">
              <Bell className="h-10 w-10 text-zinc-300" />
              <p className="text-base font-semibold text-zinc-600">{copy.empty}</p>
              <p className="text-sm text-zinc-500">{copy.emptyHelper}</p>
            </div>
          ) : null}

          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-lg p-4 transition ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-100'}`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!notification.read ? <Circle className="h-3 w-3 text-blue-500" /> : <CheckCircle2 className="h-3 w-3 text-green-500" />}
                      <h3 className="text-base font-semibold text-zinc-900">{notification.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-600 whitespace-pre-wrap">{notification.message}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <Badge variant="outline">{getCategoryLabel(notification.category, locale)}</Badge>
                      <span>{formatDate(notification.createdAt, locale)}</span>
                      {notification.link ? (
                        <a href={notification.link} className="text-blue-600 hover:underline" rel="noopener noreferrer">
                          {locale === 'da' ? 'Åbn' : locale === 'sv' ? 'Öppna' : 'Open'}
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateNotification(notification._id, !notification.read)}
                      disabled={updating}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {notification.read ? copy.unreadAction : copy.read}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification._id)}
                      disabled={updating}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {copy.delete}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
