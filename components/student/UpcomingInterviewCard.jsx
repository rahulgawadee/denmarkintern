'use client';

import {
  Calendar,
  Clock,
  Building2,
  MapPin,
  Video,
  Phone,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function UpcomingInterviewCard({ 
  interview,
  onJoinNow,
  locale = 'en'
}) {
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const renderLocation = (location) => {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    return [location.city, location.address].filter(Boolean).join(', ') || 'N/A';
  };

  const copy = locale === 'da' ? {
    scheduled: 'Planlagt',
    scheduledFor: 'Planlagt til',
    duration: 'Varighed',
    minutes: 'minutter',
    mode: 'Type',
    video: 'Video',
    phone: 'Telefon',
    onsite: 'På stedet',
    joinNow: 'Deltag nu',
    viewDetails: 'Se detaljer'
  } : {
    scheduled: 'Scheduled',
    scheduledFor: 'Scheduled for',
    duration: 'Duration',
    minutes: 'minutes',
    mode: 'Mode',
    video: 'Video',
    phone: 'Phone',
    onsite: 'Onsite',
    joinNow: 'Join Now',
    viewDetails: 'View Details'
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'video': return copy.video;
      case 'phone': return copy.phone;
      case 'onsite': return copy.onsite;
      default: return mode;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-blue-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header: Company & Role */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  {interview.internshipId?.title || 'Position'}
                </h3>
                <p className="text-sm text-zinc-600">
                  {interview.companyId?.companyName || 'Company'}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {renderLocation(interview.internshipId?.location)}
                  </span>
                </div>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {copy.scheduled}
            </Badge>
          </div>

          {/* Interview Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-blue-700 mb-1">
                {copy.scheduledFor}
              </p>
              <p className="text-sm font-bold text-blue-900">
                {formatDateTime(interview.scheduledDate)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-blue-700 mb-1">
                  {copy.mode}
                </p>
                <div className="flex items-center gap-1 text-sm text-blue-900">
                  {getModeIcon(interview.mode)}
                  <span>{getModeLabel(interview.mode)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-700 mb-1">
                  {copy.duration}
                </p>
                <p className="text-sm text-blue-900">
                  {interview.duration || 60} {copy.minutes}
                </p>
              </div>
            </div>
          </div>

          {/* Join Button */}
          <Button
            onClick={() => onJoinNow(interview)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {copy.joinNow}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
