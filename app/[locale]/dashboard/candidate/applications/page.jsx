'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2b2b2b] mx-auto"></div>
          <p className="mt-4 text-[#737373]">{copy.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#d4d4d4] px-4 bg-white sticky top-0 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-[#d4d4d4]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href={`/${locale}/dashboard/candidate`}
                className="text-[#737373] hover:text-[#2b2b2b]"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#2b2b2b] font-semibold">{copy.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-[#f5f5f5] hover:text-[#2b2b2b]"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{copy.refresh}</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-[#f5f5f5] overflow-auto">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#d4d4d4] shadow-sm">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2b2b2b]">
              {copy.title}
            </h1>
            <p className="text-[#737373] mt-2 text-sm lg:text-base">{copy.subtitle}</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#f5f5f5] border border-[#d4d4d4] p-1 h-auto w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger 
                value="invitations" 
                className="gap-2 data-[state=active]:bg-[#2b2b2b] data-[state=active]:text-white text-[#2b2b2b] font-medium px-2 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">{copy.invitationsTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Invit.' : 'Invit.'}</span>
                {invitations.length > 0 && (
                  <Badge className="ml-1 bg-white text-[#2b2b2b] px-1.5 py-0 text-xs">
                    {invitations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="accepted" 
                className="gap-2 data-[state=active]:bg-[#2b2b2b] data-[state=active]:text-white text-[#2b2b2b] font-medium px-2 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm"
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">{copy.acceptedTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Accep.' : 'Accep.'}</span>
                {acceptedApplications.length > 0 && (
                  <Badge className="ml-1 bg-white text-[#2b2b2b] px-1.5 py-0 text-xs">
                    {acceptedApplications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="gap-2 data-[state=active]:bg-[#2b2b2b] data-[state=active]:text-white text-[#2b2b2b] font-medium px-2 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm"
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">{copy.pendingTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Pend.' : 'Pend.'}</span>
                {pendingApplications.length > 0 && (
                  <Badge className="ml-1 bg-white text-[#2b2b2b] px-1.5 py-0 text-xs">
                    {pendingApplications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="rejected" 
                className="gap-2 data-[state=active]:bg-[#2b2b2b] data-[state=active]:text-white text-[#2b2b2b] font-medium px-2 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm"
              >
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">{copy.rejectedTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Rej.' : 'Rej.'}</span>
                {rejectedApplications.length > 0 && (
                  <Badge className="ml-1 bg-white text-[#2b2b2b] px-1.5 py-0 text-xs">
                    {rejectedApplications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

          {/* Tab 0: Invitations - New invitations from companies */}
          <TabsContent value="invitations" className="mt-6">
            <Card className="border-[#d4d4d4] shadow-md">
              <CardHeader className="bg-[#f5f5f5] border-b border-[#d4d4d4]">
                <CardTitle className="flex items-center gap-2 text-[#2b2b2b]">
                  <Mail className="h-5 w-5 text-[#2b2b2b]" />
                  {copy.invitationsTab}
                </CardTitle>
                <CardDescription className="text-[#737373]">
                  {invitations.length === 0 
                    ? copy.noInvitationsDesc
                    : `${invitations.length} pending invitation${invitations.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="mx-auto h-16 w-16 text-[#d4d4d4] mb-4" />
                    <h3 className="text-lg font-medium text-[#2b2b2b] mb-2">{copy.noInvitations}</h3>
                    <p className="text-sm text-[#737373]">{copy.noInvitationsDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation._id} className="border border-[#d4d4d4] rounded-lg p-4 sm:p-6 hover:shadow-lg hover:border-[#2b2b2b] transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                          <div className="flex items-start space-x-3 sm:space-x-4 w-full sm:w-auto">
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                              <AvatarFallback className="bg-[#f5f5f5]">
                                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-[#2b2b2b]" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-[#2b2b2b] line-clamp-2">
                                {invitation.internshipId?.title}
                              </h3>
                              <p className="text-sm text-[#737373] truncate">{invitation.companyId?.companyName}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-[#d4d4d4]">
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 shrink-0" />
                                  <span className="truncate">
                                    {typeof invitation.internshipId?.location === 'string' 
                                      ? invitation.internshipId.location 
                                      : invitation.internshipId?.location?.city || invitation.internshipId?.location?.address || 'N/A'}
                                  </span>
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 shrink-0" />
                                  {invitation.internshipId?.duration} months
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-[#2b2b2b] text-white shrink-0">Invitation</Badge>
                        </div>

                        {invitation.message && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 mb-4 rounded">
                            <p className="text-xs sm:text-sm font-medium text-blue-900 mb-1">{copy.message}:</p>
                            <p className="text-xs sm:text-sm text-blue-800">{invitation.message}</p>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#d4d4d4] mb-4 gap-2">
                          <span>{copy.sentOn}: {new Date(invitation.sentAt).toLocaleDateString()}</span>
                          <span className="text-orange-600">
                            {copy.expiresOn}: {new Date(invitation.expiresAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => setRespondModal({ open: true, invitation, action: 'accepted' })}
                            className="flex-1 bg-[#2b2b2b] hover:bg-[#737373] text-white"
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
          <TabsContent value="pending" className="mt-6">
            <Card className="border-[#d4d4d4] shadow-md">
              <CardHeader className="bg-[#f5f5f5] border-b border-[#d4d4d4]">
                <CardTitle className="flex items-center gap-2 text-[#2b2b2b]">
                  <Clock className="h-5 w-5 text-[#2b2b2b]" />
                  {copy.pendingTab}
                </CardTitle>
                <CardDescription className="text-[#737373]">
                  {pendingApplications.length === 0 
                    ? copy.noPendingDesc
                    : `${pendingApplications.length} active application${pendingApplications.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {pendingApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-16 w-16 text-[#d4d4d4] mb-4" />
                    <h3 className="text-lg font-medium text-[#2b2b2b] mb-2">{copy.noPending}</h3>
                    <p className="text-sm text-[#737373]">{copy.noPendingDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          <TabsContent value="accepted" className="mt-6">
            <Card className="border-[#d4d4d4] shadow-md">
              <CardHeader className="bg-[#f5f5f5] border-b border-[#d4d4d4]">
                <CardTitle className="flex items-center gap-2 text-[#2b2b2b]">
                  <Award className="h-5 w-5 text-[#2b2b2b]" />
                  {copy.acceptedTab}
                </CardTitle>
                <CardDescription className="text-[#737373]">
                  {acceptedApplications.length === 0 
                    ? copy.noAcceptedDesc
                    : `${acceptedApplications.length} offer${acceptedApplications.length === 1 ? '' : 's'} received`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {acceptedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="mx-auto h-16 w-16 text-[#d4d4d4] mb-4" />
                    <h3 className="text-lg font-medium text-[#2b2b2b] mb-2">{copy.noAccepted}</h3>
                    <p className="text-sm text-[#737373]">{copy.noAcceptedDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          <TabsContent value="rejected" className="mt-6">
            <Card className="border-[#d4d4d4] shadow-md">
              <CardHeader className="bg-[#f5f5f5] border-b border-[#d4d4d4]">
                <CardTitle className="flex items-center gap-2 text-[#2b2b2b]">
                  <XCircle className="h-5 w-5 text-[#2b2b2b]" />
                  {copy.rejectedTab}
                </CardTitle>
                <CardDescription className="text-[#737373]">
                  {rejectedApplications.length === 0 
                    ? copy.noRejectedDesc
                    : `${rejectedApplications.length} rejected application${rejectedApplications.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {rejectedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-16 w-16 text-[#d4d4d4] mb-4" />
                    <h3 className="text-lg font-medium text-[#2b2b2b] mb-2">{copy.noRejected}</h3>
                    <p className="text-sm text-[#737373]">{copy.noRejectedDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setRespondModal({ open: false, invitation: null, action: null })}
              disabled={responding}
              className="hover:bg-[#f5f5f5]"
            >
              {copy.cancel}
            </Button>
            <Button
              onClick={handleRespondToInvitation}
              disabled={responding}
              variant={respondModal.action === 'accepted' ? 'default' : 'destructive'}
              className={respondModal.action === 'accepted' 
                ? "bg-[#2b2b2b] hover:bg-[#737373]" 
                : ""
              }
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
      </main>
    </>
  );
}
