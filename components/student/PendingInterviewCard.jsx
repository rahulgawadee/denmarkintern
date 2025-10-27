'use client';

import {
  Calendar,
  Clock,
  Building2,
  MapPin,
  Video,
  Phone,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function PendingInterviewCard({ 
  interview, 
  locale = 'en'
}) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
    pending: 'Afventer planlægning',
    acceptedOn: 'Accepteret',
    mode: 'Type',
    video: 'Video',
    phone: 'Telefon',
    onsite: 'På stedet',
    awaitingSchedule: 'Venter på virksomheden for at planlægge samtaletid'
  } : {
    pending: 'Pending Scheduling',
    acceptedOn: 'Accepted on',
    mode: 'Mode',
    video: 'Video',
    phone: 'Phone',
    onsite: 'Onsite',
    awaitingSchedule: 'Waiting for company to schedule interview time'
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header: Company & Role */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-yellow-100">
                  <Building2 className="h-6 w-6 text-yellow-600" />
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
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {copy.pending}
            </Badge>
          </div>

          {/* Status Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  {copy.awaitingSchedule}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-yellow-700">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {copy.acceptedOn}: {formatDate(interview.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-yellow-700">
                    {getModeIcon(interview.mode)}
                    <span>
                      {copy.mode}: {getModeLabel(interview.mode)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
