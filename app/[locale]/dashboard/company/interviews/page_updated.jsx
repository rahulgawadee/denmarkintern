'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Video, MapPin, CheckCircle, XCircle, Users, Phone, RefreshCw, Eye, Send, Upload, Star, Award, GraduationCap, Mail, Briefcase } from 'lucide-react';

export default function InterviewsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const token = useSelector((state) => state.auth.token);

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Schedule Interview Form
  const [scheduleData, setScheduleData] = useState({
    meetingLink: '',
    password: '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });

  // Complete Interview Form
  const [completeData, setCompleteData] = useState({
    decision: 'pending', // accepted, rejected, pending
    rating: 0,
    feedback: '',
    offerLetterUrl: ''
  });

  useEffect(() => {
    if (token) {
      fetchInterviews();
    }
  }, [token]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching interviews...');
      
      const res = await fetch('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Interviews fetched:', data.interviews?.length || 0);
        setInterviews(data.interviews || []);
      } else {
        console.error('❌ Failed to fetch interviews:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCandidate = (interview) => {
    setSelectedCandidate(interview.candidateId);
    setSelectedInterview(interview);
    setViewModalOpen(true);
  };

  const handleOpenScheduleModal = (interview) => {
    setSelectedInterview(interview);
    setScheduleData({
      meetingLink: interview.meetingLink || '',
      password: interview.meetingPassword || '',
      date: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString().split('T')[0] : '',
      time: interview.scheduledDate ? new Date(interview.scheduledDate).toTimeString().slice(0, 5) : '',
      duration: interview.duration || 60,
      notes: interview.companyNotes || ''
    });
    setScheduleModalOpen(true);
  };

  const handleSendInterviewLink = async () => {
    if (!scheduleData.meetingLink || !scheduleData.date || !scheduleData.time) {
      alert(copy.fillRequired);
      return;
    }

    setActionLoading(true);
    try {
      const scheduledDate = new Date(`${scheduleData.date}T${scheduleData.time}`);

      const res = await fetch(`/api/interviews/${selectedInterview._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduledDate,
          duration: scheduleData.duration,
          mode: 'video',
          meetingLink: scheduleData.meetingLink,
          meetingPassword: scheduleData.password,
          companyNotes: scheduleData.notes,
          status: 'scheduled',
        }),
      });

      if (res.ok) {
        alert(copy.interviewScheduled);
        setScheduleModalOpen(false);
        fetchInterviews();
        setActiveTab('scheduled'); // Switch to Upcoming tab
      } else {
        alert(copy.error);
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert(copy.error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (interviewId) => {
    if (!confirm(copy.confirmReject)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'cancelled',
          outcome: {
            decision: 'rejected',
          }
        }),
      });

      if (res.ok) {
        alert(copy.candidateRejected);
        fetchInterviews();
      } else {
        alert(copy.error);
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      alert(copy.error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCompleteModal = (interview) => {
    setSelectedInterview(interview);
    setCompleteData({
      decision: interview.outcome?.decision || 'pending',
      rating: interview.outcome?.rating || 0,
      feedback: interview.outcome?.feedback || '',
      offerLetterUrl: interview.offerLetter?.url || ''
    });
    setCompleteModalOpen(true);
  };

  const handleMarkCompleted = async () => {
    if (completeData.decision === 'pending') {
      alert(copy.selectDecision);
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/interviews/${selectedInterview._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'completed',
          outcome: {
            decision: completeData.decision,
            rating: completeData.rating,
            feedback: completeData.feedback,
            decidedAt: new Date(),
          },
          ...(completeData.offerLetterUrl && {
            offerLetter: {
              url: completeData.offerLetterUrl,
              uploadedAt: new Date(),
            }
          })
        }),
      });

      if (res.ok) {
        alert(copy.interviewCompleted);
        setCompleteModalOpen(false);
        fetchInterviews();
        setActiveTab('completed'); // Switch to Completed tab
        
        // If accepted, could navigate to onboarding
        if (completeData.decision === 'accepted') {
          // TODO: Add to onboarding list
          console.log('✅ Candidate accepted - ready for onboarding');
        }
      } else {
        alert(copy.error);
      }
    } catch (error) {
      console.error('Error completing interview:', error);
      alert(copy.error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { label: copy.pending, color: 'bg-yellow-100 text-yellow-700' },
      scheduled: { label: copy.scheduled, color: 'bg-blue-100 text-blue-700' },
      completed: { label: copy.completed, color: 'bg-green-100 text-green-700' },
      cancelled: { label: copy.cancelled, color: 'bg-red-100 text-red-700' },
    };
    return <Badge className={configs[status]?.color || configs.pending.color}>
      {configs[status]?.label || status}
    </Badge>;
  };

  const getDecisionBadge = (decision) => {
    const configs = {
      accepted: { label: copy.accepted, color: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: copy.rejected, color: 'bg-red-100 text-red-700', icon: XCircle },
      pending: { label: copy.pendingDecision, color: 'bg-gray-100 text-gray-700', icon: Clock },
    };
    const config = configs[decision] || configs.pending;
    const Icon = config.icon;
    return <Badge className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copy = locale === 'da' ? {
    title: 'Interview styring',
    subtitle: 'Administrer og planlæg interviews med kandidater',
    refresh: 'Opdater',
    candidate: 'Kandidat',
    role: 'Rolle',
    date: 'Dato & Tid',
    status: 'Status',
    actions: 'Handlinger',
    decision: 'Beslutning',
    rating: 'Vurdering',
    // Tabs
    yetToSchedule: 'Afventer planlægning',
    upcomingInterviews: 'Kommende interviews',
    completedTab: 'Afsluttede',
    // Buttons
    view: 'Vis',
    sendInterviewLink: 'Send interview link',
    reject: 'Afvis',
    markCompleted: 'Marker som afsluttet',
    // Status
    pending: 'Afventer',
    scheduled: 'Planlagt',
    completed: 'Afsluttet',
    cancelled: 'Afvist',
    accepted: 'Accepteret',
    rejected: 'Afvist',
    pendingDecision: 'Afventer beslutning',
    // Empty states
    noPending: 'Ingen kandidater afventer planlægning',
    noPendingDesc: 'Send invitationer fra matches siden',
    noUpcoming: 'Ingen kommende interviews',
    noUpcomingDesc: 'Planlæg interviews fra afventer planlægning fanen',
    noCompleted: 'Ingen afsluttede interviews',
    noCompletedDesc: 'Afsluttede interviews vises her',
    // Schedule Modal
    scheduleInterview: 'Planlæg interview',
    meetingLink: 'Møde link',
    meetingPassword: 'Adgangskode (valgfri)',
    interviewDate: 'Interview dato',
    interviewTime: 'Interview tid',
    duration: 'Varighed (minutter)',
    additionalNotes: 'Yderligere noter',
    send: 'Send invitation',
    cancel: 'Annuller',
    fillRequired: 'Udfyld alle obligatoriske felter',
    // Complete Modal
    completeInterview: 'Afslut interview',
    selectDecision: 'Vælg en beslutning',
    acceptCandidate: 'Accepter kandidat',
    rejectCandidate: 'Afvis kandidat',
    rateCandidate: 'Vurder kandidat',
    feedback: 'Feedback',
    uploadOfferLetter: 'Upload tilbudsbrev (URL)',
    offerLetterUrl: 'Tilbudsbrev URL',
    complete: 'Afslut',
    // View Modal
    candidateProfile: 'Kandidat profil',
    interviewDetails: 'Interview detaljer',
    education: 'Uddannelse',
    university: 'Universitet',
    fieldOfStudy: 'Studieretning',
    skills: 'Færdigheder',
    location: 'Placering',
    email: 'E-mail',
    phone: 'Telefon',
    scheduledFor: 'Planlagt til',
    meetingInfo: 'Møde information',
    // Messages
    interviewScheduled: 'Interview planlagt',
    interviewCompleted: 'Interview afsluttet',
    candidateRejected: 'Kandidat afvist',
    confirmReject: 'Er du sikker på, at du vil afvise denne kandidat?',
    error: 'Der opstod en fejl',
    loading: 'Indlæser...',
  } : {
    title: 'Interview Management',
    subtitle: 'Manage and schedule interviews with candidates',
    refresh: 'Refresh',
    candidate: 'Candidate',
    role: 'Role',
    date: 'Date & Time',
    status: 'Status',
    actions: 'Actions',
    decision: 'Decision',
    rating: 'Rating',
    // Tabs
    yetToSchedule: 'Yet to Be Scheduled',
    upcomingInterviews: 'Upcoming Interviews',
    completedTab: 'Completed',
    // Buttons
    view: 'View',
    sendInterviewLink: 'Send Interview Link',
    reject: 'Reject',
    markCompleted: 'Mark Completed',
    // Status
    pending: 'Pending',
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    accepted: 'Accepted',
    rejected: 'Rejected',
    pendingDecision: 'Pending Decision',
    // Empty states
    noPending: 'No candidates pending scheduling',
    noPendingDesc: 'Send invitations from the matches page',
    noUpcoming: 'No upcoming interviews',
    noUpcomingDesc: 'Schedule interviews from the pending tab',
    noCompleted: 'No completed interviews',
    noCompletedDesc: 'Completed interviews will appear here',
    // Schedule Modal
    scheduleInterview: 'Schedule Interview',
    meetingLink: 'Meeting Link',
    meetingPassword: 'Password (optional)',
    interviewDate: 'Interview Date',
    interviewTime: 'Interview Time',
    duration: 'Duration (minutes)',
    additionalNotes: 'Additional Notes',
    send: 'Send Invitation',
    cancel: 'Cancel',
    fillRequired: 'Please fill all required fields',
    // Complete Modal
    completeInterview: 'Complete Interview',
    selectDecision: 'Please select a decision',
    acceptCandidate: 'Accept Candidate',
    rejectCandidate: 'Reject Candidate',
    rateCandidate: 'Rate Candidate',
    feedback: 'Feedback',
    uploadOfferLetter: 'Upload Offer Letter (URL)',
    offerLetterUrl: 'Offer Letter URL',
    complete: 'Complete',
    // View Modal
    candidateProfile: 'Candidate Profile',
    interviewDetails: 'Interview Details',
    education: 'Education',
    university: 'University',
    fieldOfStudy: 'Field of Study',
    skills: 'Skills',
    location: 'Location',
    email: 'Email',
    phone: 'Phone',
    scheduledFor: 'Scheduled for',
    meetingInfo: 'Meeting Information',
    // Messages
    interviewScheduled: 'Interview scheduled successfully',
    interviewCompleted: 'Interview completed successfully',
    candidateRejected: 'Candidate rejected',
    confirmReject: 'Are you sure you want to reject this candidate?',
    error: 'An error occurred',
    loading: 'Loading...',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">{copy.loading}</p>
        </div>
      </div>
    );
  }

  const pendingInterviews = interviews.filter(i => i.status === 'pending');
  const scheduledInterviews = interviews.filter(i => i.status === 'scheduled');
  const completedInterviews = interviews.filter(i => i.status === 'completed');

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{copy.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">{copy.title}</h1>
            <p className="text-zinc-600">{copy.subtitle}</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchInterviews}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {copy.refresh}
          </Button>
        </div>

        {/* Tabbed Interviews */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              {copy.yetToSchedule}
              {pendingInterviews.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                  {pendingInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              {copy.upcomingInterviews}
              {scheduledInterviews.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {scheduledInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              {copy.completedTab}
              {completedInterviews.length > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {completedInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Yet to Be Scheduled Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {copy.yetToSchedule}
                </CardTitle>
                <CardDescription>
                  {pendingInterviews.length === 0 
                    ? copy.noPendingDesc 
                    : `${pendingInterviews.length} candidate${pendingInterviews.length === 1 ? '' : 's'} waiting to be scheduled`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">{copy.noPending}</h3>
                    <p className="text-zinc-500">{copy.noPendingDesc}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{copy.candidate}</TableHead>
                          <TableHead>{copy.role}</TableHead>
                          <TableHead>{copy.status}</TableHead>
                          <TableHead className="text-right">{copy.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingInterviews.map((interview) => (
                          <TableRow key={interview._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-purple-100 text-purple-600">
                                    {interview.candidateId?.firstName?.charAt(0) || 'C'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-zinc-900">
                                    {interview.candidateId?.firstName} {interview.candidateId?.lastName}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {interview.candidateId?.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm">{interview.internshipId?.title || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(interview.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewCandidate(interview)}
                                  disabled={actionLoading}
                                  className="gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  {copy.view}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenScheduleModal(interview)}
                                  disabled={actionLoading}
                                  className="gap-1"
                                >
                                  <Send className="w-4 h-4" />
                                  {copy.sendInterviewLink}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(interview._id)}
                                  disabled={actionLoading}
                                  className="gap-1 text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                  {copy.reject}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Interviews Tab */}
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {copy.upcomingInterviews}
                </CardTitle>
                <CardDescription>
                  {scheduledInterviews.length === 0 
                    ? copy.noUpcomingDesc 
                    : `${scheduledInterviews.length} scheduled interview${scheduledInterviews.length === 1 ? '' : 's'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">{copy.noUpcoming}</h3>
                    <p className="text-zinc-500">{copy.noUpcomingDesc}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{copy.candidate}</TableHead>
                          <TableHead>{copy.role}</TableHead>
                          <TableHead>{copy.date}</TableHead>
                          <TableHead>{copy.status}</TableHead>
                          <TableHead className="text-right">{copy.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduledInterviews.map((interview) => (
                          <TableRow key={interview._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-purple-100 text-purple-600">
                                    {interview.candidateId?.firstName?.charAt(0) || 'C'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-zinc-900">
                                    {interview.candidateId?.firstName} {interview.candidateId?.lastName}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {interview.candidateId?.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm">{interview.internshipId?.title || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm">{formatDate(interview.scheduledDate)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(interview.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewCandidate(interview)}
                                  disabled={actionLoading}
                                  className="gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  {copy.view}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenCompleteModal(interview)}
                                  disabled={actionLoading}
                                  className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {copy.markCompleted}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Interviews Tab */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {copy.completedTab}
                </CardTitle>
                <CardDescription>
                  {completedInterviews.length === 0 
                    ? copy.noCompletedDesc 
                    : `${completedInterviews.length} completed interview${completedInterviews.length === 1 ? '' : 's'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">{copy.noCompleted}</h3>
                    <p className="text-zinc-500">{copy.noCompletedDesc}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{copy.candidate}</TableHead>
                          <TableHead>{copy.role}</TableHead>
                          <TableHead>{copy.date}</TableHead>
                          <TableHead>{copy.decision}</TableHead>
                          <TableHead>{copy.rating}</TableHead>
                          <TableHead className="text-right">{copy.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedInterviews.map((interview) => (
                          <TableRow key={interview._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-purple-100 text-purple-600">
                                    {interview.candidateId?.firstName?.charAt(0) || 'C'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-zinc-900">
                                    {interview.candidateId?.firstName} {interview.candidateId?.lastName}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {interview.candidateId?.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm">{interview.internshipId?.title || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-zinc-400" />
                                <span className="text-sm">{formatDate(interview.scheduledDate)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getDecisionBadge(interview.outcome?.decision)}
                            </TableCell>
                            <TableCell>
                              {interview.outcome?.rating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-medium">{interview.outcome.rating}/5</span>
                                </div>
                              ) : '—'}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewCandidate(interview)}
                                  disabled={actionLoading}
                                  className="gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  {copy.view}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Candidate Modal */}
        {viewModalOpen && selectedCandidate && (
          <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{copy.candidateProfile}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-200 text-blue-700 text-xl">
                      {selectedCandidate?.firstName?.charAt(0)}{selectedCandidate?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedCandidate?.firstName} {selectedCandidate?.lastName}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedCandidate?.email}
                      </span>
                      {selectedCandidate?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedCandidate?.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    {copy.education}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500">{copy.university}</p>
                      <p className="text-sm font-medium">{selectedCandidate?.university || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">{copy.fieldOfStudy}</p>
                      <p className="text-sm font-medium">{selectedCandidate?.fieldOfStudy || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedCandidate?.skills?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 mb-2">{copy.skills}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interview Details */}
                {selectedInterview?.scheduledDate && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      {copy.interviewDetails}
                    </h4>
                    <div className="space-y-2 bg-zinc-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">{copy.scheduledFor}:</span>
                        <span className="text-sm font-medium">{formatDate(selectedInterview.scheduledDate)}</span>
                      </div>
                      {selectedInterview.meetingLink && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-600">{copy.meetingLink}:</span>
                          <a 
                            href={selectedInterview.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                          </a>
                        </div>
                      )}
                      {selectedInterview.meetingPassword && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-600">{copy.meetingPassword}:</span>
                          <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                            {selectedInterview.meetingPassword}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                  {copy.cancel}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Schedule Interview Modal */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{copy.scheduleInterview}</DialogTitle>
              <DialogDescription>
                Schedule interview with {selectedInterview?.candidateId?.firstName} {selectedInterview?.candidateId?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{copy.meetingLink} *</Label>
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={scheduleData.meetingLink}
                  onChange={(e) => setScheduleData({...scheduleData, meetingLink: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">{copy.meetingPassword}</Label>
                <Input
                  type="text"
                  placeholder="Optional password"
                  value={scheduleData.password}
                  onChange={(e) => setScheduleData({...scheduleData, password: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{copy.interviewDate} *</Label>
                  <Input
                    type="date"
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">{copy.interviewTime} *</Label>
                  <Input
                    type="time"
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">{copy.duration}</Label>
                <Input
                  type="number"
                  value={scheduleData.duration}
                  onChange={(e) => setScheduleData({...scheduleData, duration: parseInt(e.target.value)})}
                  min="15"
                  step="15"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">{copy.additionalNotes}</Label>
                <Textarea
                  rows={3}
                  placeholder="Any additional information for the candidate..."
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleModalOpen(false)} disabled={actionLoading}>
                {copy.cancel}
              </Button>
              <Button onClick={handleSendInterviewLink} disabled={actionLoading}>
                {actionLoading ? copy.loading : copy.send}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Complete Interview Modal */}
        <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{copy.completeInterview}</DialogTitle>
              <DialogDescription>
                Rate and provide feedback for {selectedInterview?.candidateId?.firstName} {selectedInterview?.candidateId?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">{copy.selectDecision} *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={completeData.decision === 'accepted' ? 'default' : 'outline'}
                    onClick={() => setCompleteData({...completeData, decision: 'accepted'})}
                    className="h-20 flex flex-col gap-2"
                  >
                    <CheckCircle className="w-6 h-6" />
                    {copy.acceptCandidate}
                  </Button>
                  <Button
                    type="button"
                    variant={completeData.decision === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setCompleteData({...completeData, decision: 'rejected'})}
                    className="h-20 flex flex-col gap-2"
                  >
                    <XCircle className="w-6 h-6" />
                    {copy.rejectCandidate}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">{copy.rateCandidate}</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setCompleteData({...completeData, rating})}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          rating <= completeData.rating 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">{copy.feedback}</Label>
                <Textarea
                  rows={4}
                  placeholder="Provide detailed feedback about the candidate..."
                  value={completeData.feedback}
                  onChange={(e) => setCompleteData({...completeData, feedback: e.target.value})}
                  className="mt-1"
                />
              </div>

              {completeData.decision === 'accepted' && (
                <div>
                  <Label className="text-sm font-medium">{copy.offerLetterUrl}</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/offer-letter.pdf"
                    value={completeData.offerLetterUrl}
                    onChange={(e) => setCompleteData({...completeData, offerLetterUrl: e.target.value})}
                    className="mt-1"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Upload offer letter to cloud storage and paste the URL here
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCompleteModalOpen(false)} disabled={actionLoading}>
                {copy.cancel}
              </Button>
              <Button onClick={handleMarkCompleted} disabled={actionLoading}>
                {actionLoading ? copy.loading : copy.complete}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
