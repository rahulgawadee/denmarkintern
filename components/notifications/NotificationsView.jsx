"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, CheckCircle2, Circle, Trash2, Sparkles, Mail, Calendar, FileText, User, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

const getCategoryIcon = (category) => {
  const icons = {
    general: Bell,
    match: Sparkles,
    interview: Calendar,
    application: FileText,
    offer: Award,
    reminder: Bell,
    system: Bell,
  };
  return icons[category] || Bell;
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
      {/* Header Card with Stats */}
      <Card className="border-2 border-[#ffe4b5] bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] shadow-md">
        <CardContent className="pt-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-linear-to-r from-[#ffa07a] to-[#fa8072] text-white border-0 px-4 py-2 text-base sm:text-lg font-semibold">
                {copy.unread}: {unreadCount}
              </Badge>
              <div className="text-sm text-[#6b5444]">
                {notifications.length} {locale === 'da' ? 'total' : locale === 'sv' ? 'totalt' : 'total'}
              </div>
            </div>
            <Button 
              onClick={markAllAsRead} 
              disabled={updating || unreadCount === 0}
              className="bg-linear-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white shadow-md"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {copy.markAll}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error ? (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <Bell className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="border-2 border-[#ffe4b5]">
              <CardContent className="pt-6">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-[#ffefd5] rounded w-3/4"></div>
                  <div className="h-3 bg-[#ffefd5] rounded w-full"></div>
                  <div className="h-3 bg-[#ffefd5] rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && notifications.length === 0 ? (
        <Card className="border-2 border-[#ffe4b5] bg-linear-to-b from-white to-[#ffefd5]/20 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Bell className="h-16 w-16 sm:h-20 sm:w-20 text-[#fa8072] mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold text-[#4a3728] mb-2">{copy.empty}</h3>
            <p className="text-sm sm:text-base text-[#6b5444] text-center max-w-md">{copy.emptyHelper}</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => {
          const CategoryIcon = getCategoryIcon(notification.category);
          return (
            <Card
              key={notification._id}
              className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-2 ${
                notification.read 
                  ? 'border-[#ffe4b5] bg-white' 
                  : 'border-[#ffa07a] bg-linear-to-br from-[#fdf5e6] via-white to-[#ffefd5]/30'
              }`}
            >
              <CardContent className="pt-6 pb-5">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                        notification.read 
                          ? 'bg-linear-to-br from-[#e5e7eb] to-[#d1d5db]'
                          : 'bg-linear-to-br from-[#ffa07a] to-[#fa8072]'
                      }`}>
                        <CategoryIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${notification.read ? 'text-[#6b7280]' : 'text-white'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.read && (
                            <Circle className="h-2 w-2 text-[#fa8072] fill-[#fa8072] shrink-0" />
                          )}
                          <h3 className="text-base sm:text-lg font-semibold text-[#4a3728] line-clamp-2">
                            {notification.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[#6b5444] whitespace-pre-wrap mt-1 line-clamp-3">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge className="bg-linear-to-r from-[#ffefd5] to-[#ffe4b5] text-[#4a3728] border border-[#ffe4b5]">
                      {getCategoryLabel(notification.category, locale)}
                    </Badge>
                    <span className="text-xs sm:text-sm text-[#6b5444] flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(notification.createdAt, locale)}
                    </span>
                    {notification.link && (
                      <a 
                        href={notification.link} 
                        className="text-xs sm:text-sm text-[#fa8072] hover:text-[#ffa07a] font-medium hover:underline transition-colors" 
                        rel="noopener noreferrer"
                      >
                        {locale === 'da' ? 'Åbn' : locale === 'sv' ? 'Öppna' : 'Open'} →
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#ffe4b5]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateNotification(notification._id, !notification.read)}
                      disabled={updating}
                      className="flex-1 border-[#ffe4b5] hover:bg-[#fdf5e6] text-[#4a3728]"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {notification.read ? copy.unreadAction : copy.read}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotification(notification._id)}
                      disabled={updating}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {copy.delete}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
