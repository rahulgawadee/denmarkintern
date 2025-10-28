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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#fdf5e6] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fa8072] mx-auto"></div>
          <p className="mt-4 text-[#6b5444]">{copy.loading}</p>
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
        <div className="ml-auto">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-[#ffefd5] hover:text-[#fa8072]"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{copy.refresh}</span>
          </Button>
        </div>
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#ffefd5] border border-[#ffe4b5] p-1 h-auto w-full sm:w-auto grid grid-cols-3 gap-1">
              <TabsTrigger 
                value="pending" 
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-medium px-2 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm"
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">{copy.pendingTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Vent.' : 'Pend.'}</span>
                {pendingInterviews.length > 0 && (
                  <Badge className="ml-1 bg-white text-[#fa8072] px-1.5 py-0 text-xs">
                    {pendingInterviews.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming" 
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-medium px-2 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">{copy.upcomingTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Komm.' : 'Upcom.'}</span>
                {upcomingInterviews.length > 0 && (
                  <Badge className="ml-1 bg-white text-[#fa8072] px-1.5 py-0 text-xs">
                    {upcomingInterviews.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-medium px-2 sm:px-4 py-2.5 whitespace-nowrap text-xs sm:text-sm"
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">{copy.completedTab}</span>
                <span className="sm:hidden">{locale === 'da' ? 'Afsl.' : 'Done'}</span>
                {completedInterviews.length > 0 && (
                  <Badge className="ml-1 bg-white text-[#fa8072] px-1.5 py-0 text-xs">
                    {completedInterviews.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

          {/* Tab 1: Yet to be Scheduled */}
          <TabsContent value="pending" className="mt-6">
            <Card className="border-[#ffe4b5] shadow-md">
              <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
                <CardTitle className="flex items-center gap-2 text-[#4a3728]">
                  <Clock className="h-5 w-5 text-[#fa8072]" />
                  {copy.pendingTab}
                </CardTitle>
                <CardDescription className="text-[#6b5444]">
                  {pendingInterviews.length === 0 
                    ? copy.noPendingDesc
                    : `${pendingInterviews.length} interview${pendingInterviews.length === 1 ? '' : 's'} awaiting schedule`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {pendingInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-16 w-16 text-[#ffe4b5] mb-4" />
                    <h3 className="text-lg font-medium text-[#4a3728] mb-2">{copy.noPending}</h3>
                    <p className="text-sm text-[#6b5444] mb-6">{copy.noPendingDesc}</p>
                    <Button 
                      onClick={() => router.push(`/${locale}/dashboard/candidate/internships`)}
                      className="bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#ffa07a] text-white"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {copy.browse}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-6">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-amber-900">
                            {locale === 'da' 
                              ? 'Status kun visning - ingen handlinger påkrævet'
                              : 'Status-only view - no actions required'}
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            {locale === 'da'
                              ? 'Virksomheden vil planlægge samtaletiden. Du får besked, når det er planlagt.'
                              : 'The company will schedule the interview time. You will be notified once scheduled.'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          <TabsContent value="upcoming" className="mt-6">
            <Card className="border-[#ffe4b5] shadow-md">
              <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
                <CardTitle className="flex items-center gap-2 text-[#4a3728]">
                  <Calendar className="h-5 w-5 text-[#fa8072]" />
                  {copy.upcomingTab}
                </CardTitle>
                <CardDescription className="text-[#6b5444]">
                  {upcomingInterviews.length === 0 
                    ? copy.noUpcomingDesc
                    : `${upcomingInterviews.length} scheduled interview${upcomingInterviews.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {upcomingInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-16 w-16 text-[#ffe4b5] mb-4" />
                    <h3 className="text-lg font-medium text-[#4a3728] mb-2">{copy.noUpcoming}</h3>
                    <p className="text-sm text-[#6b5444]">{copy.noUpcomingDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          <TabsContent value="completed" className="mt-6">
            <Card className="border-[#ffe4b5] shadow-md">
              <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
                <CardTitle className="flex items-center gap-2 text-[#4a3728]">
                  <CheckCircle className="h-5 w-5 text-[#fa8072]" />
                  {copy.completedTab}
                </CardTitle>
                <CardDescription className="text-[#6b5444]">
                  {completedInterviews.length === 0 
                    ? copy.noCompletedDesc
                    : `${completedInterviews.length} completed interview${completedInterviews.length === 1 ? '' : 's'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {completedInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="mx-auto h-16 w-16 text-[#ffe4b5] mb-4" />
                    <h3 className="text-lg font-medium text-[#4a3728] mb-2">{copy.noCompleted}</h3>
                    <p className="text-sm text-[#6b5444]">{copy.noCompletedDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Award className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-blue-900">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
        </div>
      </main>

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
      </>
    );
  }
