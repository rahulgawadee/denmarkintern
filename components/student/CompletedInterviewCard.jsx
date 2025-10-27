'use client';

import {
  Calendar,
  Building2,
  MapPin,
  CheckCircle,
  XCircle,
  Star,
  Award,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function CompletedInterviewCard({ 
  interview,
  locale = 'en'
}) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const decision = interview.outcome?.decision || 'pending';
  const rating = interview.outcome?.rating;

  const renderLocation = (location) => {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    return [location.city, location.address].filter(Boolean).join(', ') || 'N/A';
  };

  const getDecisionConfig = (decision) => {
    switch (decision) {
      case 'accepted':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-4 w-4" />,
          label: locale === 'da' ? 'Accepteret' : 'Accepted'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-4 w-4" />,
          label: locale === 'da' ? 'Afvist' : 'Rejected'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="h-4 w-4" />,
          label: locale === 'da' ? 'Afventer beslutning' : 'Pending Decision'
        };
    }
  };

  const decisionConfig = getDecisionConfig(decision);

  const copy = locale === 'da' ? {
    completed: 'Afsluttet',
    interviewedOn: 'Interviewet den',
    decision: 'Beslutning',
    rating: 'Vurdering',
    movedToApplications: 'Flyttet til Mine ansøgninger'
  } : {
    completed: 'Completed',
    interviewedOn: 'Interviewed on',
    decision: 'Decision',
    rating: 'Rating',
    movedToApplications: 'Moved to My Applications'
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      decision === 'accepted' ? 'border-green-200 bg-gradient-to-br from-white to-green-50' :
      decision === 'rejected' ? 'border-red-200' : 'border-gray-200'
    }`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header: Company & Role */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={
                  decision === 'accepted' ? 'bg-green-100' :
                  decision === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                }>
                  <Building2 className={`h-6 w-6 ${
                    decision === 'accepted' ? 'text-green-600' :
                    decision === 'rejected' ? 'text-red-600' : 'text-gray-600'
                  }`} />
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
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(interview.scheduledDate)}
                  </span>
                </div>
              </div>
            </div>
            <Badge className={`${decisionConfig.color} border flex items-center gap-1`}>
              {decisionConfig.icon}
              <span>{decisionConfig.label}</span>
            </Badge>
          </div>

          {/* Decision Details */}
          <div className={`border rounded-lg p-4 ${
            decision === 'accepted' ? 'bg-green-50 border-green-200' :
            decision === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="space-y-3">
              {/* Rating */}
              {rating && rating > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{
                    color: decision === 'accepted' ? 'rgb(22 101 52)' :
                           decision === 'rejected' ? 'rgb(127 29 29)' : 'rgb(82 82 82)'
                  }}>
                    {copy.rating}
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold" style={{
                      color: decision === 'accepted' ? 'rgb(22 101 52)' :
                             decision === 'rejected' ? 'rgb(127 29 29)' : 'rgb(82 82 82)'
                    }}>
                      {rating}/5
                    </span>
                  </div>
                </div>
              )}

              {/* Accepted Message */}
              {decision === 'accepted' && (
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">{copy.movedToApplications}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
