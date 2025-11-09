'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ActionButton } from '@/components/ui/action-button';
import { StatsCard } from '@/components/ui/stats-card';
import { Modal, ViewModal, DeleteModal } from '@/components/ui/modal';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SkeletonCard } from '@/components/ui/skeleton';
import { 
  Plus, 
  Eye, 
  Edit,
  Trash2,
  Users, 
  Briefcase,
  FileText,
  Calendar,
  CheckCircle2,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Settings
} from 'lucide-react';
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
import Link from 'next/link';

export default function CompanyDashboard() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({
    activeRoles: { count: 0, trend: 0 },
    matchesFound: { count: 0, trend: 0 },
    pendingInterviews: { count: 0, trend: 0 },
    completedInternships: { count: 0, trend: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [roleToView, setRoleToView] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    department: '',
    area: [],
    duration: '',
    weeklyHours: '',
    workMode: '',
    location: { city: '', address: '', postalCode: '' },
    startWindow: '',
    specificStartDate: '',
    responsibilities: [],
    mustHaveSkills: [],
    niceToHaveSkills: [],
    tools: [],
    languageRequirements: [{ language: 'English', level: 'B2' }],
    academicLevel: [],
    fieldOfStudy: [],
    stipend: '',
    benefits: [],
    onsiteExpectation: '',
    supervisionCapacity: '',
    ndaRequired: false,
    drivingLicenseRequired: false,
  });

  useEffect(() => {
    if (!user || user.role !== 'company' || !token) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    fetchDashboardData();
  }, [user, locale, router, token]);

  const fetchDashboardData = async () => {
    await Promise.all([fetchRoles(), fetchStats()]);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/internships/company', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setRoles(data.internships || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/internships/${roleToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setRoles(roles.filter(role => role._id !== roleToDelete._id));
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
        // Refresh stats
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewRole = async (role) => {
    setViewLoading(true);
    setViewModalOpen(true);
    
    try {
      const res = await fetch(`/api/internships/${role._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setRoleToView(data.internship);
      }
    } catch (error) {
      console.error('Error fetching role:', error);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditRole = async (role) => {
    setEditLoading(true);
    setEditModalOpen(true);
    
    try {
      const res = await fetch(`/api/internships/${role._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setRoleToEdit(data.internship);
        setEditFormData({
          title: data.internship.title || '',
          description: data.internship.description || '',
          department: data.internship.department || '',
          area: data.internship.area || [],
          duration: data.internship.duration || '',
          weeklyHours: data.internship.weeklyHours || '',
          workMode: data.internship.workMode || '',
          location: {
            city: data.internship.location?.city || '',
            address: data.internship.location?.address || '',
            postalCode: data.internship.location?.postalCode || '',
          },
          startWindow: data.internship.startWindow || '',
          specificStartDate: data.internship.specificStartDate 
            ? new Date(data.internship.specificStartDate).toISOString().split('T')[0] 
            : '',
          responsibilities: data.internship.responsibilities || [],
          mustHaveSkills: data.internship.mustHaveSkills || [],
          niceToHaveSkills: data.internship.niceToHaveSkills || [],
          tools: data.internship.tools || [],
          languageRequirements: data.internship.languageRequirements || [{ language: 'English', level: 'B2' }],
          academicLevel: data.internship.academicLevel || [],
          fieldOfStudy: data.internship.fieldOfStudy || [],
          stipend: data.internship.stipend || '',
          benefits: data.internship.benefits || [],
          onsiteExpectation: data.internship.onsiteExpectation || '',
          supervisionCapacity: data.internship.supervisionCapacity || '',
          ndaRequired: data.internship.ndaRequired || false,
          drivingLicenseRequired: data.internship.drivingLicenseRequired || false,
        });
      }
    } catch (error) {
      console.error('Error fetching role:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleToEdit) return;
    
    setEditLoading(true);
    try {
      const res = await fetch(`/api/internships/${roleToEdit._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        const data = await res.json();
        // Update the role in the list
        setRoles(roles.map(role => 
          role._id === roleToEdit._id ? data.internship : role
        ));
        setEditModalOpen(false);
        setRoleToEdit(null);
        // Refresh stats
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const calculateStats = (internships) => {
    setStats({
      total: internships.length,
      draft: internships.filter(i => i.status === 'draft').length,
      underReview: internships.filter(i => i.status === 'under_review').length,
      active: internships.filter(i => i.status === 'active').length,
      matched: internships.filter(i => i.status === 'matched').length,
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: 'bg-[#f5f5f5] text-[#2b2b2b] border-[#d4d4d4]', icon: FileText, label: locale === 'da' ? 'Kladde' : 'Draft' },
      under_review: { color: 'bg-[#e5e5e5] text-[#2b2b2b] border-[#b3b3b3]', icon: Clock, label: locale === 'da' ? 'Under gennemgang' : 'Under Review' },
      shortlist_sent: { color: 'bg-[#d4d4d4] text-[#2b2b2b] border-[#a3a3a3]', icon: Users, label: locale === 'da' ? 'Shortlist sendt' : 'Shortlist Sent' },
      matched: { color: 'bg-[#2b2b2b] text-white border-[#525252]', icon: CheckCircle2, label: locale === 'da' ? 'Matchet' : 'Matched' },
      active: { color: 'bg-[#525252] text-white border-[#737373]', icon: TrendingUp, label: locale === 'da' ? 'Aktiv' : 'Active' },
      completed: { color: 'bg-[#737373] text-white border-[#a3a3a3]', icon: CheckCircle2, label: locale === 'da' ? 'Afsluttet' : 'Completed' },
      closed: { color: 'bg-[#f5f5f5] text-[#525252] border-[#d4d4d4]', icon: XCircle, label: locale === 'da' ? 'Lukket' : 'Closed' },
    };
    return configs[status] || configs.draft;
  };

  const copy = locale === 'da' ? {
    title: 'Virksomhedsdashboard',
    subtitle: 'Administrer dine praktikroller og kandidater',
    addNewRole: 'Tilføj ny praktikrolle',
    settings: 'Indstillinger',
    noRoles: 'Ingen roller oprettet endnu',
    createFirst: 'Opret din første praktikrolle',
    quickStart: 'Hurtig formular',
    fullForm: 'Fuld formular',
    viewRoles: 'Mine roller',
    viewMatches: 'Se matchede kandidater',
    viewReports: 'Se rapporter',
    activeRoles: 'Aktive roller',
    matchesFound: 'Fundne matches',
    pendingInterviews: 'Afventende interviews',
    completedInternships: 'Afsluttede praktikophold',
    roleTitle: 'Rolletitel',
    duration: 'Varighed',
    location: 'Placering',
    status: 'Status',
    actions: 'Handlinger',
    view: 'Se',
    edit: 'Rediger',
    delete: 'Slet',
    deleteConfirm: 'Slet rolle',
    deleteMessage: 'Er du sikker på, at du vil slette denne rolle? Denne handling kan ikke fortrydes.',
    cancel: 'Annuller',
    deleting: 'Sletter...',
    onsite: 'På stedet',
    remote: 'Fjern',
    hybrid: 'Hybrid',
    months: 'måneder',
    weeks: 'uger',
    loading: 'Indlæser...',
    viewDetails: 'Se detaljer',
    editRole: 'Rediger rolle',
    updateRole: 'Opdater rolle',
    updating: 'Opdaterer...',
    description: 'Beskrivelse',
    area: 'Område',
    workMode: 'Arbejdstilstand',
    requirements: 'Krav',
    responsibilities: 'Ansvar',
    benefits: 'Fordele',
    salary: 'Løn',
    spots: 'Pladser',
    deadline: 'Ansøgningsfrist',
    company: 'Firma',
    createdAt: 'Oprettet',
    minSalary: 'Min. løn',
    maxSalary: 'Max. løn',
    department: 'Afdeling',
    weeklyHours: 'Timer per uge',
    city: 'By',
    address: 'Adresse',
    postalCode: 'Postnummer',
    startWindow: 'Startvindue',
    specificStartDate: 'Specifik startdato',
    mustHaveSkills: 'Nødvendige færdigheder',
    niceToHaveSkills: 'Nice-to-have færdigheder',
    tools: 'Værktøjer',
    languageReq: 'Sprogkrav',
    academicLevel: 'Uddannelsesniveau',
    fieldOfStudy: 'Studieretning',
    stipend: 'Løn/Stipend',
    onsiteExpectation: 'Forventet tilstedeværelse',
    supervisionCapacity: 'Vejledningskapacitet',
    ndaRequired: 'NDA påkrævet',
    drivingLicense: 'Kørekort påkrævet',
    yes: 'Ja',
    no: 'Nej',
  } : {
    title: 'Company Dashboard',
    subtitle: 'Manage your internship roles and candidates',
    addNewRole: 'Add New Internship Role',
    settings: 'Settings',
    noRoles: 'No roles created yet',
    createFirst: 'Create your first internship role',
    quickStart: 'Quick Form',
    fullForm: 'Full Form',
    viewRoles: 'My Roles',
    viewMatches: 'View Matched Candidates',
    viewReports: 'View Reports',
    activeRoles: 'Active Roles',
    matchesFound: 'Matches Found',
    pendingInterviews: 'Pending Interviews',
    completedInternships: 'Completed Internships',
    roleTitle: 'Role Title',
    duration: 'Duration',
    location: 'Location',
    status: 'Status',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Delete Role',
    deleteMessage: 'Are you sure you want to delete this role? This action cannot be undone.',
    cancel: 'Cancel',
    deleting: 'Deleting...',
    onsite: 'On-site',
    remote: 'Remote',
    hybrid: 'Hybrid',
    months: 'months',
    weeks: 'weeks',
    loading: 'Loading...',
    viewDetails: 'View Details',
    editRole: 'Edit Role',
    updateRole: 'Update Role',
    updating: 'Updating...',
    description: 'Description',
    area: 'Area',
    workMode: 'Work Mode',
    requirements: 'Requirements',
    responsibilities: 'Responsibilities',
    benefits: 'Benefits',
    salary: 'Salary',
    spots: 'Spots',
    deadline: 'Application Deadline',
    company: 'Company',
    createdAt: 'Created',
    minSalary: 'Min. Salary',
    maxSalary: 'Max. Salary',
    department: 'Department',
    weeklyHours: 'Weekly Hours',
    city: 'City',
    address: 'Address',
    postalCode: 'Postal Code',
    startWindow: 'Start Window',
    specificStartDate: 'Specific Start Date',
    mustHaveSkills: 'Must-have Skills',
    niceToHaveSkills: 'Nice-to-have Skills',
    tools: 'Tools',
    languageReq: 'Language Requirements',
    academicLevel: 'Academic Level',
    fieldOfStudy: 'Field of Study',
    stipend: 'Stipend',
    onsiteExpectation: 'Expected Onsite Presence',
    supervisionCapacity: 'Supervision Capacity',
    ndaRequired: 'NDA Required',
    drivingLicense: 'Driving License Required',
    yes: 'Yes',
    no: 'No',
  };

  if (loading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#d4d4d4] px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-[#d4d4d4]" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#2b2b2b] font-semibold">{copy.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex items-center justify-center min-h-screen bg-white p-6">
          <div className="w-full max-w-6xl space-y-6">
            <div className="bg-white rounded-xl p-6 border border-[#d4d4d4] shadow-sm">
              <div className="h-8 w-1/3 bg-[#f5f5f5] rounded-md animate-pulse" />
              <div className="mt-2 h-4 w-1/4 bg-[#f5f5f5] rounded-md animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#d4d4d4] px-4 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-[#d4d4d4]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#2b2b2b] font-semibold">{copy.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-white">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-[#2b2b2b]">{copy.title}</h1>
            <p className="text-[#737373] mt-2">{copy.subtitle}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title={copy.activeRoles}
              value={stats.activeRoles.count}
              icon={Briefcase}
              trend={stats.activeRoles.trend}
              trendLabel="vs last month"
              iconColor="text-[#2b2b2b]"
              iconBgColor="bg-[#f5f5f5]"
            />
            <StatsCard
              title={copy.matchesFound}
              value={stats.matchesFound.count}
              icon={Users}
              trend={stats.matchesFound.trend}
                trendLabel="vs last month"
                iconColor="text-[#2b2b2b]"
                iconBgColor="bg-[#e5e5e5]"
              />
              <StatsCard
                title={copy.pendingInterviews}
                value={stats.pendingInterviews.count}
                icon={Calendar}
                trend={stats.pendingInterviews.trend}
                trendLabel="vs last month"
                iconColor="text-[#525252]"
                iconBgColor="bg-[#f5f5f5]"
              />
          <StatsCard
            title={copy.completedInternships}
            value={stats.completedInternships.count}
            icon={CheckCircle}
            trend={stats.completedInternships.trend}
            trendLabel="vs last month"
            iconColor="text-[#737373]"
            iconBgColor="bg-[#e5e5e5]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <ActionButton
            variant="default"
            icon={Plus}
            onClick={() => router.push(`/${locale}/dashboard/company/add-role`)}
          >
            {copy.addNewRole}
          </ActionButton>
          <ActionButton
            variant="outline"
            icon={Users}
            onClick={() => router.push(`/${locale}/dashboard/company/matches`)}
          >
            {copy.viewMatches}
          </ActionButton>
        </div>

        {roles.length === 0 ? (
          <Card className="text-center py-12 border-[#d4d4d4]">
            <CardContent>
              <Briefcase className="h-16 w-16 text-[#d4d4d4] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#2b2b2b]">{copy.noRoles}</h3>
              <p className="text-[#737373] mb-6">{copy.createFirst}</p>
              <div className="flex gap-3 justify-center">
                <ActionButton
                  icon={Plus}
                  onClick={() => router.push(`/${locale}/dashboard/company/add-role?mode=quick`)}
                >
                  {copy.quickStart}
                </ActionButton>
                <ActionButton
                  variant="outline"
                  icon={FileText}
                  onClick={() => router.push(`/${locale}/dashboard/company/add-role?mode=full`)}
                >
                  {copy.fullForm}
                </ActionButton>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-[#2b2b2b]">{copy.viewRoles}</h2>
            {roles.map((role) => {
              const statusConfig = getStatusConfig(role.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={role._id} className="hover:shadow-md transition-shadow border-[#d4d4d4]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-[#2b2b2b]">{role.title}</CardTitle>
                          <Badge variant="outline" className={`${statusConfig.color} border`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <CardDescription className="text-[#737373]">
                          {role.area?.join(', ')} • {role.workMode} • {role.duration} {locale === 'da' ? 'uger' : 'weeks'}
                          {role.location?.city && ` • ${role.location.city}`}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-[#737373]">
                        <p>{new Date(role.createdAt).toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-US')}</p>
                        {role.applications?.length > 0 && (
                          <p className="font-medium text-[#2b2b2b]">{role.applications.length} {locale === 'da' ? 'ansøgninger' : 'applications'}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <ActionButton
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => handleViewRole(role)}
                      >
                        {copy.view}
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="outline"
                        icon={Edit}
                        onClick={() => handleEditRole(role)}
                      >
                        {copy.edit}
                      </ActionButton>
                      {role.applications?.length > 0 && (
                        <ActionButton
                          size="sm"
                          variant="outline"
                          icon={Users}
                          onClick={() => router.push(`/${locale}/dashboard/company/roles/${role._id}/candidates`)}
                        >
                          {locale === 'da' ? 'Se kandidater' : 'View Candidates'} ({role.applications.length})
                        </ActionButton>
                      )}
                      {role.status === 'matched' && (
                        <ActionButton
                          size="sm"
                          icon={Calendar}
                          onClick={() => router.push(`/${locale}/dashboard/company/roles/${role._id}/interview`)}
                        >
                          {locale === 'da' ? 'Planlæg samtale' : 'Schedule Interview'}
                        </ActionButton>
                      )}
                      <ActionButton
                        size="sm"
                        variant="outline"
                        icon={Trash2}
                        onClick={() => {
                          setRoleToDelete(role);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-[#737373] hover:text-[#2b2b2b] hover:bg-[#f5f5f5]"
                      >
                        {copy.delete}
                      </ActionButton>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

            {/* Delete Confirmation Modal */}
            <DeleteModal
              isOpen={deleteDialogOpen}
              onClose={() => {
                setDeleteDialogOpen(false);
                setRoleToDelete(null);
              }}
              onConfirm={handleDeleteRole}
              title={copy.deleteConfirm}
        message={copy.deleteMessage}
        itemName={roleToDelete?.title}
        loading={deleting}
      />

      {/* View Role Modal */}
      <ViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setRoleToView(null);
        }}
        title={copy.viewDetails}
        data={roleToView ? [
          { label: copy.roleTitle, value: roleToView.title },
          { label: copy.company, value: roleToView.companyId?.companyName || '-' },
          { label: copy.description, value: roleToView.description },
          { label: copy.area, value: roleToView.area?.join(', ') || '-' },
          { label: copy.duration, value: `${roleToView.duration} ${locale === 'da' ? 'uger' : 'weeks'}` },
          { label: copy.workMode, value: roleToView.workMode },
          { label: copy.location, value: roleToView.location?.city || roleToView.location?.address || '-' },
          { label: copy.requirements, value: roleToView.requirements?.join(', ') || '-' },
          { label: copy.responsibilities, value: roleToView.responsibilities?.join(', ') || '-' },
          { label: copy.benefits, value: roleToView.benefits?.join(', ') || '-' },
          { 
            label: copy.salary, 
            value: roleToView.salary?.min && roleToView.salary?.max 
              ? `${roleToView.salary.min} - ${roleToView.salary.max} ${roleToView.salary.currency}` 
              : '-' 
          },
          { label: copy.spots, value: roleToView.spots },
          { label: copy.status, value: getStatusConfig(roleToView.status).label },
          { 
            label: copy.deadline, 
            value: roleToView.applicationDeadline 
              ? new Date(roleToView.applicationDeadline).toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-US')
              : '-'
          },
          { 
            label: copy.createdAt, 
            value: new Date(roleToView.createdAt).toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-US')
          },
        ] : []}
        loading={viewLoading}
      />

      {/* Edit Role Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setRoleToEdit(null);
        }}
        title={copy.editRole}
        size="xl"
      >
        {editLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Title */}
            <div>
              <Label htmlFor="edit-title">{copy.roleTitle} *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder={copy.roleTitle}
              />
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="edit-department">{copy.department}</Label>
              <Select
                value={editFormData.department}
                onValueChange={(value) => setEditFormData({ ...editFormData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={copy.department} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="edit-description">{copy.description}</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder={copy.description}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Duration */}
              <div>
                <Label htmlFor="edit-duration">{copy.duration} *</Label>
                <Select
                  value={editFormData.duration}
                  onValueChange={(value) => setEditFormData({ ...editFormData, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={copy.duration} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8-12">8-12 {copy.weeks}</SelectItem>
                    <SelectItem value="13-16">13-16 {copy.weeks}</SelectItem>
                    <SelectItem value="17-24">17-24 {copy.weeks}</SelectItem>
                    <SelectItem value="25+">25+ {copy.weeks}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Weekly Hours */}
              <div>
                <Label htmlFor="edit-weeklyHours">{copy.weeklyHours} *</Label>
                <Select
                  value={editFormData.weeklyHours}
                  onValueChange={(value) => setEditFormData({ ...editFormData, weeklyHours: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={copy.weeklyHours} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8-15">8-15 hours</SelectItem>
                    <SelectItem value="16-20">16-20 hours</SelectItem>
                    <SelectItem value="21-30">21-30 hours</SelectItem>
                    <SelectItem value="31-37">31-37 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Work Mode */}
              <div>
                <Label htmlFor="edit-workMode">{copy.workMode} *</Label>
                <Select
                  value={editFormData.workMode}
                  onValueChange={(value) => setEditFormData({ ...editFormData, workMode: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={copy.workMode} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">{copy.remote}</SelectItem>
                    <SelectItem value="onsite">{copy.onsite}</SelectItem>
                    <SelectItem value="hybrid">{copy.hybrid}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Onsite Expectation */}
              {editFormData.workMode === 'hybrid' && (
                <div>
                  <Label htmlFor="edit-onsiteExpectation">{copy.onsiteExpectation}</Label>
                  <Select
                    value={editFormData.onsiteExpectation}
                    onValueChange={(value) => setEditFormData({ ...editFormData, onsiteExpectation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={copy.onsiteExpectation} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 days/week</SelectItem>
                      <SelectItem value="1-2">1-2 days/week</SelectItem>
                      <SelectItem value="3+">3+ days/week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-city">{copy.city}</Label>
                <Input
                  id="edit-city"
                  value={editFormData.location.city}
                  onChange={(e) => setEditFormData({ 
                    ...editFormData, 
                    location: { ...editFormData.location, city: e.target.value }
                  })}
                  placeholder="Copenhagen"
                />
              </div>
              <div>
                <Label htmlFor="edit-address">{copy.address}</Label>
                <Input
                  id="edit-address"
                  value={editFormData.location.address}
                  onChange={(e) => setEditFormData({ 
                    ...editFormData, 
                    location: { ...editFormData.location, address: e.target.value }
                  })}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label htmlFor="edit-postalCode">{copy.postalCode}</Label>
                <Input
                  id="edit-postalCode"
                  value={editFormData.location.postalCode}
                  onChange={(e) => setEditFormData({ 
                    ...editFormData, 
                    location: { ...editFormData.location, postalCode: e.target.value }
                  })}
                  placeholder="1234"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Window */}
              <div>
                <Label htmlFor="edit-startWindow">{copy.startWindow}</Label>
                <Select
                  value={editFormData.startWindow}
                  onValueChange={(value) => setEditFormData({ ...editFormData, startWindow: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={copy.startWindow} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="2-4weeks">2-4 weeks</SelectItem>
                    <SelectItem value="1-2months">1-2 months</SelectItem>
                    <SelectItem value="specific">Specific date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Specific Start Date */}
              {editFormData.startWindow === 'specific' && (
                <div>
                  <Label htmlFor="edit-specificStartDate">{copy.specificStartDate}</Label>
                  <Input
                    id="edit-specificStartDate"
                    type="date"
                    value={editFormData.specificStartDate}
                    onChange={(e) => setEditFormData({ ...editFormData, specificStartDate: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Responsibilities */}
            <div>
              <Label htmlFor="edit-responsibilities">{copy.responsibilities}</Label>
              <Textarea
                id="edit-responsibilities"
                value={editFormData.responsibilities.join('\n')}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  responsibilities: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="One responsibility per line"
                rows={3}
              />
            </div>

            {/* Must-have Skills */}
            <div>
              <Label htmlFor="edit-mustHaveSkills">{copy.mustHaveSkills}</Label>
              <Textarea
                id="edit-mustHaveSkills"
                value={editFormData.mustHaveSkills.join('\n')}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  mustHaveSkills: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="One skill per line"
                rows={3}
              />
            </div>

            {/* Nice-to-have Skills */}
            <div>
              <Label htmlFor="edit-niceToHaveSkills">{copy.niceToHaveSkills}</Label>
              <Textarea
                id="edit-niceToHaveSkills"
                value={editFormData.niceToHaveSkills.join('\n')}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  niceToHaveSkills: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="One skill per line"
                rows={3}
              />
            </div>

            {/* Tools */}
            <div>
              <Label htmlFor="edit-tools">{copy.tools}</Label>
              <Textarea
                id="edit-tools"
                value={editFormData.tools.join('\n')}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  tools: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="One tool per line (e.g., Figma, Photoshop)"
                rows={2}
              />
            </div>

            {/* Academic Level */}
            <div>
              <Label htmlFor="edit-academicLevel">{copy.academicLevel}</Label>
              <Textarea
                id="edit-academicLevel"
                value={editFormData.academicLevel.join(', ')}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  academicLevel: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                })}
                placeholder="bachelor, master, vocational"
                rows={1}
              />
            </div>

            {/* Field of Study */}
            <div>
              <Label htmlFor="edit-fieldOfStudy">{copy.fieldOfStudy}</Label>
              <Textarea
                id="edit-fieldOfStudy"
                value={editFormData.fieldOfStudy.join(', ')}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  fieldOfStudy: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                })}
                placeholder="Computer Science, Marketing, etc."
                rows={1}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Stipend */}
              <div>
                <Label htmlFor="edit-stipend">{copy.stipend}</Label>
                <Select
                  value={editFormData.stipend}
                  onValueChange={(value) => setEditFormData({ ...editFormData, stipend: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={copy.stipend} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="<2000">&lt; 2000 DKK</SelectItem>
                    <SelectItem value="2000-4999">2000-4999 DKK</SelectItem>
                    <SelectItem value="5000-7999">5000-7999 DKK</SelectItem>
                    <SelectItem value="8000+">8000+ DKK</SelectItem>
                    <SelectItem value="not_decided">Not decided</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Supervision Capacity */}
              <div>
                <Label htmlFor="edit-supervisionCapacity">{copy.supervisionCapacity}</Label>
                <Select
                  value={editFormData.supervisionCapacity}
                  onValueChange={(value) => setEditFormData({ ...editFormData, supervisionCapacity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={copy.supervisionCapacity} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2h">1-2 hours/week</SelectItem>
                    <SelectItem value="3-5h">3-5 hours/week</SelectItem>
                    <SelectItem value="6h+">6+ hours/week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <Label htmlFor="edit-benefits">{copy.benefits}</Label>
              <Textarea
                id="edit-benefits"
                value={editFormData.benefits.join('\n')}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  benefits: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="One benefit per line"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* NDA Required */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-ndaRequired"
                  checked={editFormData.ndaRequired}
                  onChange={(e) => setEditFormData({ ...editFormData, ndaRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-ndaRequired" className="cursor-pointer">
                  {copy.ndaRequired}
                </Label>
              </div>

              {/* Driving License Required */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-drivingLicense"
                  checked={editFormData.drivingLicenseRequired}
                  onChange={(e) => setEditFormData({ ...editFormData, drivingLicenseRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-drivingLicense" className="cursor-pointer">
                  {copy.drivingLicense}
                </Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
              <Button
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  setRoleToEdit(null);
                }}
                disabled={editLoading}
              >
                {copy.cancel}
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={editLoading}
              >
                {editLoading ? copy.updating : copy.updateRole}
              </Button>
            </div>
          </div>
        )}
      </Modal>
          </div>
        </main>
    </>
  );
}
