'use client';

import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Star,
  Briefcase,
  Mail,
  Phone,
  Award
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function AcceptedApplicationCard({ 
  application, 
  onViewDetails,
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

  const offerDetails = application.offerDetails || {};
  const interview = application.interview;
  const attachments = (offerDetails.attachments && offerDetails.attachments.length > 0)
    ? offerDetails.attachments
    : interview?.offerLetter
      ? [{
          filename: interview.offerLetter.filename,
          url: interview.offerLetter.url,
          uploadedAt: interview.offerLetter.uploadedAt,
        }]
      : [];
  const joiningDate = offerDetails.joiningDate || interview?.joiningDate;
  const joiningMessage = offerDetails.joiningMessage || offerDetails.message || interview?.joiningMessage;
  const rating = interview?.outcome?.rating;
  const offerSentAt = offerDetails.sentAt || interview?.outcome?.decidedAt;

  return (
    <Card className="hover:shadow-lg transition-shadow border-green-200 bg-linear-to-br from-white to-green-50">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header with Success Badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16 border-2 border-green-200">
                <AvatarFallback className="bg-green-100">
                  <Building2 className="h-8 w-8 text-green-600" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {locale === 'da' ? '🎉 Tilbud modtaget' : '🎉 Offer Received'}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-zinc-900">
                  {application.internshipId?.title || 'Untitled Position'}
                </h3>
                <p className="text-base text-zinc-700 font-medium">
                  {application.companyId?.companyName || 'Company'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-zinc-600">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {typeof application.internshipId?.location === 'string'
                      ? application.internshipId.location
                      : application.internshipId?.location?.city || application.internshipId?.location?.address || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {application.internshipId?.duration || 'N/A'} months
                  </span>
                </div>
              </div>
            </div>
            
            {/* Rating Stars */}
            {rating && rating > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-xs text-zinc-500 mb-1">
                  {locale === 'da' ? 'Vurdering' : 'Rating'}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= rating 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Joining Date - Prominent Display */}
          {joiningDate && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {locale === 'da' ? 'Tiltrædelsesdato' : 'Joining Date'}
                  </p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatDate(joiningDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Offer Sent Timestamp */}
          {offerSentAt && (
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900">
                {locale === 'da' ? 'Tilbud sendt' : 'Offer Sent'}
              </p>
              <p className="text-sm text-green-700">
                {formatDate(offerSentAt)}
              </p>
            </div>
          )}

          {/* Company Message */}
          {joiningMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    {locale === 'da' ? 'Besked fra virksomheden' : 'Message from Company'}
                  </p>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">
                    {joiningMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Offer Letter Download */}
          {attachments.length > 0 && (
            <div className="border-t pt-4 space-y-3">
              {attachments.map((file, index) => (
                <Button
                  key={`${file.url}-${index}`}
                  onClick={() => window.open(file.url, '_blank')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {locale === 'da' ? 'Download tilbudsbrev' : 'Download Offer Letter'}
                  {file.filename ? ` (${file.filename})` : ''}
                  <Download className="h-4 w-4 ml-2" />
                </Button>
              ))}
            </div>
          )}

          {/* View Full Details Button */}
          <Button 
            onClick={() => onViewDetails(application)}
            variant="outline"
            className="w-full border-green-300 hover:bg-green-50"
          >
            <Award className="h-4 w-4 mr-2" />
            {locale === 'da' ? 'Se alle detaljer' : 'View Full Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
