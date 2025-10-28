'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  FileText, 
  Settings,
  CheckCircle,
  Clock,
  Send,
  Users,
  Target,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';

// Dynamic imports to avoid SSR issues
const ApplicationCard = dynamic(() => import('@/components/student/ApplicationCard').then(mod => mod.default), { ssr: false });
const EmptyState = dynamic(() => import('@/components/candidate/EmptyState').then(mod => mod.EmptyState), { ssr: false });
const StatsCard = dynamic(() => import('@/components/candidate/StatsCard').then(mod => mod.StatsCard), { ssr: false });

export default function CandidateDashboard() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [invitations, setInvitations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    activeApplications: 0,
    pendingInvitations: 0,
    interviewRequests: 0,
    completedInternships: 0,
  });

  const copy = locale === 'da' ? {
    dashboard: 'Dashboard',
    subtitle: 'Central hub til at styre dine invitationer, ansøgninger og profil',
    activeApplications: 'Aktive Ansøgninger',
    pendingInvitations: 'Ventende Invitationer',
    interviewRequests: 'Samtale Anmodninger',
    completedInternships: 'Gennemførte Praktikpladser',
    invitations: 'Invitationer',
    myApplications: 'Mine Ansøgninger',
    profile: 'Profil',
    noInvitations: 'Du har ingen ventende invitationer. Virksomheder vil invitere dig baseret på din profil.',
    noApplications: 'Du har ingen ansøgninger endnu. Accepter en invitation for at komme i gang.',
    profileManagement: 'Profilstyring kommer snart...',
    profileSettings: 'Profilindstillinger',
    manageProfile: 'Administrer din kandidatprofil',
  } : {
    dashboard: 'Dashboard',
    subtitle: 'Central hub for managing invitations, applications, and profile',
    activeApplications: 'Active Applications',
    pendingInvitations: 'Pending Invitations',
    interviewRequests: 'Interview Requests',
    completedInternships: 'Completed Internships',
    invitations: 'Invitations',
    myApplications: 'My Applications',
    profile: 'Profile',
    noInvitations: 'You have no pending invitations. Companies will invite you based on your profile.',
    noApplications: 'You have no applications yet. Accept an invitation to get started.',
    profileManagement: 'Profile management coming soon...',
    profileSettings: 'Profile Settings',
    manageProfile: 'Manage your candidate profile',
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Wait for component to mount and check authentication
    if (!mounted) return;

    // Redirect if not authenticated or not a candidate
    if (!isAuthenticated || !user || user.role !== 'candidate') {
      console.log('Not authenticated or not a candidate, redirecting to login');
      router.push(`/${locale}/auth/login`);
      return;
    }

    fetchData();
  }, [mounted, isAuthenticated, user, locale, router]);

  const fetchData = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        setLoading(false);
        router.push(`/${locale}/auth/login`);
        return;
      }
      
      console.log('📡 Fetching data with token:', token.substring(0, 20) + '...');
      
      // Fetch pending invitations
      const invitationsRes = await fetch('/api/invitations', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!invitationsRes.ok) {
        console.error('Failed to fetch invitations:', invitationsRes.status, await invitationsRes.text());
      } else {
        const invitationsData = await invitationsRes.json();
        const pendingInvites = invitationsData.invitations?.filter(inv => inv.status === 'pending') || [];
        setInvitations(pendingInvites);
        console.log('✅ Fetched', pendingInvites.length, 'pending invitations');
      }

      // Fetch my applications
      const applicationsRes = await fetch('/api/applications/student', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!applicationsRes.ok) {
        console.error('Failed to fetch applications:', applicationsRes.status, await applicationsRes.text());
        // Still set empty array to avoid breaking the UI
        setApplications([]);
      } else {
        const applicationsData = await applicationsRes.json();
        const apps = applicationsData.applications || [];
        setApplications(apps);
        console.log('✅ Fetched', apps.length, 'applications');

        // Calculate stats
        const activeApps = apps.filter(a => 
          a.status === 'pending' || 
          a.status === 'reviewing' || 
          a.status === 'shortlisted'
        );
        const interviews = apps.filter(a => 
          a.status === 'interview_scheduled' || 
          a.status === 'interviewing'
        );
        const matches = apps.filter(a => 
          a.status === 'shortlisted' || 
          a.status === 'matched'
        );
        const completed = apps.filter(a => 
          a.status === 'completed'
        );

        setStats({
          activeApplications: activeApps.length,
          pendingInvitations: invitations.length,
          interviewRequests: interviews.length,
          completedInternships: completed.length,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't break the UI, just set empty states
      setApplications([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (internship) => {
    // Removed - students can't apply directly
    console.log('Apply function disabled - students receive invitations only');
  };

  const handleViewDetails = (application) => {
    console.log('View application details:', application);
    router.push(`/${locale}/dashboard/candidate/applications`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">{locale === 'da' ? 'Indlæser...' : 'Loading...'}</p>
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
              <BreadcrumbPage className="text-[#4a3728] font-semibold">{copy.dashboard}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-linear-to-b from-[#fdf5e6] to-white overflow-auto">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 border border-[#ffe4b5] shadow-sm">
            <h1 className="text-3xl lg:text-4xl font-bold bg-linear-to-r from-[#4a3728] to-[#6b5444] bg-clip-text text-transparent">
              {copy.dashboard}
            </h1>
            <p className="text-[#6b5444] mt-2 text-sm lg:text-base">
              {copy.subtitle}
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title={copy.activeApplications}
              value={stats.activeApplications}
              icon={Send}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
            <StatsCard
              title={copy.pendingInvitations}
              value={stats.pendingInvitations}
              icon={Target}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
            />
            <StatsCard
              title={copy.interviewRequests}
              value={stats.interviewRequests}
              icon={MessageSquare}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
            />
            <StatsCard
              title={copy.completedInternships}
              value={stats.completedInternships}
              icon={CheckCircle}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-100"
            />
          </div>

            {/* Tabs */}
            <Tabs defaultValue="invitations" className="space-y-6">
              <TabsList className="bg-[#ffefd5] border border-[#ffe4b5] p-1 h-auto flex-wrap">
                <TabsTrigger 
                  value="invitations" 
                  className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-medium px-4 py-2.5"
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">{copy.invitations}</span> ({invitations.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="applications" 
                  className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-medium px-4 py-2.5"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{copy.myApplications}</span> ({applications.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-medium px-4 py-2.5"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{copy.profile}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="invitations" className="space-y-4 mt-6">
                {invitations.length === 0 ? (
                  <EmptyState
                    icon={Target}
                    title={locale === 'da' ? 'Ingen invitationer' : 'No Invitations'}
                    description={copy.noInvitations}
                  />
                ) : (
                  <Card className="border-[#ffe4b5] shadow-md">
                    <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
                      <CardTitle className="text-[#4a3728] flex items-center gap-2">
                        <Target className="h-5 w-5 text-[#fa8072]" />
                        {locale === 'da' ? 'Ventende Invitationer' : 'Pending Invitations'}
                      </CardTitle>
                      <CardDescription className="text-[#6b5444]">
                        {locale === 'da' 
                          ? 'Virksomheder der har inviteret dig til at ansøge' 
                          : 'Companies that have invited you to apply'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {invitations.map((invitation) => (
                          <div 
                            key={invitation._id} 
                            className="border border-[#ffe4b5] rounded-lg p-4 hover:shadow-lg hover:border-[#fa8072] transition-all cursor-pointer bg-white"
                            onClick={() => router.push(`/${locale}/dashboard/candidate/applications`)}
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-[#4a3728]">{invitation.internshipId?.title}</h3>
                                <p className="text-sm text-[#6b5444] mt-1">{invitation.companyId?.companyName}</p>
                                <p className="text-xs text-[#8b7355] mt-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {locale === 'da' ? 'Sendt' : 'Sent'}: {new Date(invitation.sentAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="text-sm px-3 py-1.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium w-fit">
                                {locale === 'da' ? 'Ny invitation' : 'New invitation'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-[#6b5444] mt-6 text-center p-3 bg-[#ffefd5] rounded-lg">
                        {locale === 'da' 
                          ? 'Klik for at se alle invitationer og svare' 
                          : 'Click to view all invitations and respond'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-4 mt-6">
                {applications.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title={locale === 'da' ? 'Ingen ansøgninger' : 'No Applications'}
                    description={copy.noApplications}
                  />
                ) : (
                  <div className="grid gap-4">
                    {applications.map((application) => (
                      <ApplicationCard
                        key={application._id}
                        application={application}
                        onViewDetails={handleViewDetails}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <Card className="border-[#ffe4b5] shadow-md">
                  <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
                    <CardTitle className="text-[#4a3728] flex items-center gap-2">
                      <Settings className="h-5 w-5 text-[#fa8072]" />
                      {copy.profileSettings}
                    </CardTitle>
                    <CardDescription className="text-[#6b5444]">{copy.manageProfile}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[#6b5444] p-4 bg-[#ffefd5] rounded-lg">{copy.profileManagement}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
    </>
  );
}
