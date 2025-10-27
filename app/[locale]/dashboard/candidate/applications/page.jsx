'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Award,
  Calendar,
  Briefcase,
  AlertCircle,
  Mail,
  MapPin,
  Building,
  Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ApplicationCard from '@/components/student/ApplicationCard';
import AcceptedApplicationCard from '@/components/student/AcceptedApplicationCard';
import ApplicationDetailsModal from '@/components/student/ApplicationDetailsModal';

export default function MyApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'en';
  const token = useSelector((state) => state.auth.token);

  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('invitations');
  
  // Modal state
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [respondModal, setRespondModal] = useState({ open: false, invitation: null, action: null });
  const [candidateResponse, setCandidateResponse] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (token) {
      fetchApplications();
      fetchInvitations();
    }
  }, [token]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching applications for student...');
      
      const res = await fetch('/api/applications/student', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Applications fetched:', data.applications?.length || 0);
        setApplications(data.applications || []);
      } else {
        console.error('❌ Failed to fetch applications');
      }
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      console.log('🔍 Fetching invitations for student...');
      
      const res = await fetch('/api/invitations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Invitations fetched:', data.invitations?.length || 0);
        setInvitations(data.invitations?.filter(inv => inv.status === 'pending') || []);
      } else {
        console.error('❌ Failed to fetch invitations');
      }
    } catch (error) {
      console.error('❌ Error fetching invitations:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchApplications(), fetchInvitations()]);
    setRefreshing(false);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailsModalOpen(true);
  };

  const handleRespondToInvitation = async () => {
    if (!respondModal.invitation || !respondModal.action) return;

    try {
      setResponding(true);
      const res = await fetch(`/api/invitations/${respondModal.invitation._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          response: respondModal.action,
          candidateResponse,
        }),
      });

      if (res.ok) {
        if (respondModal.action === 'accepted') {
          alert(locale === 'da' ? '✅ Invitation accepteret! Den vises nu i "Afventer" fanen.' : '✅ Invitation accepted! It now appears in the "Pending" tab.');
          await fetchApplications();
          await fetchInvitations();
          setActiveTab('pending');
        } else {
          alert(locale === 'da' ? 'Invitation afvist' : 'Invitation rejected');
          await fetchInvitations();
        }
        
        setRespondModal({ open: false, invitation: null, action: null });
        setCandidateResponse('');
      } else {
        const error = await res.json();
        alert(error.error || (locale === 'da' ? 'Kunne ikke besvare invitation' : 'Failed to respond to invitation'));
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert(locale === 'da' ? 'Kunne ikke besvare invitation' : 'Failed to respond to invitation');
    } finally {
      setResponding(false);
    }
  };

  const handleIgnoreInvitation = async (invitationId) => {
    if (!confirm(locale === 'da' ? 'Er du sikker på at du vil ignorere denne invitation?' : 'Are you sure you want to ignore this invitation?')) return;

    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        alert(locale === 'da' ? 'Invitation ignoreret' : 'Invitation ignored');
        fetchInvitations();
      }
    } catch (error) {
      console.error('Error ignoring invitation:', error);
    }
  };

  // Filter applications by status
  const acceptedApplications = applications.filter(app => 
    app.status === 'accepted' || app.status === 'offered'
  );
  
  const pendingApplications = applications.filter(app => 
    app.status === 'pending' || 
    app.status === 'interview_scheduled' ||
    app.status === 'interviewed' ||
    app.status === 'reviewed' ||
    app.status === 'shortlisted'
  );
  
  const rejectedApplications = applications.filter(app => 
    app.status === 'rejected' || app.status === 'withdrawn'
  );

  const copy = locale === 'da' ? {
    title: 'Mine ansøgninger',
    subtitle: 'Spor invitationer og tilbud fra virksomheder',
    back: 'Tilbage',
    refresh: 'Opdater',
    invitationsTab: 'Invitationer',
    acceptedTab: 'Accepteret',
    pendingTab: 'Afventer',
    rejectedTab: 'Afvist',
    noInvitations: 'Ingen invitationer',
    noInvitationsDesc: 'Du har ingen ventende invitationer endnu. Virksomheder vil invitere dig baseret på din profil.',
    noAccepted: 'Ingen accepterede tilbud',
    noAcceptedDesc: 'Du har ikke modtaget nogen tilbud endnu. Vent på, at virksomheder sender dig invitationer!',
    noPending: 'Ingen afventende ansøgninger',
    noPendingDesc: 'Du har ingen aktive ansøgninger. Virksomheder vil invitere dig baseret på din profil.',
    noRejected: 'Ingen afviste ansøgninger',
    noRejectedDesc: 'Du har ingen afviste ansøgninger.',
    loading: 'Indlæser ansøgninger...',
    offerReceived: 'Tilbud modtaget',
    awaitingInterview: 'Afventer samtale',
    interviewScheduled: 'Samtale planlagt',
    interviewed: 'Interviewet',
    underReview: 'Under gennemgang',
    statusRejected: 'Status: Afvist',
    company: 'Virksomhed',
    role: 'Rolle',
    location: 'Placering',
    duration: 'Varighed',
    accept: 'Accepter',
    reject: 'Afvis',
    ignore: 'Ignorer',
    message: 'Besked fra virksomheden',
    yourResponse: 'Din besked (valgfri)',
    responsePlaceholder: 'Skriv en besked til virksomheden...',
    send: 'Send',
    cancel: 'Annuller',
    respondModalTitle: 'Besvar invitation',
    sentOn: 'Sendt',
    expiresOn: 'Udløber'
  } : {
    title: 'My Applications',
    subtitle: 'Track invitations and offers from companies',
    back: 'Back',
    refresh: 'Refresh',
    invitationsTab: 'Invitations',
    acceptedTab: 'Accepted',
    pendingTab: 'Pending',
    rejectedTab: 'Rejected',
    noInvitations: 'No invitations',
    noInvitationsDesc: 'You have no pending invitations yet. Companies will invite you based on your profile.',
    noAccepted: 'No accepted offers',
    noAcceptedDesc: "You haven't received any offers yet. Wait for companies to send you invitations!",
    noPending: 'No pending applications',
    noPendingDesc: 'You have no active applications. Companies will invite you based on your profile.',
    noRejected: 'No rejected applications',
    noRejectedDesc: 'You have no rejected applications.',
    loading: 'Loading applications...',
    offerReceived: 'Offer Received',
    awaitingInterview: 'Awaiting Interview',
    interviewScheduled: 'Interview Scheduled',
    interviewed: 'Interviewed',
    underReview: 'Under Review',
    statusRejected: 'Status: Rejected',
    company: 'Company',
    role: 'Role',
    location: 'Location',
    duration: 'Duration',
    accept: 'Accept',
    reject: 'Reject',
    ignore: 'Ignore',
    message: 'Message from company',
    yourResponse: 'Your message (optional)',
    responsePlaceholder: 'Write a message to the company...',
    send: 'Send',
    cancel: 'Cancel',
    respondModalTitle: 'Respond to Invitation',
    sentOn: 'Sent On',
    expiresOn: 'Expires On'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-zinc-600">{copy.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/dashboard/candidate`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {copy.back}
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">{copy.title}</h1>
              <p className="text-zinc-600 mt-2">{copy.subtitle}</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {copy.refresh}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {copy.invitationsTab}
              {invitations.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {invitations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {copy.acceptedTab}
              {acceptedApplications.length > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {acceptedApplications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {copy.pendingTab}
              {pendingApplications.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                  {pendingApplications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {copy.rejectedTab}
              {rejectedApplications.length > 0 && (
                <Badge className="ml-2 bg-red-100 text-red-800">
                  {rejectedApplications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 0: Invitations - New invitations from companies */}
          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  {copy.invitationsTab}
                </CardTitle>
                <CardDescription>
                  {invitations.length === 0 
                    ? copy.noInvitationsDesc
                    : `${invitations.length} pending invitation${invitations.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noInvitations}</h3>
                    <p className="text-sm text-zinc-500">{copy.noInvitationsDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation._id} className="border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                <Building className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold text-zinc-900">
                                {invitation.internshipId?.title}
                              </h3>
                              <p className="text-sm text-zinc-600">{invitation.companyId?.companyName}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {typeof invitation.internshipId?.location === 'string' 
                                    ? invitation.internshipId.location 
                                    : invitation.internshipId?.location?.city || invitation.internshipId?.location?.address || 'N/A'}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {invitation.internshipId?.duration} months
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Invitation</Badge>
                        </div>

                        {invitation.message && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                            <p className="text-sm font-medium text-blue-900 mb-1">{copy.message}:</p>
                            <p className="text-sm text-blue-800">{invitation.message}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                          <span>{copy.sentOn}: {new Date(invitation.sentAt).toLocaleDateString()}</span>
                          <span className="text-orange-600">
                            {copy.expiresOn}: {new Date(invitation.expiresAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => setRespondModal({ open: true, invitation, action: 'accepted' })}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {copy.accept}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setRespondModal({ open: true, invitation, action: 'rejected' })}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {copy.reject}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleIgnoreInvitation(invitation._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 1: Pending - Awaiting or Scheduled Interviews */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  {copy.pendingTab}
                </CardTitle>
                <CardDescription>
                  {pendingApplications.length === 0 
                    ? copy.noPendingDesc
                    : `${pendingApplications.length} active application${pendingApplications.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noPending}</h3>
                    <p className="text-sm text-zinc-500">{copy.noPendingDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingApplications.map((application) => (
                      <ApplicationCard
                        key={application._id}
                        application={application}
                        onViewDetails={handleViewDetails}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Accepted - Offer Letters Received */}
          <TabsContent value="accepted">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  {copy.acceptedTab}
                </CardTitle>
                <CardDescription>
                  {acceptedApplications.length === 0 
                    ? copy.noAcceptedDesc
                    : `${acceptedApplications.length} offer${acceptedApplications.length === 1 ? '' : 's'} received`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {acceptedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noAccepted}</h3>
                    <p className="text-sm text-zinc-500">{copy.noAcceptedDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {acceptedApplications.map((application) => (
                      <AcceptedApplicationCard
                        key={application._id}
                        application={application}
                        onViewDetails={handleViewDetails}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Rejected */}
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  {copy.rejectedTab}
                </CardTitle>
                <CardDescription>
                  {rejectedApplications.length === 0 
                    ? copy.noRejectedDesc
                    : `${rejectedApplications.length} rejected application${rejectedApplications.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rejectedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noRejected}</h3>
                    <p className="text-sm text-zinc-500">{copy.noRejectedDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rejectedApplications.map((application) => (
                      <ApplicationCard
                        key={application._id}
                        application={application}
                        onViewDetails={handleViewDetails}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Application Details Modal */}
        <ApplicationDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
          locale={locale}
        />

        {/* Respond to Invitation Modal */}
        <Modal
          isOpen={respondModal.open}
          onClose={() => setRespondModal({ open: false, invitation: null, action: null })}
          title={copy.respondModalTitle}
          size="md"
        >
          <div className="space-y-4">
            <div className={`${respondModal.action === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
              <p className="text-sm font-medium">
                {respondModal.action === 'accepted' ? (
                  <span className="text-green-900">
                    {locale === 'da' ? 'Du accepterer denne invitation' : 'You are accepting this invitation'}
                  </span>
                ) : (
                  <span className="text-red-900">
                    {locale === 'da' ? 'Du afviser denne invitation' : 'You are rejecting this invitation'}
                  </span>
                )}
              </p>
              <p className="text-sm text-zinc-700 mt-2">
                <strong>{copy.role}:</strong> {respondModal.invitation?.internshipId?.title}
              </p>
              <p className="text-sm text-zinc-600">
                <strong>{copy.company}:</strong> {respondModal.invitation?.companyId?.companyName}
              </p>
            </div>

            <div>
              <Label>{copy.yourResponse}</Label>
              <Textarea
                value={candidateResponse}
                onChange={(e) => setCandidateResponse(e.target.value)}
                placeholder={copy.responsePlaceholder}
                rows={4}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setRespondModal({ open: false, invitation: null, action: null })}
              disabled={responding}
            >
              {copy.cancel}
            </Button>
            <Button
              onClick={handleRespondToInvitation}
              disabled={responding}
              variant={respondModal.action === 'accepted' ? 'default' : 'destructive'}
            >
              {responding ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {locale === 'da' ? 'Sender...' : 'Sending...'}
                </>
              ) : (
                copy.send
              )}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
