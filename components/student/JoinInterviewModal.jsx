'use client';

import {
  X,
  Video,
  Calendar,
  Clock,
  Key,
  ExternalLink,
  Copy,
  Building2,
  MapPin,
  Phone,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

export default function JoinInterviewModal({
  isOpen,
  onClose,
  interview,
  locale = 'en'
}) {
  const [copied, setCopied] = useState(false);

  if (!interview) return null;

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

  const handleCopyPassword = () => {
    if (interview.meetingPassword) {
      navigator.clipboard.writeText(interview.meetingPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinMeeting = () => {
    if (interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    }
  };

  const renderLocation = (location) => {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    return [location.city, location.address].filter(Boolean).join(', ') || 'N/A';
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'phone':
        return <Phone className="h-5 w-5" />;
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };

  const copy = locale === 'da' ? {
    interviewDetails: 'Samtaledetaljer',
    close: 'Luk',
    scheduledFor: 'Planlagt til',
    duration: 'Varighed',
    minutes: 'minutter',
    mode: 'Type',
    meetingLink: 'Mødelink',
    password: 'Adgangskode',
    copyPassword: 'Kopier adgangskode',
    copied: 'Kopieret!',
    joinMeeting: 'Deltag i møde',
    additionalNotes: 'Yderligere noter',
    companyNotes: 'Noter fra virksomheden',
    video: 'Video',
    phone: 'Telefon',
    onsite: 'På stedet',
    noMeetingLink: 'Mødelinket er ikke blevet delt endnu',
    importantInfo: 'Vigtig information'
  } : {
    interviewDetails: 'Interview Details',
    close: 'Close',
    scheduledFor: 'Scheduled For',
    duration: 'Duration',
    minutes: 'minutes',
    mode: 'Mode',
    meetingLink: 'Meeting Link',
    password: 'Password',
    copyPassword: 'Copy Password',
    copied: 'Copied!',
    joinMeeting: 'Join Meeting',
    additionalNotes: 'Additional Notes',
    companyNotes: 'Notes from Company',
    video: 'Video',
    phone: 'Phone',
    onsite: 'Onsite',
    noMeetingLink: 'Meeting link has not been shared yet',
    importantInfo: 'Important Information'
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {getModeIcon(interview.mode)}
            {copy.interviewDetails}
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
                <h2 className="text-2xl font-bold">{interview.internshipId?.title || 'Position'}</h2>
                <p className="text-blue-100 text-lg">{interview.companyId?.companyName || 'Company'}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {renderLocation(interview.internshipId?.location)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Time */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{copy.scheduledFor}</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatDateTime(interview.scheduledDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Mode and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">{copy.mode}</p>
              <div className="flex items-center gap-2 text-gray-900">
                {getModeIcon(interview.mode)}
                <span className="font-semibold">{getModeLabel(interview.mode)}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">{copy.duration}</p>
              <div className="flex items-center gap-2 text-gray-900">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">{interview.duration || 60} {copy.minutes}</span>
              </div>
            </div>
          </div>

          {/* Meeting Link */}
          {interview.meetingLink ? (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                {copy.meetingLink}
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-2">Link</p>
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all font-mono text-sm"
                  >
                    {interview.meetingLink}
                  </a>
                </div>

                {interview.meetingPassword && (
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      {copy.password}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-4 py-2 rounded border border-blue-300 text-blue-700 font-mono text-lg font-bold">
                        {interview.meetingPassword}
                      </code>
                      <Button
                        onClick={handleCopyPassword}
                        variant="outline"
                        className="border-blue-300"
                      >
                        {copied ? (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            {copy.copied}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            {copy.copyPassword}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleJoinMeeting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  {copy.joinMeeting}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    {copy.noMeetingLink}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    The company will share the meeting link before the scheduled time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {(interview.companyNotes || interview.additionalNotes) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{copy.companyNotes}</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{interview.companyNotes || interview.additionalNotes}</p>
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
