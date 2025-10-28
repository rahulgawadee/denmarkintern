'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { ArrowLeft, Mail, MapPin, Clock, CheckCircle, XCircle, Trash2, Loader2, Building, Briefcase, Eye, DollarSign, AlertCircle, ChevronRight } from 'lucide-react';

export default function CandidateBrowseInternshipsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const token = useSelector((state) => state.auth.token);

  const [invitations, setInvitations] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invitations');
  
  const [respondModal, setRespondModal] = useState({ open: false, invitation: null, action: null });
  const [candidateResponse, setCandidateResponse] = useState('');
  const [responding, setResponding] = useState(false);
  
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [viewModal, setViewModal] = useState(false);

  useEffect(() => {
    fetchInvitations();
    fetchInternships();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/invitations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations?.filter(inv => inv.status === 'pending') || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/internships', {
        headers: { 'Authorization': `Bearer ${token}` },
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
          alert(copy.acceptSuccess);
          // Redirect to interviews page to see the scheduled interview
          setTimeout(() => {
            router.push(`/${locale}/dashboard/candidate/interviews`);
          }, 1500);
        } else {
          alert(copy.rejectSuccess);
        }
        
        setRespondModal({ open: false, invitation: null, action: null });
        setCandidateResponse('');
        fetchInvitations();
      } else {
        const error = await res.json();
        alert(error.error || copy.respondFailed);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert(copy.respondFailed);
    } finally {
      setResponding(false);
    }
  };

  const handleIgnoreInvitation = async (invitationId) => {
    if (!confirm(copy.confirmIgnore)) return;

    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        alert(copy.ignoreSuccess);
        fetchInvitations();
      }
    } catch (error) {
      console.error('Error ignoring invitation:', error);
    }
  };

  const copy = locale === 'da' ? {
    title: 'Gennemse praktikopslag',
    subtitle: 'Se dine invitationer og tilgængelige praktikopslag',
    back: 'Tilbage til dashboard',
    invitationsTab: 'Mine Invitationer',
    browseTab: 'Gennemse Praktikker',
    company: 'Virksomhed',
    role: 'Rolle',
    location: 'Placering',
    duration: 'Varighed',
    accept: 'Accepter',
    reject: 'Afvis',
    ignore: 'Ignorer',
    viewDetails: 'Se Detaljer',
    noInvitations: 'Ingen invitationer',
    noInvitationsDesc: 'Du har ingen ventende invitationer endnu. Virksomheder vil invitere dig baseret på din profil.',
    noInternships: 'Ingen praktikopslag',
    noInternshipsDesc: 'Der er ingen praktikopslag tilgængelige lige nu.',
    respondModalTitle: 'Besvar invitation',
    message: 'Besked fra virksomheden',
    yourResponse: 'Din besked (valgfri)',
    responsePlaceholder: 'Skriv en besked til virksomheden...',
    send: 'Send',
    cancel: 'Annuller',
    acceptSuccess: '✅ Invitation accepteret! Du kan nu se den i "Mine ansøgninger" og "Samtaler". Omdirigerer...',
    rejectSuccess: 'Invitation afvist',
    respondFailed: 'Kunne ikke besvare invitation',
    confirmIgnore: 'Er du sikker på at du vil ignorere denne invitation?',
    ignoreSuccess: 'Invitation ignoreret',
    sentOn: 'Sendt',
    expiresOn: 'Udløber',
    salary: 'Løn',
    requirements: 'Krav',
    description: 'Beskrivelse',
    responsibilities: 'Ansvarsområder',
    viewOnlyNote: 'Du kan ikke ansøge direkte. Optimér din profil for at øge chancerne for at modtage invitationer.',
    profileTip: '💡 Tip: Opdater din profil med relevante færdigheder for at matche disse praktikker',
  } : {
    title: 'Browse Internships',
    subtitle: 'View your invitations and available internships',
    back: 'Back to dashboard',
    invitationsTab: 'My Invitations',
    browseTab: 'Browse Internships',
    company: 'Company',
    role: 'Role',
    location: 'Location',
    duration: 'Duration',
    accept: 'Accept',
    reject: 'Reject',
    ignore: 'Ignore',
    viewDetails: 'View Details',
    noInvitations: 'No invitations',
    noInvitationsDesc: 'You have no pending invitations yet. Companies will invite you based on your profile.',
    noInternships: 'No internships',
    noInternshipsDesc: 'There are no internships available right now.',
    respondModalTitle: 'Respond to Invitation',
    message: 'Message from company',
    yourResponse: 'Your message (optional)',
    responsePlaceholder: 'Write a message to the company...',
    send: 'Send',
    cancel: 'Cancel',
    acceptSuccess: '✅ Invitation accepted! You can now see it in "My Applications" and "Interviews". Redirecting...',
    rejectSuccess: 'Invitation rejected',
    respondFailed: 'Failed to respond to invitation',
    confirmIgnore: 'Are you sure you want to ignore this invitation?',
    ignoreSuccess: 'Invitation ignored',
    sentOn: 'Sent On',
    expiresOn: 'Expires On',
    salary: 'Salary',
    requirements: 'Requirements',
    description: 'Description',
    responsibilities: 'Responsibilities',
    viewOnlyNote: 'You cannot apply directly. Optimize your profile to increase chances of receiving invitations.',
    profileTip: '💡 Tip: Update your profile with relevant skills to match these internships',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#fdf5e6] to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#fa8072] mx-auto mb-4" />
          <p className="text-[#6b5444]">{locale === 'da' ? 'Indlæser...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#ffe4b5] px-4 bg-white sticky top-0 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-[#ffe4b5]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href={`/${locale}/dashboard/candidate`}
                className="text-[#6b5444] hover:text-[#fa8072]"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#4a3728] font-semibold">{copy.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-linear-to-b from-[#fdf5e6] to-white overflow-auto">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#ffe4b5] shadow-sm">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-[#4a3728] to-[#6b5444] bg-clip-text text-transparent">
              {copy.title}
            </h1>
            <p className="text-[#6b5444] mt-2 text-sm lg:text-base">{copy.subtitle}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#ffefd5] border border-[#ffe4b5] p-1 h-auto w-full sm:w-auto grid grid-cols-2 gap-1">
              <TabsTrigger 
                value="invitations" 
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-medium px-3 sm:px-4 py-2.5 whitespace-nowrap"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{copy.invitationsTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Invit.' : 'Invit.'}</span>
                {invitations.length > 0 && (
                  <Badge className="ml-1 sm:ml-2 bg-white text-[#fa8072] data-[state=active]:bg-white data-[state=active]:text-[#fa8072] px-1.5 py-0 text-xs">
                    {invitations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="browse" 
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-medium px-3 sm:px-4 py-2.5 whitespace-nowrap"
              >
                <Briefcase className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{copy.browseTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Gennemse' : 'Browse'}</span>
              </TabsTrigger>
            </TabsList>

          {/* Tab 1: My Invitations */}
          <TabsContent value="invitations" className="mt-6">
            <Card className="border-[#ffe4b5] shadow-md">
              <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
                <CardTitle className="flex items-center gap-2 text-[#4a3728]">
                  <Mail className="h-5 w-5 text-[#fa8072]" />
                  {copy.invitationsTab}
                </CardTitle>
                <CardDescription className="text-[#6b5444]">
                  {invitations.length === 0 ? copy.noInvitationsDesc : `${invitations.length} pending invitation${invitations.length === 1 ? '' : 's'}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {invitations.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#ffa07a] to-[#fa8072] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                      <Mail className="relative mx-auto h-20 w-20 text-[#fa8072]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#4a3728] mb-3">{copy.noInvitations}</h3>
                    <p className="text-sm text-[#6b5444] max-w-md mx-auto">{copy.noInvitationsDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {invitations.map((invitation, index) => (
                      <div 
                        key={invitation._id} 
                        className="group relative border-2 border-[#ffe4b5] rounded-xl p-4 sm:p-6 hover:shadow-2xl hover:border-[#fa8072] transition-all duration-300 bg-white overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Decorative gradient on hover */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffa07a]/10 to-[#fa8072]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative z-10">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5">
                            <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                              <div className="relative">
                                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 ring-2 ring-[#ffe4b5] group-hover:ring-[#fa8072] transition-all duration-300">
                                  <AvatarFallback className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] text-white text-lg">
                                    <Building className="h-6 w-6 sm:h-7 sm:w-7" />
                                  </AvatarFallback>
                                </Avatar>
                                {/* New badge indicator */}
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-xl font-bold text-[#4a3728] mb-1 line-clamp-2 group-hover:text-[#fa8072] transition-colors">
                                  {invitation.internshipId?.title}
                                </h3>
                                <p className="text-sm sm:text-base text-[#6b5444] font-medium mb-3 truncate">{invitation.companyId?.companyName}</p>
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#8b7355]">
                                  <span className="flex items-center gap-1.5 bg-[#fdf5e6] px-2.5 py-1 rounded-full">
                                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#fa8072]" />
                                    <span className="font-medium truncate max-w-[150px] sm:max-w-none">
                                      {typeof invitation.internshipId?.location === 'string' 
                                        ? invitation.internshipId.location 
                                        : invitation.internshipId?.location?.city || invitation.internshipId?.location?.address || 'N/A'}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1.5 bg-[#fdf5e6] px-2.5 py-1 rounded-full">
                                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#fa8072]" />
                                    <span className="font-medium">{invitation.internshipId?.duration} {locale === 'da' ? 'måneder' : 'months'}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-linear-to-r from-blue-500 to-blue-600 text-white w-fit px-4 py-1.5 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                              {locale === 'da' ? 'Invitation' : 'Invitation'}
                            </Badge>
                          </div>

                          {invitation.message && (
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-500 p-4 sm:p-5 mb-5 rounded-lg shadow-sm">
                              <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {copy.message}:
                              </p>
                              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed break-words">{invitation.message}</p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-[#8b7355] mb-5 pb-5 border-b-2 border-dashed border-[#ffe4b5]">
                            <span className="flex items-center gap-2 bg-[#fdf5e6] px-3 py-1.5 rounded-lg">
                              <Clock className="h-3.5 w-3.5 text-[#6b5444]" />
                              <span><strong>{copy.sentOn}:</strong> {new Date(invitation.sentAt).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg font-medium">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span><strong>{copy.expiresOn}:</strong> {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                            <Button
                              onClick={() => setRespondModal({ open: true, invitation, action: 'accepted' })}
                              className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {copy.accept}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setRespondModal({ open: true, invitation, action: 'rejected' })}
                              className="border-2 border-[#ffe4b5] hover:bg-gradient-to-r hover:from-[#ffefd5] hover:to-[#ffe4b5] hover:border-[#fa8072] text-[#4a3728] font-semibold shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {copy.reject}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleIgnoreInvitation(invitation._id)}
                              className="hover:bg-red-50 hover:text-red-600 font-medium border border-transparent hover:border-red-200 transition-all duration-200"
                              title={copy.ignore}
                            >
                              <Trash2 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">{copy.ignore}</span>
                              <span className="sm:hidden">{copy.ignore}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Browse All Internships (VIEW ONLY) */}
          <TabsContent value="browse" className="mt-6">
            <Card className="border-[#ffe4b5] shadow-md">
              <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
                <CardTitle className="flex items-center gap-2 text-[#4a3728]">
                  <Briefcase className="h-5 w-5 text-[#fa8072]" />
                  {copy.browseTab}
                </CardTitle>
                <CardDescription className="text-[#6b5444]">
                  {internships.length === 0 ? copy.noInternshipsDesc : `${internships.length} internship${internships.length === 1 ? '' : 's'} available`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Profile Optimization Tip */}
                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-amber-100 rounded-full p-2 shrink-0">
                      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-amber-900 mb-2">{copy.profileTip}</p>
                      <p className="text-xs sm:text-sm text-amber-700 leading-relaxed">{copy.viewOnlyNote}</p>
                    </div>
                  </div>
                </div>

                {internships.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#ffa07a] to-[#fa8072] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                      <Briefcase className="relative mx-auto h-20 w-20 text-[#fa8072]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#4a3728] mb-3">{copy.noInternships}</h3>
                    <p className="text-sm text-[#6b5444] max-w-md mx-auto">{copy.noInternshipsDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {internships.map((internship, index) => (
                      <div 
                        key={internship._id} 
                        className="group relative border-2 border-[#ffe4b5] rounded-xl p-5 sm:p-6 hover:shadow-2xl hover:border-[#fa8072] transition-all duration-300 bg-white overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Decorative corner accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#ffa07a]/10 to-[#fa8072]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start space-x-3 sm:space-x-4 mb-5">
                            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 ring-2 ring-[#ffe4b5] group-hover:ring-[#fa8072] transition-all duration-300 shadow-md">
                              <AvatarFallback className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] text-white text-lg">
                                <Building className="h-6 w-6 sm:h-7 sm:w-7" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-[#4a3728] line-clamp-2 mb-1 group-hover:text-[#fa8072] transition-colors leading-tight">
                                {internship.title}
                              </h3>
                              <p className="text-sm sm:text-base text-[#6b5444] font-medium truncate">{internship.companyId?.companyName}</p>
                            </div>
                          </div>

                          <div className="space-y-2.5 mb-5">
                            <div className="flex items-center text-xs sm:text-sm text-[#6b5444] bg-[#fdf5e6] px-3 py-2 rounded-lg">
                              <MapPin className="h-4 w-4 mr-2 text-[#fa8072] shrink-0" />
                              <span className="font-medium truncate">
                                {typeof internship.location === 'string' 
                                  ? internship.location 
                                  : internship.location?.city || internship.location?.address || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-[#6b5444] bg-[#fdf5e6] px-3 py-2 rounded-lg">
                              <Clock className="h-4 w-4 mr-2 text-[#fa8072] shrink-0" />
                              <span className="font-medium">{internship.duration} {locale === 'da' ? 'måneder' : 'months'}</span>
                            </div>
                            {internship.stipend && (
                              <div className="flex items-center text-xs sm:text-sm text-[#6b5444] bg-[#fdf5e6] px-3 py-2 rounded-lg">
                                <DollarSign className="h-4 w-4 mr-2 text-[#fa8072] shrink-0" />
                                <span className="font-medium truncate">
                                  {typeof internship.stipend === 'string' 
                                    ? internship.stipend 
                                    : internship.stipend?.amount 
                                      ? `${internship.stipend.amount} DKK/${locale === 'da' ? 'md' : 'month'}` 
                                      : 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>

                          {internship.requirements && internship.requirements.length > 0 && (
                            <div className="mb-5 pb-5 border-b-2 border-dashed border-[#ffe4b5]">
                              <p className="text-xs sm:text-sm font-semibold text-[#6b5444] mb-2.5">{copy.requirements}:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {internship.requirements.slice(0, 3).map((req, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className="text-xs border-[#ffa07a] text-[#4a3728] bg-[#fdf5e6] hover:bg-[#ffefd5] transition-colors font-medium"
                                  >
                                    {req}
                                  </Badge>
                                ))}
                                {internship.requirements.length > 3 && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs border-[#fa8072] text-[#fa8072] bg-[#fdf5e6] font-semibold"
                                  >
                                    +{internship.requirements.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            className="w-full border-2 border-[#ffe4b5] hover:bg-linear-to-r hover:from-[#ffa07a] hover:to-[#fa8072] hover:text-white hover:border-transparent transition-all duration-300 font-semibold shadow-sm hover:shadow-xl transform hover:scale-105 group/btn"
                            onClick={() => {
                              setSelectedInternship(internship);
                              setViewModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2 group-hover/btn:animate-pulse" />
                            {copy.viewDetails}
                            <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </main>

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
                  <span className="text-green-900">✅ {locale === 'da' ? 'Du accepterer denne invitation' : 'You are accepting this invitation'}</span>
                ) : (
                  <span className="text-red-900">❌ {locale === 'da' ? 'Du afviser denne invitation' : 'You are rejecting this invitation'}</span>
                )}
              </p>
              <p className="text-sm text-[#4a3728] mt-2">
                <strong>{copy.role}:</strong> {respondModal.invitation?.internshipId?.title}
              </p>
              <p className="text-sm text-[#6b5444]">
                <strong>{copy.company}:</strong> {respondModal.invitation?.companyId?.companyName}
              </p>
            </div>

            <div>
              <Label className="text-[#4a3728]">{copy.yourResponse}</Label>
              <Textarea
                value={candidateResponse}
                onChange={(e) => setCandidateResponse(e.target.value)}
                placeholder={copy.responsePlaceholder}
                rows={4}
                className="mt-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setRespondModal({ open: false, invitation: null, action: null })}
              disabled={responding}
              className="border-2 border-[#ffe4b5] hover:bg-[#ffefd5] hover:border-[#fa8072] w-full sm:w-auto font-semibold transition-all"
            >
              {copy.cancel}
            </Button>
            <Button
              onClick={handleRespondToInvitation}
              disabled={responding}
              className={`w-full sm:w-auto font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                respondModal.action === 'accepted' 
                  ? 'bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                  : 'bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              } text-white`}
            >
              {responding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {locale === 'da' ? 'Sender...' : 'Sending...'}
                </>
              ) : (
                <>
                  {respondModal.action === 'accepted' ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  {copy.send}
                </>
              )}
            </Button>
          </div>
        </Modal>

        {/* View Internship Details Modal */}
        <Modal
          isOpen={viewModal}
          onClose={() => {
            setViewModal(false);
            setSelectedInternship(null);
          }}
          title={selectedInternship?.title || copy.viewDetails}
          size="lg"
        >
          {selectedInternship && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="flex items-center space-x-4 bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] p-4 rounded-xl border-2 border-[#ffe4b5]">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-white shadow-lg">
                  <AvatarFallback className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] text-white">
                    <Building className="h-7 w-7 sm:h-8 sm:w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-[#4a3728] truncate">{selectedInternship.companyId?.companyName}</h3>
                  <p className="text-sm sm:text-base text-[#6b5444] font-medium truncate">{selectedInternship.companyId?.industry}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-linear-to-br from-[#fdf5e6] to-[#ffefd5] rounded-xl p-4 border border-[#ffe4b5] hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-[#fa8072]" />
                    <p className="text-xs sm:text-sm font-semibold text-[#6b5444]">{copy.location}</p>
                  </div>
                  <p className="text-sm sm:text-base text-[#4a3728] font-bold truncate">
                    {typeof selectedInternship.location === 'string' 
                      ? selectedInternship.location 
                      : selectedInternship.location?.city && selectedInternship.location?.address
                        ? `${selectedInternship.location.city}, ${selectedInternship.location.address}`
                        : selectedInternship.location?.city || selectedInternship.location?.address || 'N/A'}
                  </p>
                </div>
                <div className="bg-linear-to-br from-[#fdf5e6] to-[#ffefd5] rounded-xl p-4 border border-[#ffe4b5] hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[#fa8072]" />
                    <p className="text-xs sm:text-sm font-semibold text-[#6b5444]">{copy.duration}</p>
                  </div>
                  <p className="text-sm sm:text-base text-[#4a3728] font-bold">{selectedInternship.duration} {locale === 'da' ? 'måneder' : 'months'}</p>
                </div>
                {selectedInternship.stipend && (
                  <div className="bg-linear-to-br from-[#fdf5e6] to-[#ffefd5] rounded-xl p-4 border border-[#ffe4b5] hover:shadow-md transition-shadow sm:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-[#fa8072]" />
                      <p className="text-xs sm:text-sm font-semibold text-[#6b5444]">{copy.salary}</p>
                    </div>
                    <p className="text-sm sm:text-base text-[#4a3728] font-bold">
                      {typeof selectedInternship.stipend === 'string' 
                        ? selectedInternship.stipend 
                        : selectedInternship.stipend?.amount 
                          ? `${selectedInternship.stipend.amount} DKK/${locale === 'da' ? 'md' : 'month'}` 
                          : 'N/A'}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-medium text-[#6b5444] mb-2">{copy.description}</p>
                <p className="text-[#4a3728] whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{selectedInternship.description}</p>
              </div>

              {/* Requirements */}
              {selectedInternship.requirements && selectedInternship.requirements.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[#6b5444] mb-2">{copy.requirements}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInternship.requirements.map((req, idx) => (
                      <Badge key={idx} variant="outline" className="border-[#ffe4b5] text-[#6b5444]">{req}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {selectedInternship.responsibilities && (
                <div>
                  <p className="text-sm font-medium text-[#6b5444] mb-2">{copy.responsibilities}</p>
                  <p className="text-[#4a3728] whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{selectedInternship.responsibilities}</p>
                </div>
              )}

              {/* Profile Tip */}
              <div className="pt-4 border-t border-[#ffe4b5] bg-blue-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-blue-900 mb-1">💡 {copy.profileTip}</p>
                <p className="text-xs text-blue-700">{copy.viewOnlyNote}</p>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-[#ffe4b5]">
                <Button 
                  onClick={() => setViewModal(false)} 
                  className="w-full bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#ffa07a] text-white"
                >
                  {locale === 'da' ? 'Luk' : 'Close'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </>
    );
  }
