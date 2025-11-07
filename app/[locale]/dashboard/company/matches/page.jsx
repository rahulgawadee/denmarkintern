'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/ui/action-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BackButton } from '@/components/ui/back-button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Eye, Send, UserCheck, GraduationCap, Mail, Phone, MapPin, Clock, CheckCircle, XCircle, Loader2, Building2, Calendar, FileText, ExternalLink, Download, Briefcase, Users, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';

export default function MatchesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const token = useSelector((state) => state.auth.token);

  const [view, setView] = useState('internships'); // 'internships' or 'candidates'
  const [selectedRole, setSelectedRole] = useState(null);
  const [internships, setInternships] = useState([]);
  const [matches, setMatches] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteModal, setInviteModal] = useState({ open: false, candidate: null, internshipId: null });
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    fetchInternships();
    fetchInvitations();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setInternships(data.internships || []);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchesForRole = async (roleId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/matches?roleId=${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
        setSelectedRole(data.role);
        setView('candidates');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/invitations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setInvitations(data.invitations || []);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text:', text);
          setInvitations([]);
        }
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setInvitations([]);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteModal.candidate || !inviteModal.internshipId) return;

    try {
      setSendingInvite(true);
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          internshipId: inviteModal.internshipId,
          candidateId: inviteModal.candidate._id,
          message: inviteMessage,
        }),
      });

      if (res.ok) {
        alert(copy.invitationSent);
        setInviteModal({ open: false, candidate: null, internshipId: null });
        setInviteMessage('');
        fetchInvitations();
      } else {
        const error = await res.json();
        alert(error.error || copy.invitationFailed);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert(copy.invitationFailed);
    } finally {
      setSendingInvite(false);
    }
  };

  const openInviteModal = (candidate, internshipId) => {
    setInviteModal({ open: true, candidate, internshipId });
    setInviteMessage('');
  };

  const goBackToInternships = () => {
    setView('internships');
    setSelectedRole(null);
    setMatches([]);
  };

  const getInvitationStatusBadge = (status) => {
    const badges = {
      pending: <Badge className="bg-[#e5e5e5] text-[#2b2b2b] border-0">{copy.pending}</Badge>,
      accepted: <Badge className="bg-[#525252] text-white border-0">{copy.accepted}</Badge>,
      rejected: <Badge className="bg-[#a3a3a3] text-white border-0">{copy.rejected}</Badge>,
      expired: <Badge className="bg-[#d4d4d4] text-[#2b2b2b] border-0">{copy.expired}</Badge>,
    };
    return badges[status] || badges.pending;
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'bg-[#2b2b2b] text-white border-0';
    if (percentage >= 60) return 'bg-[#525252] text-white border-0';
    return 'bg-[#a3a3a3] text-white border-0';
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <Badge className="bg-[#2b2b2b] text-white border-0 px-3 py-1">Active</Badge>
    ) : (
      <Badge className="bg-[#d4d4d4] text-[#2b2b2b] border-0 px-3 py-1">Under Review</Badge>
    );
  };

  const copy = locale === 'da' ? {
    title: 'Matchede kandidater',
    subtitle: 'Se kandidater der matcher dine praktikroller',
    back: 'Tilbage til dashboard',
    backToRoles: 'Tilbage til praktikroller',
    internshipTitle: 'Praktikrol',
    matchesFound: 'Matches fundet',
    postedOn: 'Oprettet',
    status: 'Status',
    actions: 'Handlinger',
    viewMatches: 'Se matches',
    noInternships: 'Ingen praktikroller endnu',
    noInternshipsDesc: 'Opret praktikroller for at begynde at modtage kandidat-matches',
    candidate: 'Kandidat',
    skills: 'Færdigheder',
    match: 'Match',
    education: 'Uddannelse',
    city: 'By',
    viewProfile: 'Se profil',
    sendInvite: 'Send invitation',
    invite: 'Inviter',
    noMatches: 'Ingen matches endnu',
    noMatchesDesc: 'Der er ingen kandidater, der matcher denne rolle endnu',
    role: 'Rolle',
    location: 'Placering',
    availability: 'Tilgængelighed',
    close: 'Luk',
    invitationSent: 'Invitation sendt!',
    invitationFailed: 'Kunne ikke sende invitation',
    matchesTab: 'Matchede kandidater',
    invitationsTab: 'Anmodede kandidater',
    inviteModalTitle: 'Send interview invitation',
    inviteMessage: 'Besked (valgfri)',
    inviteMessagePlaceholder: 'Skriv en personlig besked til kandidaten...',
    send: 'Send invitation',
    cancel: 'Annuller',
    pending: 'Afventer',
    accepted: 'Accepteret',
    rejected: 'Afvist',
    expired: 'Udløbet',
    sentOn: 'Sendt',
    respondedOn: 'Besvaret',
    noInvitations: 'Ingen invitationer sendt endnu',
    noInvitationsDesc: 'Send invitationer til matchede kandidater',
    university: 'Universitet',
    fieldOfStudy: 'Studieretning',
    phone: 'Telefon',
    email: 'E-mail',
    department: 'Afdeling',
    matchedCandidatesFor: 'Matchede kandidater for',
    profileDetails: 'Profil detaljer',
    resume: 'CV',
    portfolio: 'Portfolio',
    languages: 'Sprog',
    download: 'Download',
    openLink: 'Åbn link',
    invitationStatus: 'Invitationsstatus',
    confirmInvite: 'Er du sikker på, at du vil invitere',
    for: 'til',
  } : {
    title: 'Matched Candidates',
    subtitle: 'View candidates matching your internship roles',
    back: 'Back to dashboard',
    backToRoles: 'Back to Internship Roles',
    internshipTitle: 'Internship Title',
    matchesFound: 'Matches Found',
    postedOn: 'Posted On',
    status: 'Status',
    actions: 'Actions',
    viewMatches: 'View Matches',
    noInternships: 'No internships yet',
    noInternshipsDesc: 'Create internship roles to start receiving candidate matches',
    candidate: 'Candidate',
    skills: 'Skills',
    match: 'Match %',
    education: 'Education',
    city: 'City',
    viewProfile: 'View',
    sendInvite: 'Send Invite',
    invite: 'Invite',
    noMatches: 'No matches yet',
    noMatchesDesc: 'There are no candidates matching this role yet',
    role: 'Role',
    location: 'Location',
    availability: 'Availability',
    close: 'Close',
    invitationSent: 'Invitation sent successfully!',
    invitationFailed: 'Failed to send invitation',
    matchesTab: 'Matched Candidates',
    invitationsTab: 'Requested Candidates',
    inviteModalTitle: 'Send Interview Invitation',
    inviteMessage: 'Message (optional)',
    inviteMessagePlaceholder: 'Write a personal message to the candidate...',
    send: 'Send Invitation',
    cancel: 'Cancel',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    expired: 'Expired',
    sentOn: 'Sent On',
    respondedOn: 'Responded On',
    noInvitations: 'No invitations sent yet',
    noInvitationsDesc: 'Send invitations to matched candidates',
    university: 'University',
    fieldOfStudy: 'Field of Study',
    phone: 'Phone',
    email: 'Email',
    department: 'Department',
    matchedCandidatesFor: 'Matched Candidates for',
    profileDetails: 'Profile Details',
    resume: 'Resume',
    portfolio: 'Portfolio',
    languages: 'Languages',
    download: 'Download',
    openLink: 'Open Link',
    invitationStatus: 'Invitation Status',
    confirmInvite: 'Are you sure you want to invite',
    for: 'for',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#2b2b2b] border-r-transparent"></div>
          <p className="mt-4 text-[#737373] font-medium">{locale === 'da' ? 'Indlæser...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Sticky Header with Breadcrumb */}
      <header className="flex h-16 shrink-0 items-center gap-2 bg-white px-4 sticky top-0 z-10 border-b border-[#d4d4d4]">
        <SidebarTrigger className="-ml-1 text-[#2b2b2b]" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-[#d4d4d4]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href={`/${locale}/dashboard/company`}
                className="text-[#737373] hover:text-[#2b2b2b] transition-colors"
              >
                {locale === 'da' ? 'Dashboard' : 'Dashboard'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#d4d4d4]" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#2b2b2b] font-semibold">
                {locale === 'da' ? 'Matches' : 'Matches'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#2b2b2b] flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2b2b2b]">
                    {view === 'candidates' && selectedRole 
                      ? `${copy.matchedCandidatesFor} ${selectedRole.title}`
                      : copy.title
                    }
                  </h1>
                  <p className="text-sm sm:text-base text-[#737373] mt-1">
                    {view === 'candidates' 
                      ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'} found`
                      : copy.subtitle
                    }
                  </p>
                </div>
              </div>
              
              {view === 'candidates' && (
                <BackButton
                  onClick={goBackToInternships}
                  variant="outline"
                  className="border-[#d4d4d4] text-[#2b2b2b] hover:bg-[#f5f5f5] hover:text-[#1a1a1a] hover:border-[#2b2b2b] transition-all duration-200"
                >
                  {copy.backToRoles}
                </BackButton>
              )}
            </div>
          </div>

        {/* Internships List View */}
        {view === 'internships' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-12 bg-white border-2 border-[#d4d4d4] rounded-xl p-1">
              <TabsTrigger 
                value="matches" 
                className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-[#2b2b2b] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-[#737373] font-medium"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">{copy.matchesTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Matches' : 'Matches'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="invitations" 
                className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-[#2b2b2b] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-[#737373] font-medium"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">{copy.invitationsTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Anmodede' : 'Requested'}</span>
                {invitations.length > 0 && (
                  <Badge className="ml-2 bg-[#2b2b2b] text-white border-0">{invitations.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* All Internships Tab */}
            <TabsContent value="matches" className="mt-0 space-y-0">
              {internships.length === 0 ? (
                <Card className="border-2 border-[#d4d4d4] bg-white shadow-md">
                  <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                    <Sparkles className="h-16 w-16 sm:h-20 sm:w-20 text-[#737373] mb-4" />
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#2b2b2b] mb-2">
                      {copy.noInternships}
                    </h3>
                    <p className="text-sm sm:text-base text-[#737373] text-center max-w-md">
                      {locale === 'da' ? 'Opret din første praktikopslag for at begynde at matche med kandidater.' : 'Create your first internship role to start matching with candidates.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-5">
                  {internships.map((internship) => (
                    <Card 
                      key={internship._id} 
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-[#d4d4d4] bg-white cursor-pointer group"
                      onClick={() => fetchMatchesForRole(internship._id)}
                    >
                      <CardHeader className="bg-[#f5f5f5] pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#2b2b2b] flex items-center justify-center shrink-0 shadow-md">
                              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg sm:text-xl text-[#2b2b2b] group-hover:text-[#525252] transition-colors line-clamp-1">
                                {internship.title}
                              </CardTitle>
                              <p className="text-xs sm:text-sm text-[#737373] mt-0.5 line-clamp-1">
                                {internship.department}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge className="bg-[#2b2b2b] text-white border-0 px-3 py-1.5 text-sm font-semibold whitespace-nowrap">
                              {internship.matchesFound} {locale === 'da' ? 'Matches' : 'Matches'}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-[#737373] group-hover:text-[#2b2b2b] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f5f5f5]">
                            <Calendar className="h-4 w-4 text-[#2b2b2b] shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-[#737373]">{copy.postedOn}</p>
                              <p className="text-sm font-semibold text-[#2b2b2b] truncate">
                                {new Date(internship.postedOn).toLocaleDateString(locale)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f5f5f5]">
                            <TrendingUp className="h-4 w-4 text-[#2b2b2b] shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-[#737373]">{copy.matchesFound}</p>
                              <p className="text-sm font-semibold text-[#2b2b2b] truncate">
                                {internship.matchesFound} {locale === 'da' ? 'kandidater' : 'candidates'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f5f5f5] sm:col-span-2 lg:col-span-1">
                            {getStatusBadge(internship.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Requested Candidates Tab */}
            <TabsContent value="invitations" className="mt-0 space-y-0">
              {invitations.length === 0 ? (
                <Card className="border-2 border-[#d4d4d4] bg-white shadow-md">
                  <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                    <Mail className="h-16 w-16 sm:h-20 sm:w-20 text-[#737373] mb-4" />
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#2b2b2b] mb-2">
                      {copy.noInvitations}
                    </h3>
                    <p className="text-sm sm:text-base text-[#737373] text-center max-w-md">
                      {copy.noInvitationsDesc}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-5">
                  {invitations.map((invitation) => (
                    <Card 
                      key={invitation._id} 
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-[#d4d4d4] bg-white group"
                    >
                      <CardHeader className="bg-[#f5f5f5] pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border-2 border-white shadow-md">
                              <AvatarFallback className="bg-[#2b2b2b] text-white text-base font-semibold">
                                {invitation.candidateId?.firstName?.[0]}{invitation.candidateId?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg sm:text-xl text-[#2b2b2b] line-clamp-1">
                                {invitation.candidateId?.firstName} {invitation.candidateId?.lastName}
                              </CardTitle>
                              <p className="text-xs sm:text-sm text-[#737373] mt-0.5 line-clamp-1">
                                {invitation.candidateId?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getInvitationStatusBadge(invitation.status)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCandidate(invitation.candidateId)}
                              className="text-[#2b2b2b] hover:text-[#1a1a1a] hover:bg-[#e5e5e5]"
                            >
                              <Eye className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline text-sm">{copy.viewProfile}</span>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f5f5f5]">
                            <Briefcase className="h-4 w-4 text-[#2b2b2b] shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-[#737373]">{copy.role}</p>
                              <p className="text-sm font-semibold text-[#2b2b2b] truncate">
                                {invitation.internshipId?.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f5f5f5]">
                            <Send className="h-4 w-4 text-[#2b2b2b] shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-[#737373]">{copy.sentOn}</p>
                              <p className="text-sm font-semibold text-[#2b2b2b] truncate">
                                {new Date(invitation.sentAt).toLocaleDateString(locale)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f5f5f5] sm:col-span-2 lg:col-span-1">
                            <CheckCircle className="h-4 w-4 text-[#2b2b2b] shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-[#737373]">{copy.respondedOn}</p>
                              <p className="text-sm font-semibold text-[#2b2b2b] truncate">
                                {invitation.respondedAt 
                                  ? new Date(invitation.respondedAt).toLocaleDateString(locale)
                                  : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Matched Candidates View for Selected Role */}
        {view === 'candidates' && (
          <>
            {matches.length === 0 ? (
              <Card className="border-2 border-[#d4d4d4] bg-white shadow-md">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <UserCheck className="h-16 w-16 sm:h-20 sm:w-20 text-[#737373] mb-4" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#2b2b2b] mb-2">
                    {copy.noMatches}
                  </h3>
                  <p className="text-sm sm:text-base text-[#737373] text-center max-w-md">
                    {copy.noMatchesDesc}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-5">
                {matches.map((match) => (
                  <Card 
                    key={match._id} 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-[#ffe4b5] bg-white group"
                  >
                    <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 border-2 border-white shadow-md">
                            <AvatarFallback className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] text-white text-base sm:text-lg font-semibold">
                              {match.candidate?.firstName?.[0]}{match.candidate?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg sm:text-xl text-[#4a3728] line-clamp-1">
                              {match.candidate?.firstName} {match.candidate?.lastName}
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-[#6b5444] mt-0.5 line-clamp-1">
                              {match.candidate?.email}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getMatchColor(match.matchPercentage)} px-3 py-1.5 text-base sm:text-lg font-bold shrink-0`}>
                          {match.matchPercentage}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-4 space-y-4">
                      {/* Skills Section */}
                      {match.matchedSkills?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-[#6b5444] mb-2 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#fa8072]" />
                            {copy.matchedSkills || 'Matched Skills'}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {match.matchedSkills.map((skill, idx) => (
                              <Badge key={idx} className="bg-linear-to-r from-[#ffefd5] to-[#ffe4b5] text-[#4a3728] border-0 px-2.5 py-0.5 text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#fdf5e6]/40">
                          <GraduationCap className="h-4 w-4 text-[#fa8072] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-[#6b5444]">{copy.education}</p>
                            <p className="text-sm font-semibold text-[#4a3728] truncate">
                              {match.candidate?.education || '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#fdf5e6]/40">
                          <MapPin className="h-4 w-4 text-[#fa8072] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-[#6b5444]">{copy.city}</p>
                            <p className="text-sm font-semibold text-[#4a3728] truncate">
                              {match.candidate?.location?.city || match.candidate?.location?.address || match.candidate?.city || '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#fdf5e6]/40 sm:col-span-2 lg:col-span-1">
                          <Mail className="h-4 w-4 text-[#fa8072] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-[#6b5444]">Email</p>
                            <p className="text-sm font-semibold text-[#4a3728] truncate">
                              {match.candidate?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                          onClick={() => setSelectedCandidate(match.candidate)}
                          className="flex-1 bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#ffa07a] text-white shadow-md h-10"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {copy.viewFullProfile}
                        </Button>
                        <ActionButton
                          onClick={() => openInviteModal(match.candidate, selectedRole._id)}
                          icon={Send}
                          variant="outline"
                          className="flex-1 border-2 border-[#ffe4b5] hover:bg-[#fdf5e6] text-[#4a3728] h-10"
                        >
                          {copy.sendInvite}
                        </ActionButton>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Invite Modal */}
        <Modal
          isOpen={inviteModal.open}
          onClose={() => setInviteModal({ open: false, candidate: null, internshipId: null })}
          title={copy.inviteModalTitle}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">
                {copy.confirmInvite} <strong>{inviteModal.candidate?.firstName} {inviteModal.candidate?.lastName}</strong>
              </p>
              <p className="text-sm text-blue-700">
                {copy.for} <strong>{selectedRole?.title || 'this role'}</strong>?
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <p className="text-sm text-zinc-700">
                <Mail className="h-4 w-4 inline mr-1" />
                {inviteModal.candidate?.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {copy.inviteMessage}
              </label>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder={copy.inviteMessagePlaceholder}
                rows={4}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setInviteModal({ open: false, candidate: null, internshipId: null })}
              disabled={sendingInvite}
            >
              {copy.cancel}
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={sendingInvite}
            >
              {sendingInvite ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {copy.send}
                </>
              )}
            </Button>
          </div>
        </Modal>

        {/* Candidate Profile Modal */}
        {selectedCandidate && (
          <Modal
            isOpen={!!selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            title={`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
          >
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="flex items-center gap-4 text-sm text-[#6b5444]">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#fa8072]" />
                  {selectedCandidate.email}
                </span>
                {selectedCandidate.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#fa8072]" />
                    {selectedCandidate.phone}
                  </span>
                )}
              </div>

              {/* Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#4a3728] mb-1">{copy.education}</p>
                  <p className="text-sm text-[#6b5444]">{selectedCandidate.education}</p>
                </div>
                {selectedCandidate.university && (
                  <div>
                    <p className="text-sm font-semibold text-[#4a3728] mb-1">{copy.university}</p>
                    <p className="text-sm text-[#6b5444]">{selectedCandidate.university}</p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {selectedCandidate.skills?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#4a3728] mb-3">{copy.skills}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill, idx) => (
                      <Badge key={idx} className="bg-linear-to-r from-[#ffefd5] to-[#ffe4b5] text-[#4a3728] border border-[#ffe4b5]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {(selectedCandidate.location?.city || selectedCandidate.city) && (
                <div>
                  <p className="text-sm font-semibold text-[#4a3728] mb-1">{copy.location}</p>
                  <p className="text-sm text-[#6b5444] flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#fa8072]" />
                    {selectedCandidate.location?.city || selectedCandidate.city}
                  </p>
                </div>
              )}

              {/* Bio */}
              {selectedCandidate.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-[#4a3728] mb-2">About</h4>
                  <p className="text-sm text-[#6b5444] leading-relaxed">
                    {selectedCandidate.bio}
                  </p>
                </div>
              )}
            </div>
          </Modal>
        )}
        </div>
      </main>
    </div>
  );
}
