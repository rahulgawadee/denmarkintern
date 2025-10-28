'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Video, MapPin, CheckCircle, XCircle, Edit, Users, Phone, RefreshCw, Mail, GraduationCap, FileText, ExternalLink, Award, Sparkles, Building2, ChevronRight } from 'lucide-react';

export default function InterviewsPage() {
  const params = useParams();
  const locale = params?.locale || 'da';
  const token = useSelector((state) => state.auth.token);

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [candidateModal, setCandidateModal] = useState({ open: false, interview: null });
  const [completeModal, setCompleteModal] = useState({
    open: false,
    interview: null,
    decision: 'accepted',
    feedback: '',
    joiningDate: '',
    joiningMessage: '',
    offerLetter: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, scheduled, completed

  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    duration: 60,
    mode: 'video',
    location: '',
    meetingLink: '',
    meetingPassword: '',
    notes: ''
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
      console.log('   Token exists:', !!token);

      const res = await fetch('/api/interviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('   Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Interviews fetched:', data.interviews?.length || 0);
        setInterviews(data.interviews || []);
      } else {
        const errorData = await res.json();
        console.error('❌ Failed to fetch interviews:', res.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = (interview) => {
    setSelectedInterview(interview);
    if (interview.scheduledDate) {
      const date = new Date(interview.scheduledDate);
      setScheduleData({
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().slice(0, 5),
        duration: interview.duration || 60,
        mode: interview.mode || 'video',
        location: interview.location?.address || '',
        meetingLink: interview.meetingLink || '',
        meetingPassword: interview.meetingPassword || '',
        notes: interview.companyNotes || ''
      });
    } else {
      setScheduleData({
        date: '',
        time: '',
        duration: 60,
        mode: 'video',
        location: '',
        meetingLink: '',
        meetingPassword: '',
        notes: ''
      });
    }
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleData.date || !scheduleData.time) {
      alert(locale === 'da' ? 'Vælg dato og tid' : 'Please select date and time');
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
          mode: scheduleData.mode,
          location: scheduleData.mode === 'onsite' ? { address: scheduleData.location } : undefined,
          meetingLink: scheduleData.mode === 'video' ? scheduleData.meetingLink : undefined,
          meetingPassword: scheduleData.mode === 'video' ? scheduleData.meetingPassword : undefined,
          companyNotes: scheduleData.notes,
          status: 'scheduled',
        }),
      });

      if (res.ok) {
        alert(selectedInterview.scheduledDate ? copy.interviewRescheduled : copy.interviewScheduled);
        setScheduleModalOpen(false);
        fetchInterviews();
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

  const openCandidateProfile = (interview) => {
    setCandidateModal({ open: true, interview });
  };

  const handleOpenCompleteModal = (interview) => {
    setCompleteModal({
      open: true,
      interview,
      decision: 'accepted',
      feedback: '',
      joiningDate: '',
      joiningMessage: '',
      offerLetter: null,
    });
  };

  const handleCompleteModalClose = () => {
    setCompleteModal({
      open: false,
      interview: null,
      decision: 'accepted',
      feedback: '',
      joiningDate: '',
      joiningMessage: '',
      offerLetter: null,
    });
  };

  const handleCompleteSubmit = async () => {
    if (!completeModal.interview) return;

    if (completeModal.decision === 'accepted' && !completeModal.joiningDate) {
      alert(locale === 'da' ? 'Vælg en startdato' : 'Please select a joining date');
      return;
    }

    const formData = new FormData();
    formData.append('decision', completeModal.decision);
    if (completeModal.feedback) formData.append('feedback', completeModal.feedback);
    if (completeModal.joiningDate) formData.append('joiningDate', completeModal.joiningDate);
    if (completeModal.joiningMessage) formData.append('joiningMessage', completeModal.joiningMessage);
    if (completeModal.offerLetter) formData.append('offerLetter', completeModal.offerLetter);

    setActionLoading(true);
    try {
      const res = await fetch(`/api/interviews/${completeModal.interview._id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert(completeModal.decision === 'accepted' ? copy.offerSent : copy.candidateRejected);
        handleCompleteModalClose();
        fetchInterviews();
      } else {
        const data = await res.json();
        alert(data.error || copy.error);
      }
    } catch (error) {
      console.error('Error completing interview:', error);
      alert(copy.error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (interviewId) => {
    if (!confirm(locale === 'da' ? 
      'Er du sikker på, at du vil afvise denne kandidat?' : 
      'Are you sure you want to reject this candidate?'
    )) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert(copy.candidateRejected);
        fetchInterviews();
      } else {
        alert(copy.error);
      }
    } catch (error) {
      console.error('Error rejecting interview:', error);
      alert(copy.error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: copy.pending, color: 'bg-linear-to-r from-[#fbbf24] to-[#f59e0b] text-white border-0' },
      scheduled: { label: copy.scheduled, color: 'bg-linear-to-r from-[#3b82f6] to-[#2563eb] text-white border-0' },
      completed: { label: copy.completed, color: 'bg-linear-to-r from-[#10b981] to-[#059669] text-white border-0' },
      rejected: { label: copy.rejected, color: 'bg-linear-to-r from-[#ef4444] to-[#dc2626] text-white border-0' },
      rescheduled: { label: copy.rescheduled, color: 'bg-linear-to-r from-[#a855f7] to-[#9333ea] text-white border-0' },
      cancelled: { label: copy.cancelled, color: 'bg-linear-to-r from-[#9ca3af] to-[#6b7280] text-white border-0' },
    };
    return configs[status] || configs.pending;
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
    date: 'Dato',
    status: 'Status',
    actions: 'Handlinger',
  viewProfile: 'Se profil',
  sendLink: 'Send link',
  schedule: 'Planlæg',
    reschedule: 'Omplanlæg',
    markCompleted: 'Marker som afsluttet',
    reject: 'Afvis kandidat',
    noInterviews: 'Ingen interviews endnu',
    noInterviewsDesc: 'Start med at anmode om interviews fra matches siden',
    // Tabs
    yetToSchedule: 'Afventer planlægning',
    scheduledTab: 'Planlagt',
    completedTab: 'Afsluttet',
    // Status
    pending: 'Afventer',
    scheduled: 'Planlagt',
    completed: 'Afsluttet',
    cancelled: 'Annulleret',
    rejected: 'Afvist',
    rescheduled: 'Omplanlagt',
    // Schedule Modal
    scheduleInterview: 'Planlæg interview',
    rescheduleInterview: 'Omplanlæg interview',
    selectDateTime: 'Vælg dato og tid',
    interviewDate: 'Interview dato',
    interviewTime: 'Interview tid',
    duration: 'Varighed (minutter)',
    interviewMode: 'Interview type',
    video: 'Video',
    onsite: 'På stedet',
    phone: 'Telefon',
    meetingLink: 'Møde link',
    meetingPassword: 'Møde kode',
    locationAddress: 'Placering/Adresse',
    additionalNotes: 'Yderligere noter',
    save: 'Gem',
    cancel: 'Annuller',
    saving: 'Gemmer...',
    loading: 'Indlæser...',
    // Success/Error
    interviewScheduled: 'Interview planlagt',
    interviewRescheduled: 'Interview omplanlagt',
    interviewCompleted: 'Interview markeret som afsluttet',
    candidateRejected: 'Kandidat afvist',
    offerSent: 'Tilbud sendt til kandidaten',
    error: 'Der opstod en fejl',
  } : {
    title: 'Interview Management',
    subtitle: 'Manage and schedule interviews with candidates',
    refresh: 'Refresh',
    candidate: 'Candidate',
    role: 'Role',
    date: 'Date',
    status: 'Status',
    actions: 'Actions',
    viewProfile: 'View',
    sendLink: 'Send Link',
    schedule: 'Schedule',
    reschedule: 'Reschedule',
    markCompleted: 'Mark Completed',
    reject: 'Reject Candidate',
    noInterviews: 'No interviews yet',
    noInterviewsDesc: 'Start by requesting interviews from the matches page',
    // Tabs
    yetToSchedule: 'Yet to Be Scheduled',
    scheduledTab: 'Scheduled',
    completedTab: 'Completed',
    // Status
    pending: 'Pending',
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    rescheduled: 'Rescheduled',
    // Schedule Modal
    scheduleInterview: 'Schedule Interview',
    rescheduleInterview: 'Reschedule Interview',
    selectDateTime: 'Select Date & Time',
    interviewDate: 'Interview Date',
    interviewTime: 'Interview Time',
    duration: 'Duration (minutes)',
    interviewMode: 'Interview Mode',
    video: 'Video',
    onsite: 'On-site',
    phone: 'Phone',
    meetingLink: 'Meeting Link',
    meetingPassword: 'Meeting Password',
    locationAddress: 'Location/Address',
    additionalNotes: 'Additional Notes',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    loading: 'Loading...',
    // Success/Error
    interviewScheduled: 'Interview scheduled successfully',
    interviewRescheduled: 'Interview rescheduled successfully',
    interviewCompleted: 'Interview marked as completed',
    candidateRejected: 'Candidate rejected',
    offerSent: 'Offer letter sent to candidate',
    error: 'An error occurred',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#fdf5e6] to-white">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#fa8072] border-r-transparent"></div>
          <p className="mt-4 text-[#6b5444] font-medium">{copy.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with Breadcrumb - No Border */}
      <header className="flex h-16 shrink-0 items-center gap-2 bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] px-4 sticky top-0 z-10">
        <SidebarTrigger className="-ml-1 text-[#4a3728]" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-[#ffe4b5]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#4a3728] font-semibold">{copy.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="w-full h-full bg-linear-to-b from-[#fdf5e6] via-white to-[#ffefd5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-linear-to-br from-[#ffa07a] to-[#fa8072] flex items-center justify-center shadow-md">
                  <CalendarIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4a3728]">{copy.title}</h1>
                  <p className="text-sm sm:text-base text-[#6b5444] mt-1">{copy.subtitle}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={fetchInterviews}
                  disabled={loading}
                  className="border-[#ffe4b5] text-[#4a3728] hover:bg-[#ffefd5] hover:text-[#fa8072] hover:border-[#fa8072] transition-all duration-200 gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{copy.refresh}</span>
                </Button>
              </div>
            </div>

        {/* Tabbed Interviews */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 h-12 bg-white border-2 border-[#ffe4b5] rounded-xl p-1">
            <TabsTrigger 
              value="pending"
              className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-[#4a3728] font-medium"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">{copy.yetToSchedule}</span>
              <span className="sm:hidden">{locale === 'da' ? 'Afventer' : 'Pending'}</span>
              {interviews.filter(i => i.status === 'pending').length > 0 && (
                <Badge className="ml-1 bg-linear-to-r from-[#fbbf24] to-[#f59e0b] text-white border-0 text-xs">
                  {interviews.filter(i => i.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="scheduled"
              className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-[#4a3728] font-medium"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{copy.scheduledTab}</span>
              <span className="sm:hidden">{locale === 'da' ? 'Planlagt' : 'Scheduled'}</span>
              {interviews.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length > 0 && (
                <Badge className="ml-1 bg-linear-to-r from-[#3b82f6] to-[#2563eb] text-white border-0 text-xs">
                  {interviews.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-[#4a3728] font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{copy.completedTab}</span>
              <span className="sm:hidden">{locale === 'da' ? 'Afsluttet' : 'Done'}</span>
              {interviews.filter(i => i.status === 'completed').length > 0 && (
                <Badge className="ml-1 bg-linear-to-r from-[#10b981] to-[#059669] text-white border-0 text-xs">
                  {interviews.filter(i => i.status === 'completed').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Yet to Be Scheduled Tab */}
          <TabsContent value="pending" className="mt-0">
            {interviews.filter(i => i.status === 'pending').length === 0 ? (
              <Card className="border-2 border-[#ffe4b5] bg-linear-to-b from-white to-[#ffefd5]/20 shadow-md">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <CalendarIcon className="h-16 w-16 sm:h-20 sm:w-20 text-[#fa8072] mb-4" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#4a3728] mb-2">{copy.noInterviews}</h3>
                  <p className="text-sm sm:text-base text-[#6b5444] text-center max-w-md">{copy.noInterviewsDesc}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {interviews.filter(i => i.status === 'pending').map((interview) => {
                  const statusConfig = getStatusConfig(interview.status);
                  return (
                    <Card 
                      key={interview._id}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-[#ffe4b5] bg-linear-to-br from-white via-[#fdf5e6]/30 to-white group"
                    >
                      <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b-2 border-[#ffe4b5] pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-linear-to-br from-[#ffa07a] to-[#fa8072] flex items-center justify-center shrink-0 shadow-md">
                              <span className="text-white font-semibold text-lg">
                                {interview.candidateId?.firstName?.charAt(0) || 'C'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg sm:text-xl text-[#4a3728] line-clamp-1">
                                {interview.candidateId?.firstName} {interview.candidateId?.lastName}
                              </CardTitle>
                              <p className="text-xs sm:text-sm text-[#6b5444] mt-1 line-clamp-1 flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                {interview.candidateId?.email}
                              </p>
                            </div>
                          </div>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 pb-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#fdf5e6]/40 border border-[#ffe4b5]">
                            <Building2 className="h-5 w-5 text-[#fa8072] shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-[#6b5444] mb-0.5">{copy.role}</p>
                              <p className="text-sm font-semibold text-[#4a3728] truncate">
                                {interview.internshipId?.title || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => openCandidateProfile(interview)}
                            variant="outline"
                            className="flex-1 border-2 border-[#ffe4b5] hover:bg-[#fdf5e6] text-[#4a3728]"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            {copy.viewProfile}
                          </Button>
                          <Button
                            onClick={() => handleSchedule(interview)}
                            disabled={actionLoading}
                            className="flex-1 bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#ffa07a] text-white shadow-md"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            {copy.sendLink}
                          </Button>
                          <Button
                            onClick={() => handleReject(interview._id)}
                            disabled={actionLoading}
                            variant="outline"
                            className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">{copy.reject}</span>
                            <span className="sm:hidden">{locale === 'da' ? 'Afvis' : 'Reject'}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {copy.scheduledTab}
                </CardTitle>
                <CardDescription>
                  {interviews.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length === 0 
                    ? 'No scheduled interviews' 
                    : `${interviews.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length} scheduled interview${interviews.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length === 1 ? '' : 's'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviews.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">No Scheduled Interviews</h3>
                    <p className="text-zinc-500">Schedule interviews from the pending tab</p>
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
                        {interviews.filter(i => i.status === 'scheduled' || i.status === 'rescheduled').map((interview) => {
                          const statusConfig = getStatusConfig(interview.status);
                          return (
                            <TableRow key={interview._id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-purple-600 font-semibold">
                                      {interview.candidateId?.firstName?.charAt(0) || 'C'}
                                    </span>
                                  </div>
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
                                  <Users className="w-4 h-4 text-zinc-400" />
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
                                <Badge className={statusConfig.color}>
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openCandidateProfile(interview)}
                                    className="gap-1"
                                  >
                                    <Users className="w-4 h-4" />
                                    {copy.viewProfile}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSchedule(interview)}
                                    disabled={actionLoading}
                                    className="gap-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                    {copy.reschedule}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenCompleteModal(interview)}
                                    disabled={actionLoading}
                                    className="gap-1 text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    {copy.markCompleted}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {copy.completedTab}
                </CardTitle>
                <CardDescription>
                  {interviews.filter(i => i.status === 'completed').length === 0 
                    ? 'No completed interviews' 
                    : `${interviews.filter(i => i.status === 'completed').length} completed interview${interviews.filter(i => i.status === 'completed').length === 1 ? '' : 's'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviews.filter(i => i.status === 'completed').length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">No Completed Interviews</h3>
                    <p className="text-zinc-500">Completed interviews will appear here</p>
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
                          <TableHead>{locale === 'da' ? 'Resultat' : 'Outcome'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {interviews.filter(i => i.status === 'completed').map((interview) => {
                          const statusConfig = getStatusConfig(interview.status);
                          const decision = interview.outcome?.decision || 'pending';
                          const decisionLabel = decision === 'accepted'
                            ? (locale === 'da' ? 'Tilbud accepteret' : 'Offer Accepted')
                            : decision === 'rejected'
                              ? (locale === 'da' ? 'Afvist' : 'Rejected')
                              : (locale === 'da' ? 'Afventer' : 'Pending');
                          const decisionColor = decision === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : decision === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700';
                          return (
                            <TableRow key={interview._id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-purple-600 font-semibold">
                                      {interview.candidateId?.firstName?.charAt(0) || 'C'}
                                    </span>
                                  </div>
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
                                  <Users className="w-4 h-4 text-zinc-400" />
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
                                <Badge className={statusConfig.color}>
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-2">
                                  <Badge className={decisionColor}>{decisionLabel}</Badge>
                                  {interview.offerLetter?.url && (
                                    <Button
                                      asChild
                                      variant="outline"
                                      size="sm"
                                      className="w-fit"
                                    >
                                      <a href={interview.offerLetter.url} target="_blank" rel="noopener noreferrer">
                                        {locale === 'da' ? 'Se tilbud' : 'View Offer Letter'}
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Candidate Profile Modal */}
        <Dialog
          open={candidateModal.open}
          onOpenChange={(open) => {
            if (!open) {
              setCandidateModal({ open: false, interview: null });
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{copy.viewProfile}</DialogTitle>
              <DialogDescription>
                {candidateModal.interview?.candidateId?.firstName} {candidateModal.interview?.candidateId?.lastName}
                {candidateModal.interview?.internshipId?.title ? ` • ${candidateModal.interview.internshipId.title}` : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">Email</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {candidateModal.interview?.candidateId?.email 
                        || candidateModal.interview?.candidateId?.userId?.email 
                        || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50 text-green-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">{locale === 'da' ? 'Telefon' : 'Phone'}</p>
                    <p className="text-sm font-medium text-zinc-900">{candidateModal.interview?.candidateId?.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">{locale === 'da' ? 'Placering' : 'Location'}</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {candidateModal.interview?.candidateId?.city || '—'}
                      {candidateModal.interview?.candidateId?.country ? `, ${candidateModal.interview?.candidateId?.country}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">{locale === 'da' ? 'Uddannelse' : 'Education'}</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {candidateModal.interview?.candidateId?.university || '—'}
                    </p>
                    {candidateModal.interview?.candidateId?.fieldOfStudy?.length ? (
                      <p className="text-xs text-zinc-500">
                        {candidateModal.interview.candidateId.fieldOfStudy.join(', ')}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {candidateModal.interview?.candidateId?.skills?.length ? (
                <div>
                  <p className="text-sm font-medium text-zinc-900 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    {locale === 'da' ? 'Færdigheder' : 'Skills'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {candidateModal.interview.candidateId.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-zinc-100 text-zinc-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {candidateModal.interview?.candidateId?.languages?.length ? (
                <div>
                  <p className="text-sm font-medium text-zinc-900 mb-2">
                    {locale === 'da' ? 'Sprog' : 'Languages'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {candidateModal.interview.candidateId.languages.map((language, index) => (
                      <Badge key={`${language.language}-${index}`} variant="outline">
                        {language.language} • {language.proficiency}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {candidateModal.interview?.candidateId?.cv || candidateModal.interview?.candidateId?.portfolio ? (
                <div className="flex flex-wrap gap-3">
                  {candidateModal.interview?.candidateId?.cv && (
                    <Button asChild variant="outline" className="gap-2">
                      <a href={candidateModal.interview.candidateId.cv} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4" />
                        {locale === 'da' ? 'Se CV' : 'View Resume'}
                      </a>
                    </Button>
                  )}
                  {candidateModal.interview?.candidateId?.portfolio && (
                    <Button asChild variant="outline" className="gap-2">
                      <a href={candidateModal.interview.candidateId.portfolio} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        {locale === 'da' ? 'Portfolio' : 'Portfolio'}
                      </a>
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        {/* Complete Interview Modal */}
        <Dialog
          open={completeModal.open}
          onOpenChange={(open) => {
            if (!open) {
              handleCompleteModalClose();
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{locale === 'da' ? 'Afslut interview' : 'Complete Interview'}</DialogTitle>
              <DialogDescription>
                {completeModal.interview?.candidateId?.firstName} {completeModal.interview?.candidateId?.lastName}
                {completeModal.interview?.internshipId?.title ? ` • ${completeModal.interview.internshipId.title}` : ''}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={completeModal.decision === 'accepted' ? 'default' : 'outline'}
                  onClick={() => setCompleteModal((prev) => ({ ...prev, decision: 'accepted' }))}
                >
                  {locale === 'da' ? 'Tilbud' : 'Offer'}
                </Button>
                <Button
                  variant={completeModal.decision === 'rejected' ? 'destructive' : 'outline'}
                  onClick={() => setCompleteModal((prev) => ({ ...prev, decision: 'rejected' }))}
                >
                  {locale === 'da' ? 'Afvis' : 'Reject'}
                </Button>
              </div>

              <div>
                <Label>{locale === 'da' ? 'Feedback' : 'Feedback'}</Label>
                <Textarea
                  rows={3}
                  placeholder={locale === 'da' ? 'Noter om kandidaten...' : 'Notes about the candidate...'}
                  value={completeModal.feedback}
                  onChange={(e) => setCompleteModal((prev) => ({ ...prev, feedback: e.target.value }))}
                />
              </div>

              {completeModal.decision === 'accepted' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{locale === 'da' ? 'Startdato' : 'Joining Date'}</Label>
                      <Input
                        type="date"
                        value={completeModal.joiningDate}
                        onChange={(e) => setCompleteModal((prev) => ({ ...prev, joiningDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>{locale === 'da' ? 'Tilbudsdokument (PDF)' : 'Offer Letter (PDF)'}</Label>
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setCompleteModal((prev) => ({ ...prev, offerLetter: e.target.files?.[0] || null }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{locale === 'da' ? 'Besked til kandidat' : 'Message to Candidate'}</Label>
                    <Textarea
                      rows={3}
                      placeholder={locale === 'da' ? 'Detaljer om onboardingen...' : 'Details about onboarding...'}
                      value={completeModal.joiningMessage}
                      onChange={(e) => setCompleteModal((prev) => ({ ...prev, joiningMessage: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCompleteModalClose} disabled={actionLoading}>
                {copy.cancel}
              </Button>
              <Button onClick={handleCompleteSubmit} disabled={actionLoading}>
                {actionLoading ? copy.saving : copy.markCompleted}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule/Reschedule Modal */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedInterview?.scheduledDate ? copy.rescheduleInterview : copy.scheduleInterview}
                </DialogTitle>
                <DialogDescription>{copy.selectDateTime}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{copy.interviewDate}</Label>
                    <Input
                      type="date"
                      value={scheduleData.date}
                      onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label>{copy.interviewTime}</Label>
                    <Input
                      type="time"
                      value={scheduleData.time}
                      onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>{copy.duration}</Label>
                  <Select
                    value={scheduleData.duration.toString()}
                    onValueChange={(value) => setScheduleData({ ...scheduleData, duration: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 {locale === 'da' ? 'minutter' : 'minutes'}</SelectItem>
                      <SelectItem value="60">60 {locale === 'da' ? 'minutter' : 'minutes'}</SelectItem>
                      <SelectItem value="90">90 {locale === 'da' ? 'minutter' : 'minutes'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{copy.interviewMode}</Label>
                  <Select
                    value={scheduleData.mode}
                    onValueChange={(value) => setScheduleData({ ...scheduleData, mode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          {copy.video}
                        </div>
                      </SelectItem>
                      <SelectItem value="onsite">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {copy.onsite}
                        </div>
                      </SelectItem>
                      <SelectItem value="phone">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {copy.phone}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduleData.mode === 'video' && (
                  <div>
                    <Label>{copy.meetingLink}</Label>
                    <Input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={scheduleData.meetingLink}
                      onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
                    />
                    <div className="mt-3">
                      <Label>{copy.meetingPassword}</Label>
                      <Input
                        placeholder={locale === 'da' ? 'Kode til mødet (valgfrit)' : 'Meeting password (optional)'}
                        value={scheduleData.meetingPassword}
                        onChange={(e) => setScheduleData({ ...scheduleData, meetingPassword: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {scheduleData.mode === 'onsite' && (
                  <div>
                    <Label>{copy.locationAddress}</Label>
                    <Input
                      placeholder={locale === 'da' ? 'Adresse...' : 'Address...'}
                      value={scheduleData.location}
                      onChange={(e) => setScheduleData({ ...scheduleData, location: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <Label>{copy.additionalNotes}</Label>
                  <Textarea
                    rows={3}
                    placeholder={locale === 'da' ? 'Noter til kandidaten...' : 'Notes for the candidate...'}
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleModalOpen(false)} disabled={actionLoading}>
                  {copy.cancel}
                </Button>
                <Button onClick={handleSaveSchedule} disabled={actionLoading}>
                  {actionLoading ? copy.saving : copy.save}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </main>
    </>
  );
}
