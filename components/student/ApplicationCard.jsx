'use client';

import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  Download,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ApplicationCard({ 
  application, 
  onViewDetails,
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

  // Get detailed status message based on application and interview status
  const getDetailedStatus = () => {
    const interview = application.interview;
    
    // No interview yet - waiting for company to schedule
    if (!interview || interview.status === 'pending') {
      return {
        label: locale === 'da' ? 'Venter på planlægning' : 'Awaiting Schedule',
        message: locale === 'da' 
          ? 'Venter på at virksomheden planlægger samtale.'
          : 'Waiting for company to schedule interview.',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="h-4 w-4" />
      };
    }
    
    // Interview scheduled - show date/time
    if (interview.status === 'scheduled' || interview.status === 'rescheduled') {
      const interviewDate = interview.scheduledDate ? formatDate(interview.scheduledDate) : 'TBD';
      return {
        label: locale === 'da' ? 'Samtale planlagt' : 'Interview Scheduled',
        message: locale === 'da'
          ? `Samtale den ${interviewDate}`
          : `Interview on ${interviewDate}`,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Calendar className="h-4 w-4" />
      };
    }
    
    // Interview completed - waiting for decision
    if (interview.status === 'completed' && interview.outcome.decision === 'pending') {
      return {
        label: locale === 'da' ? 'Interviewet' : 'Interviewed',
        message: locale === 'da'
          ? 'Afventer virksomhedens beslutning.'
          : "Awaiting company's response.",
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <CheckCircle className="h-4 w-4" />
      };
    }
    
    // Default pending status
    return {
      label: locale === 'da' ? 'Afventer' : 'Pending',
      message: locale === 'da' ? 'Under behandling' : 'Under review',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <AlertCircle className="h-4 w-4" />
    };
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return getDetailedStatus();
      case 'interview_scheduled':
        return getDetailedStatus();
      case 'interviewed':
        return getDetailedStatus();
      case 'offered':
      case 'accepted':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-4 w-4" />,
          label: locale === 'da' ? 'Accepteret' : 'Accepted',
          message: locale === 'da' ? 'Tilbud modtaget' : 'Offer received'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-4 w-4" />,
          label: locale === 'da' ? 'Afvist' : 'Rejected',
          message: locale === 'da' ? 'Ansøgning afvist' : 'Application rejected'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="h-4 w-4" />,
          label: status,
          message: ''
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
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
                  {application.internshipId?.title || 'Untitled Position'}
                </h3>
                <p className="text-sm text-zinc-600">
                  {application.companyId?.companyName || 'Company'}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {typeof application.internshipId?.location === 'string'
                      ? application.internshipId.location
                      : application.internshipId?.location?.city || application.internshipId?.location?.address || 'Location not specified'}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {application.internshipId?.duration || 'N/A'} months
                  </span>
                </div>
              </div>
            </div>
            <Badge className={`${statusConfig.color} border flex items-center gap-1`}>
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </Badge>
          </div>

          {/* Status Message */}
          {statusConfig.message && (
            <div className={`rounded-lg p-3 text-sm ${statusConfig.color} border`}>
              <p className="font-medium">{statusConfig.message}</p>
            </div>
          )}

          {/* Applied Date */}
          <div className="flex items-center text-sm text-zinc-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="font-medium">
              {locale === 'da' ? 'Ansøgt' : 'Applied'}: 
            </span>
            <span className="ml-1">{formatDate(application.createdAt)}</span>
          </div>

          {/* View Details Button */}
          <Button 
            onClick={() => onViewDetails(application)}
            variant="outline"
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            {locale === 'da' ? 'Se detaljer' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
