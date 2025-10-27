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
import { Modal } from '@/components/ui/modal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Video, Link as LinkIcon, Eye, CheckCircle, XCircle, Upload, Loader2, FileText } from 'lucide-react';

export default function CompanyInterviewsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const token = useSelector((state) => state.auth.token);

  const [pendingInterviews, setPendingInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // Schedule Modal
  const [scheduleModal, setScheduleModal] = useState({ open: false, interview: null });
  const [scheduleData, setScheduleData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    meetingLink: '',
    meetingPassword: '',
    mode: 'video',
    duration: 60,
    additionalNotes: '',
  });
  const [scheduling, setScheduling] = useState(false);

  // Complete Modal
  const [completeModal, setCompleteModal] = useState({ open: false, interview: null });
  const [completeData, setCompleteData] = useState({
    decision: '',
    feedback: '',
    joiningDate: '',
    joiningMessage: '',
    offerLetter: null,
  });
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      
      // Fetch pending
      const pendingRes = await fetch('/api/interviews?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingInterviews(data.interviews || []);
      }

      // Fetch scheduled
      const scheduledRes = await fetch('/api/interviews?status=scheduled', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (scheduledRes.ok) {
        const data = await scheduledRes.json();
        setUpcomingInterviews(data.interviews || []);
      }

      // Fetch completed
      const completedRes = await fetch('/api/interviews?status=completed', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (completedRes.ok) {
        const data = await completedRes.json();
        setCompletedInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleData.scheduledDate || !scheduleData.scheduledTime) {
      alert(copy.fillRequired);
      return;
    }

    try {
      setScheduling(true);
      const res = await fetch(`/api/interviews/${scheduleModal.interview._id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleData),
      });

      if (res.ok) {
        alert(copy.scheduleSuccess);
        setScheduleModal({ open: false, interview: null });
        setScheduleData({
          scheduledDate: '',
          scheduledTime: '',
          meetingLink: '',
          meetingPassword: '',
          mode: 'video',
          duration: 60,
          additionalNotes: '',
        });
        fetchInterviews();
      } else {
        const error = await res.json();
        alert(error.error || copy.scheduleFailed);
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert(copy.scheduleFailed);
    } finally {
      setScheduling(false);
    }
  };

  const handleCompleteSubmit = async () => {
    if (!completeData.decision) {
      alert(copy.selectDecision);
      return;
    }

    if (completeData.decision === 'accepted' && !completeData.joiningDate) {
      alert(copy.joiningDateRequired);
      return;
    }

    try {
      setCompleting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('decision', completeData.decision);
      formData.append('feedback', completeData.feedback);
      
      if (completeData.decision === 'accepted') {
        formData.append('joiningDate', completeData.joiningDate);
        formData.append('joiningMessage', completeData.joiningMessage);
        if (completeData.offerLetter) {
          formData.append('offerLetter', completeData.offerLetter);
        }
      }

      const res = await fetch(`/api/interviews/${completeModal.interview._id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert(copy.completeSuccess);
        setCompleteModal({ open: false, interview: null });
        setCompleteData({
          decision: '',
          feedback: '',
          joiningDate: '',
          joiningMessage: '',
          offerLetter: null,
        });
        fetchInterviews();
      } else {
        const error = await res.json();
        alert(error.error || copy.completeFailed);
      }
    } catch (error) {
      console.error('Error completing interview:', error);
      alert(copy.completeFailed);
    } finally {
      setCompleting(false);
    }
  };

  const copy = locale === 'da' ? {
    title: 'Interviews',
    subtitle: 'Administrer interview tidsplaner og resultater',
    back: 'Tilbage til dashboard',
    pendingTab: 'Planlæg interview',
    upcomingTab: 'Kommende interviews',
    completedTab: 'Gennemførte interviews',
    candidate: 'Kandidat',
    role: 'Rolle',
    status: 'Status',
    date: 'Dato',
    time: 'Tid',
    actions: 'Handlinger',
    schedule: 'Planlæg',
    view: 'Vis',
    complete: 'Færdiggør',
    reject: 'Afvis',
    noPending: 'Ingen ventende interviews',
    noPendingDesc: 'Accepterede invitationer vil vises her',
    noUpcoming: 'Ingen kommende interviews',
    noUpcomingDesc: 'Planlagte interviews vil vises her',
    noCompleted: 'Ingen gennemførte interviews',
    noCompletedDesc: 'Færdiggjorte interviews vil vises her',
    scheduleModalTitle: 'Planlæg interview',
    completeModalTitle: 'Færdiggør interview',
    selectDate: 'Vælg dato',
    selectTime: 'Vælg tidspunkt',
    meetingLink: 'Mødelink',
    meetingPassword: 'Mødeadgangskode',
    duration: 'Varighed (minutter)',
    notes: 'Yderligere noter',
    decision: 'Beslutning',
    accept: 'Accepter',
    rejectCandidate: 'Afvis',
    feedback: 'Feedback',
    joiningDate: 'Startdato',
    joiningMessage: 'Velkomstbesked',
    uploadOffer: 'Upload tilbudsbrev (PDF)',
    save: 'Gem',
    cancel: 'Annuller',
    fillRequired: 'Udfyld venligst alle påkrævede felter',
    scheduleSuccess: 'Interview planlagt med succes!',
    scheduleFailed: 'Kunne ikke planlægge interview',
    selectDecision: 'Vælg venligst en beslutning',
    joiningDateRequired: 'Startdato er påkrævet for accepterede kandidater',
    completeSuccess: 'Interview færdiggjort med succes!',
    completeFailed: 'Kunne ikke færdiggøre interview',
    outcome: 'Resultat',
    accepted: 'Accepteret',
    rejected: 'Afvist',
    offerSent: 'Tilbud sendt',
    viewOffer: 'Se tilbud',
  } : {
    title: 'Interviews',
    subtitle: 'Manage interview schedules and outcomes',
    back: 'Back to dashboard',
    pendingTab: 'Schedule Interview',
    upcomingTab: 'Upcoming Interviews',
    completedTab: 'Completed Interviews',
    candidate: 'Candidate',
    role: 'Role',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    actions: 'Actions',
    schedule: 'Schedule',
    view: 'View',
    complete: 'Complete',
    reject: 'Reject',
    noPending: 'No pending interviews',
    noPendingDesc: 'Accepted invitations will appear here',
    noUpcoming: 'No upcoming interviews',
    noUpcomingDesc: 'Scheduled interviews will appear here',
    noCompleted: 'No completed interviews',
    noCompletedDesc: 'Completed interviews will appear here',
    scheduleModalTitle: 'Schedule Interview',
    completeModalTitle: 'Complete Interview',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    meetingLink: 'Meeting Link',
    meetingPassword: 'Meeting Password',
    duration: 'Duration (minutes)',
    notes: 'Additional Notes',
    decision: 'Decision',
    accept: 'Accept',
    rejectCandidate: 'Reject',
    feedback: 'Feedback',
    joiningDate: 'Joining Date',
    joiningMessage: 'Welcome Message',
    uploadOffer: 'Upload Offer Letter (PDF)',
    save: 'Save',
    cancel: 'Cancel',
    fillRequired: 'Please fill all required fields',
    scheduleSuccess: 'Interview scheduled successfully!',
    scheduleFailed: 'Failed to schedule interview',
    selectDecision: 'Please select a decision',
    joiningDateRequired: 'Joining date is required for accepted candidates',
    completeSuccess: 'Interview completed successfully!',
    completeFailed: 'Failed to complete interview',
    outcome: 'Outcome',
    accepted: 'Accepted',
    rejected: 'Rejected',
    offerSent: 'Offer Sent',
    viewOffer: 'View Offer',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}/dashboard/company`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {copy.back}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">{copy.title}</h1>
          <p className="text-zinc-600">{copy.subtitle}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              {copy.pendingTab}
              {pendingInterviews.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">{pendingInterviews.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              {copy.upcomingTab}
              {upcomingInterviews.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">{upcomingInterviews.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              {copy.completedTab}
              {completedInterviews.length > 0 && (
                <Badge className="ml-2 bg-gray-100 text-gray-800">{completedInterviews.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Pending Interviews Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>{copy.pendingTab}</CardTitle>
                <CardDescription>
                  {pendingInterviews.length === 0 ? copy.noPendingDesc : `${pendingInterviews.length} interview${pendingInterviews.length === 1 ? '' : 's'} awaiting schedule`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noPending}</h3>
                    <p className="text-sm text-zinc-500">{copy.noPendingDesc}</p>
                  </div>
                ) : (
                  <InterviewTable
                    interviews={pendingInterviews}
                    copy={copy}
                    actions={(interview) => (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setScheduleModal({ open: true, interview })}
                        >
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {copy.schedule}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {copy.reject}
                        </Button>
                      </>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Interviews Tab */}
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>{copy.upcomingTab}</CardTitle>
                <CardDescription>
                  {upcomingInterviews.length === 0 ? copy.noUpcomingDesc : `${upcomingInterviews.length} scheduled interview${upcomingInterviews.length === 1 ? '' : 's'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noUpcoming}</h3>
                    <p className="text-sm text-zinc-500">{copy.noUpcomingDesc}</p>
                  </div>
                ) : (
                  <InterviewTable
                    interviews={upcomingInterviews}
                    copy={copy}
                    showSchedule
                    actions={(interview) => (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setCompleteModal({ open: true, interview })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {copy.complete}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          {copy.view}
                        </Button>
                      </>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Interviews Tab */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>{copy.completedTab}</CardTitle>
                <CardDescription>
                  {completedInterviews.length === 0 ? copy.noCompletedDesc : `${completedInterviews.length} completed interview${completedInterviews.length === 1 ? '' : 's'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noCompleted}</h3>
                    <p className="text-sm text-zinc-500">{copy.noCompletedDesc}</p>
                  </div>
                ) : (
                  <InterviewTable
                    interviews={completedInterviews}
                    copy={copy}
                    showSchedule
                    showOutcome
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Schedule Modal */}
        <Modal
          isOpen={scheduleModal.open}
          onClose={() => setScheduleModal({ open: false, interview: null })}
          title={copy.scheduleModalTitle}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>{copy.candidate}:</strong> {scheduleModal.interview?.candidateId?.firstName} {scheduleModal.interview?.candidateId?.lastName}
              </p>
              <p className="text-sm text-blue-700">{scheduleModal.interview?.internshipId?.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{copy.selectDate} *</Label>
                <Input
                  type="date"
                  value={scheduleData.scheduledDate}
                  onChange={(e) => setScheduleData({ ...scheduleData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label>{copy.selectTime} *</Label>
                <Input
                  type="time"
                  value={scheduleData.scheduledTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>{copy.meetingLink}</Label>
              <Input
                type="url"
                value={scheduleData.meetingLink}
                onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div>
              <Label>{copy.meetingPassword}</Label>
              <Input
                type="text"
                value={scheduleData.meetingPassword}
                onChange={(e) => setScheduleData({ ...scheduleData, meetingPassword: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label>{copy.duration}</Label>
              <Input
                type="number"
                value={scheduleData.duration}
                onChange={(e) => setScheduleData({ ...scheduleData, duration: parseInt(e.target.value) })}
                min="15"
                step="15"
              />
            </div>

            <div>
              <Label>{copy.notes}</Label>
              <Textarea
                value={scheduleData.additionalNotes}
                onChange={(e) => setScheduleData({ ...scheduleData, additionalNotes: e.target.value })}
                rows={3}
                placeholder="Any additional information for the candidate..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setScheduleModal({ open: false, interview: null })}
              disabled={scheduling}
            >
              {copy.cancel}
            </Button>
            <Button onClick={handleScheduleSubmit} disabled={scheduling}>
              {scheduling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                copy.save
              )}
            </Button>
          </div>
        </Modal>

        {/* Complete Modal */}
        <Modal
          isOpen={completeModal.open}
          onClose={() => setCompleteModal({ open: false, interview: null })}
          title={copy.completeModalTitle}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>{copy.candidate}:</strong> {completeModal.interview?.candidateId?.firstName} {completeModal.interview?.candidateId?.lastName}
              </p>
              <p className="text-sm text-blue-700">{completeModal.interview?.internshipId?.title}</p>
            </div>

            <div>
              <Label>{copy.decision} *</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={completeData.decision === 'accepted' ? 'default' : 'outline'}
                  onClick={() => setCompleteData({ ...completeData, decision: 'accepted' })}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {copy.accept}
                </Button>
                <Button
                  variant={completeData.decision === 'rejected' ? 'destructive' : 'outline'}
                  onClick={() => setCompleteData({ ...completeData, decision: 'rejected' })}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {copy.rejectCandidate}
                </Button>
              </div>
            </div>

            {completeData.decision === 'accepted' && (
              <>
                <div>
                  <Label>{copy.joiningDate} *</Label>
                  <Input
                    type="date"
                    value={completeData.joiningDate}
                    onChange={(e) => setCompleteData({ ...completeData, joiningDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label>{copy.joiningMessage}</Label>
                  <Textarea
                    value={completeData.joiningMessage}
                    onChange={(e) => setCompleteData({ ...completeData, joiningMessage: e.target.value })}
                    rows={3}
                    placeholder="Welcome message for the candidate..."
                  />
                </div>

                <div>
                  <Label>{copy.uploadOffer}</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setCompleteData({ ...completeData, offerLetter: e.target.files[0] })}
                  />
                  {completeData.offerLetter && (
                    <p className="text-sm text-green-600 mt-2">
                      <FileText className="h-4 w-4 inline mr-1" />
                      {completeData.offerLetter.name}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <Label>{copy.feedback}</Label>
              <Textarea
                value={completeData.feedback}
                onChange={(e) => setCompleteData({ ...completeData, feedback: e.target.value })}
                rows={3}
                placeholder={completeData.decision === 'rejected' ? 'Provide constructive feedback...' : 'Internal notes...'}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCompleteModal({ open: false, interview: null })}
              disabled={completing}
            >
              {copy.cancel}
            </Button>
            <Button onClick={handleCompleteSubmit} disabled={completing}>
              {completing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                copy.save
              )}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// Reusable Interview Table Component
function InterviewTable({ interviews, copy, showSchedule, showOutcome, actions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">{copy.candidate}</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">{copy.role}</th>
            {showSchedule && (
              <>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">{copy.date}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">{copy.time}</th>
              </>
            )}
            {showOutcome && (
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">{copy.outcome}</th>
            )}
            {actions && (
              <th className="text-right py-3 px-4 text-sm font-medium text-zinc-700">{copy.actions}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {interviews.map((interview) => (
            <tr key={interview._id} className="border-b border-zinc-100 hover:bg-zinc-50">
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>
                      {interview.candidateId?.firstName?.[0]}{interview.candidateId?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {interview.candidateId?.firstName} {interview.candidateId?.lastName}
                    </p>
                    <p className="text-xs text-zinc-500">{interview.candidateId?.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <p className="text-sm text-zinc-900">{interview.internshipId?.title}</p>
              </td>
              {showSchedule && (
                <>
                  <td className="py-4 px-4">
                    <p className="text-sm text-zinc-600">
                      {interview.scheduledDate 
                        ? new Date(interview.scheduledDate).toLocaleDateString()
                        : '—'}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-zinc-600">
                      {interview.scheduledDate 
                        ? new Date(interview.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </p>
                  </td>
                </>
              )}
              {showOutcome && (
                <td className="py-4 px-4">
                  {interview.outcome?.decision === 'accepted' ? (
                    <Badge className="bg-green-100 text-green-800">{copy.accepted}</Badge>
                  ) : interview.outcome?.decision === 'rejected' ? (
                    <Badge className="bg-red-100 text-red-800">{copy.rejected}</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">—</Badge>
                  )}
                </td>
              )}
              {actions && (
                <td className="py-4 px-4">
                  <div className="flex justify-end gap-2">
                    {actions(interview)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
