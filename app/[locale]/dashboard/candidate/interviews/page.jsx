'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  Calendar,
  CheckCircle,
  Video,
  Award,
  AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PendingInterviewCard from '@/components/student/PendingInterviewCard';
import UpcomingInterviewCard from '@/components/student/UpcomingInterviewCard';
import CompletedInterviewCard from '@/components/student/CompletedInterviewCard';
import JoinInterviewModal from '@/components/student/JoinInterviewModal';

export default function StudentInterviewsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'en';
  const token = useSelector((state) => state.auth.token);

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Modal state
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInterviews();
    }
  }, [token]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching interviews for student...');
      
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
        console.error('❌ Failed to fetch interviews');
      }
    } catch (error) {
      console.error('❌ Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInterviews();
    setRefreshing(false);
  };

  const handleJoinNow = (interview) => {
    setSelectedInterview(interview);
    setJoinModalOpen(true);
  };

  // Filter interviews by status
  const pendingInterviews = interviews.filter(interview => 
    interview.status === 'pending'
  );
  
  const upcomingInterviews = interviews.filter(interview => 
    interview.status === 'scheduled' || interview.status === 'rescheduled'
  );
  
  const completedInterviews = interviews.filter(interview => 
    interview.status === 'completed'
  );

  const copy = locale === 'da' ? {
    title: 'Mine samtaler',
    subtitle: 'Se og administrer dine planlagte samtaler',
    back: 'Tilbage',
    refresh: 'Opdater',
    pendingTab: 'Endnu ikke planlagt',
    upcomingTab: 'Kommende samtaler',
    completedTab: 'Afsluttede',
    noPending: 'Ingen afventende samtaler',
    noPendingDesc: 'Du har ingen accepterede invitationer, der venter på planlægning.',
    noUpcoming: 'Ingen kommende samtaler',
    noUpcomingDesc: 'Du har ingen planlagte samtaler.',
    noCompleted: 'Ingen afsluttede samtaler',
    noCompletedDesc: 'Du har ingen gennemførte samtaler.',
    browse: 'Gennemse praktikopslag',
    loading: 'Indlæser samtaler...',
    awaitingSchedule: 'Venter på planlægning',
    scheduled: 'Planlagt',
    completed: 'Afsluttet'
  } : {
    title: 'My Interviews',
    subtitle: 'View and manage your scheduled interviews',
    back: 'Back',
    refresh: 'Refresh',
    pendingTab: 'Yet to be Scheduled',
    upcomingTab: 'Upcoming Interviews',
    completedTab: 'Completed',
    noPending: 'No pending interviews',
    noPendingDesc: 'You have no accepted invitations waiting for scheduling.',
    noUpcoming: 'No upcoming interviews',
    noUpcomingDesc: 'You have no scheduled interviews.',
    noCompleted: 'No completed interviews',
    noCompletedDesc: 'You have no completed interviews.',
    browse: 'Browse Internships',
    loading: 'Loading interviews...',
    awaitingSchedule: 'Awaiting Schedule',
    scheduled: 'Scheduled',
    completed: 'Completed'
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
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {copy.pendingTab}
              {pendingInterviews.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                  {pendingInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {copy.upcomingTab}
              {upcomingInterviews.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {upcomingInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {copy.completedTab}
              {completedInterviews.length > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {completedInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Yet to be Scheduled */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  {copy.pendingTab}
                </CardTitle>
                <CardDescription>
                  {pendingInterviews.length === 0 
                    ? copy.noPendingDesc
                    : `${pendingInterviews.length} interview${pendingInterviews.length === 1 ? '' : 's'} awaiting schedule`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noPending}</h3>
                    <p className="text-sm text-zinc-500 mb-6">{copy.noPendingDesc}</p>
                    <Button onClick={() => router.push(`/${locale}/dashboard/candidate/internships`)}>
                      <Video className="h-4 w-4 mr-2" />
                      {copy.browse}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            {locale === 'da' 
                              ? 'Status kun visning - ingen handlinger påkrævet'
                              : 'Status-only view - no actions required'}
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            {locale === 'da'
                              ? 'Virksomheden vil planlægge samtaletiden. Du får besked, når det er planlagt.'
                              : 'The company will schedule the interview time. You will be notified once scheduled.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingInterviews.map((interview) => (
                        <PendingInterviewCard
                          key={interview._id}
                          interview={interview}
                          locale={locale}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Upcoming Interviews */}
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  {copy.upcomingTab}
                </CardTitle>
                <CardDescription>
                  {upcomingInterviews.length === 0 
                    ? copy.noUpcomingDesc
                    : `${upcomingInterviews.length} scheduled interview${upcomingInterviews.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noUpcoming}</h3>
                    <p className="text-sm text-zinc-500">{copy.noUpcomingDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingInterviews.map((interview) => (
                      <UpcomingInterviewCard
                        key={interview._id}
                        interview={interview}
                        onJoinNow={handleJoinNow}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Completed Interviews */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {copy.completedTab}
                </CardTitle>
                <CardDescription>
                  {completedInterviews.length === 0 
                    ? copy.noCompletedDesc
                    : `${completedInterviews.length} completed interview${completedInterviews.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noCompleted}</h3>
                    <p className="text-sm text-zinc-500">{copy.noCompletedDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {locale === 'da' 
                              ? 'Accepterede tilbud flyttet til Mine ansøgninger'
                              : 'Accepted offers moved to My Applications'}
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            {locale === 'da'
                              ? 'Hvis du blev accepteret, se fanen "Accepteret" i Mine ansøgninger for tilbudsdetaljer.'
                              : 'If you were accepted, check the "Accepted" tab in My Applications for offer details.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {completedInterviews.map((interview) => (
                        <CompletedInterviewCard
                          key={interview._id}
                          interview={interview}
                          locale={locale}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Join Interview Modal */}
        <JoinInterviewModal
          isOpen={joinModalOpen}
          onClose={() => {
            setJoinModalOpen(false);
            setSelectedInterview(null);
          }}
          interview={selectedInterview}
          locale={locale}
        />
      </div>
    </div>
  );
}
