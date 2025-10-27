'use client';

import {
  X,
  Building2,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Download,
  Star,
  Briefcase,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Award,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ApplicationDetailsModal({
  isOpen,
  onClose,
  application,
  locale = 'en'
}) {
  if (!application) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-4 w-4" />,
          label: locale === 'da' ? 'Afventer' : 'Pending'
        };
      case 'interview_scheduled':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Calendar className="h-4 w-4" />,
          label: locale === 'da' ? 'Samtale planlagt' : 'Interview Scheduled'
        };
      case 'interviewed':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <CheckCircle className="h-4 w-4" />,
          label: locale === 'da' ? 'Interviewet' : 'Interviewed'
        };
      case 'offered':
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
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const interview = application.interview;
  const company = application.companyId;
  const internship = application.internshipId;
  const offerDetails = application.offerDetails || {};
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
  const offerSentAt = offerDetails.sentAt || interview?.outcome?.decidedAt;

  const copy = locale === 'da' ? {
    applicationDetails: 'Ansøgningsdetaljer',
    close: 'Luk',
    company: 'Virksomhed',
    position: 'Stilling',
    location: 'Placering',
    duration: 'Varighed',
    months: 'måneder',
    stipend: 'Løn',
    appliedOn: 'Ansøgt den',
    status: 'Status',
    interviewDetails: 'Samtaledetaljer',
    scheduledFor: 'Planlagt til',
    mode: 'Type',
    meetingLink: 'Mødelink',
    password: 'Adgangskode',
    notes: 'Noter',
    interviewers: 'Interviewere',
    offerDetails: 'Tilbudsdetaljer',
    joiningDate: 'Tiltrædelsesdato',
    message: 'Besked',
    offerLetter: 'Tilbudsbrev',
    downloadOffer: 'Download tilbudsbrev',
    rating: 'Vurdering',
    feedback: 'Feedback',
    companyInfo: 'Virksomhedsinformation',
    industry: 'Branche',
    email: 'E-mail',
    phone: 'Telefon',
    description: 'Beskrivelse',
    requirements: 'Krav',
    video: 'Video',
    onsite: 'På stedet',
    phoneInterview: 'Telefonsamtale',
    offerSent: 'Tilbud sendt'
  } : {
    applicationDetails: 'Application Details',
    close: 'Close',
    company: 'Company',
    position: 'Position',
    location: 'Location',
    duration: 'Duration',
    months: 'months',
    stipend: 'Stipend',
    appliedOn: 'Applied On',
    status: 'Status',
    interviewDetails: 'Interview Details',
    scheduledFor: 'Scheduled For',
    mode: 'Mode',
    meetingLink: 'Meeting Link',
    password: 'Password',
    notes: 'Notes',
    interviewers: 'Interviewers',
    offerDetails: 'Offer Details',
    joiningDate: 'Joining Date',
    message: 'Message',
    offerLetter: 'Offer Letter',
    downloadOffer: 'Download Offer Letter',
    rating: 'Rating',
    feedback: 'Feedback',
    companyInfo: 'Company Information',
    industry: 'Industry',
    email: 'Email',
    phone: 'Phone',
    description: 'Description',
    requirements: 'Requirements',
    video: 'Video',
    onsite: 'Onsite',
    phoneInterview: 'Phone',
    offerSent: 'Offer Sent'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            {copy.applicationDetails}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Company Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg -mx-6 -mt-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarFallback className="bg-white text-blue-600">
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{internship?.title || 'Position'}</h2>
                <p className="text-blue-100 text-lg">{company?.companyName || 'Company'}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {typeof internship?.location === 'string'
                      ? internship.location
                      : internship?.location?.city || internship?.location?.address || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {internship?.duration || 'N/A'} {copy.months}
                  </span>
                </div>
              </div>
              <Badge className={`${statusConfig.color} border flex items-center gap-2`}>
                {statusConfig.icon}
                <span className="font-semibold">{statusConfig.label}</span>
              </Badge>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">{copy.appliedOn}</p>
              <p className="text-base font-semibold text-gray-900">
                {formatDateOnly(application.createdAt)}
              </p>
            </div>
            {internship?.stipend && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">{copy.stipend}</p>
                <p className="text-base font-semibold text-gray-900">{internship.stipend}</p>
              </div>
            )}
          </div>

          {/* Interview Details - Only if interview exists and is scheduled */}
          {interview && interview.status !== 'pending' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                {copy.interviewDetails}
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                {interview.scheduledDate && (
                  <div>
                    <p className="text-sm font-medium text-blue-900">{copy.scheduledFor}</p>
                    <p className="text-base text-blue-700 font-semibold">
                      {formatDate(interview.scheduledDate)}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-blue-900">{copy.mode}</p>
                    <p className="text-base text-blue-700 capitalize flex items-center gap-1">
                      {interview.mode === 'video' && <Video className="h-4 w-4" />}
                      {interview.mode === 'video' ? copy.video : 
                       interview.mode === 'onsite' ? copy.onsite : copy.phoneInterview}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">{copy.duration}</p>
                    <p className="text-base text-blue-700">{interview.duration || 60} min</p>
                  </div>
                </div>

                {interview.meetingLink && (
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">{copy.meetingLink}</p>
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {interview.meetingLink}
                    </a>
                  </div>
                )}

                {interview.meetingPassword && (
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">{copy.password}</p>
                    <code className="bg-white px-3 py-1 rounded border border-blue-300 text-blue-700 font-mono">
                      {interview.meetingPassword}
                    </code>
                  </div>
                )}

                {interview.additionalNotes && (
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">{copy.notes}</p>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">
                      {interview.additionalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Offer Details - Only if offer received */}
          {(interview?.outcome?.decision === 'accepted' || application.status === 'accepted' || application.status === 'offered') && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                {copy.offerDetails}
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                {/* Rating */}
                {interview?.outcome?.rating && (
                  <div>
                    <p className="text-sm font-medium text-green-900 mb-2">{copy.rating}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= interview.outcome.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-lg font-semibold text-green-900">
                        {interview.outcome.rating}/5
                      </span>
                    </div>
                  </div>
                )}

                {/* Joining Date */}
                {joiningDate && (
                  <div className="bg-white border border-green-300 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">{copy.joiningDate}</p>
                        <p className="text-lg font-bold text-green-700">
                          {formatDateOnly(joiningDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Message */}
                {joiningMessage && (
                  <div>
                    <p className="text-sm font-medium text-green-900 mb-2">{copy.message}</p>
                    <div className="bg-white border border-green-300 rounded-lg p-3">
                      <p className="text-sm text-green-800 whitespace-pre-wrap">
                        {joiningMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Offer Sent Timestamp */}
                {offerSentAt && (
                  <div className="bg-white border border-green-300 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-900 mb-1">{copy.offerSent}</p>
                    <p className="text-sm text-green-800">{formatDate(offerSentAt)}</p>
                  </div>
                )}

                {/* Feedback */}
                {interview?.outcome?.feedback && (
                  <div>
                    <p className="text-sm font-medium text-green-900 mb-2">{copy.feedback}</p>
                    <div className="bg-white border border-green-300 rounded-lg p-3">
                      <p className="text-sm text-green-800 whitespace-pre-wrap">
                        {interview.outcome.feedback}
                      </p>
                    </div>
                  </div>
                )}

                {/* Offer Letter Download */}
                {attachments.length > 0 && attachments.map((file, index) => (
                  <Button
                    key={`${file.url}-${index}`}
                    onClick={() => window.open(file.url, '_blank')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {copy.downloadOffer}
                    {file.filename ? ` (${file.filename})` : ''}
                    <Download className="h-4 w-4 ml-2" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Company Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-600" />
              {copy.companyInfo}
            </h3>
            <div className="space-y-3">
              {company?.industry && (
                <div>
                  <p className="text-sm font-medium text-gray-600">{copy.industry}</p>
                  <p className="text-base text-gray-900">{company.industry}</p>
                </div>
              )}
              {company?.contactEmail && (
                <div>
                  <p className="text-sm font-medium text-gray-600">{copy.email}</p>
                  <a 
                    href={`mailto:${company.contactEmail}`}
                    className="text-base text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {company.contactEmail}
                  </a>
                </div>
              )}
              {company?.contactPhone && (
                <div>
                  <p className="text-sm font-medium text-gray-600">{copy.phone}</p>
                  <a 
                    href={`tel:${company.contactPhone}`}
                    className="text-base text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    {company.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Internship Description */}
          {internship?.description && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{copy.description}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{internship.description}</p>
            </div>
          )}

          {/* Requirements */}
          {internship?.requirements && internship.requirements.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{copy.requirements}</h3>
              <div className="flex flex-wrap gap-2">
                {internship.requirements.map((req, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="border-t pt-6">
            <Button onClick={onClose} variant="outline" className="w-full">
              <X className="h-4 w-4 mr-2" />
              {copy.close}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
