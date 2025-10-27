'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Globe,
  Mail,
  Phone,
  Send,
  Bookmark,
  Flag,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Code,
  Wrench,
  Users,
  FileText,
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function InternshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'en';
  const internshipId = params?.id;
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [internship, setInternship] = useState(null);
  const [company, setCompany] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const copy = locale === 'da' ? {
    back: 'Tilbage',
    internships: 'Praktikpladser',
    details: 'Detaljer',
    companyInfo: 'Virksomhedsoplysninger',
    website: 'Hjemmeside',
    contact: 'Kontakt',
    internshipDetails: 'Praktikplads Detaljer',
    responsibilities: 'Ansvarsområder',
    requirements: 'Krav',
    skillsRequired: 'Færdigheder Påkrævet',
    toolsRequired: 'Værktøjer Påkrævet',
    workMode: 'Arbejdstilstand',
    location: 'Placering',
    duration: 'Varighed',
    startDate: 'Startdato',
    stipend: 'Stipendium',
    deadline: 'Ansøgningsfrist',
    description: 'Beskrivelse',
    applyNow: 'Ansøg Nu',
    saveForLater: 'Gem til Senere',
    reportListing: 'Rapportér Opslag',
    alreadyApplied: 'Du har allerede ansøgt om denne praktikplads',
    confirmApply: 'Bekræft Ansøgning',
    confirmApplyText: 'Er du sikker på, at du vil ansøge om denne praktikplads?',
    cancel: 'Annuller',
    confirm: 'Bekræft',
    applying: 'Ansøger...',
    applicationSuccess: 'Ansøgning indsendt med succes!',
    applicationError: 'Kunne ikke indsende ansøgning',
    profileIncomplete: 'Fuldstændig din profil (80%+) for at ansøge',
    reportReason: 'Rapportér denne opslag',
    reportSuccess: 'Opslag rapporteret',
    saved: 'Gemt til senere',
    noData: 'Ingen data',
    onsite: 'På stedet',
    remote: 'Fjernarbejde',
    hybrid: 'Hybrid',
    positions: 'stillinger',
  } : {
    back: 'Back',
    internships: 'Internships',
    details: 'Details',
    companyInfo: 'Company Information',
    website: 'Website',
    contact: 'Contact',
    internshipDetails: 'Internship Details',
    responsibilities: 'Responsibilities',
    requirements: 'Requirements',
    skillsRequired: 'Skills Required',
    toolsRequired: 'Tools Required',
    workMode: 'Work Mode',
    location: 'Location',
    duration: 'Duration',
    startDate: 'Start Date',
    stipend: 'Stipend',
    deadline: 'Application Deadline',
    description: 'Description',
    applyNow: 'Apply Now',
    saveForLater: 'Save for Later',
    reportListing: 'Report Listing',
    alreadyApplied: 'You have already applied for this internship',
    confirmApply: 'Confirm Application',
    confirmApplyText: 'Are you sure you want to apply for this internship?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    applying: 'Applying...',
    applicationSuccess: 'Application submitted successfully!',
    applicationError: 'Failed to submit application',
    profileIncomplete: 'Complete your profile (80%+) to apply',
    reportReason: 'Report this listing',
    reportSuccess: 'Listing reported',
    saved: 'Saved for later',
    noData: 'No data',
    onsite: 'On-site',
    remote: 'Remote',
    hybrid: 'Hybrid',
    positions: 'positions',
  };

  useEffect(() => {
    if (!user || user.role !== 'candidate') {
      router.push(`/${locale}/auth/login`);
      return;
    }
    fetchInternshipDetails();
  }, [user, internshipId, locale, router]);

  const fetchInternshipDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch internship details
      const res = await fetch(`/api/internships/${internshipId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setInternship(data.internship);
        setCompany(data.company);
        setHasApplied(data.hasApplied || false);
      } else {
        setMessage({ type: 'error', text: 'Failed to load internship details' });
      }
    } catch (error) {
      console.error('Error fetching internship:', error);
      setMessage({ type: 'error', text: 'Failed to load internship details' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          internshipId: internshipId,
          companyId: internship.companyId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: copy.applicationSuccess });
        setHasApplied(true);
        setShowApplyDialog(false);
        // Refresh to update application status
        setTimeout(() => {
          router.push(`/${locale}/dashboard/candidate/applications`);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || copy.applicationError });
      }
    } catch (error) {
      console.error('Apply error:', error);
      setMessage({ type: 'error', text: copy.applicationError });
    } finally {
      setApplying(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSaveForLater = async () => {
    try {
      // TODO: Implement save for later functionality
      setMessage({ type: 'success', text: copy.saved });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleReport = async () => {
    try {
      // TODO: Implement report functionality
      setMessage({ type: 'success', text: copy.reportSuccess });
      setShowReportDialog(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Report error:', error);
    }
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

  if (!internship) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-600">Internship not found</p>
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/dashboard/candidate/internships`}>
                {copy.internships}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{copy.details}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Button>

          {/* Message Alert */}
          {message.text && (
            <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Header Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{internship.title}</CardTitle>
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{company?.companyName || 'Company'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {internship.location || copy.noData}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Briefcase className="h-3 w-3" />
                      {internship.workMode ? copy[internship.workMode.toLowerCase()] || internship.workMode : copy.noData}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {internship.positions || 1} {copy.positions}
                    </Badge>
                  </div>
                </div>
                {company?.logo && (
                  <div className="w-24 h-24 rounded-lg border bg-white p-2 flex items-center justify-center">
                    <img
                      src={company.logo}
                      alt={company.companyName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {!hasApplied ? (
                  <Button
                    onClick={() => setShowApplyDialog(true)}
                    size="lg"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {copy.applyNow}
                  </Button>
                ) : (
                  <Button size="lg" disabled className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {copy.alreadyApplied}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSaveForLater}
                  className="gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  {copy.saveForLater}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setShowReportDialog(true)}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Flag className="h-4 w-4" />
                  {copy.reportListing}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {copy.companyInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {company?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-zinc-500" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {copy.website}
                  </a>
                </div>
              )}
              {company?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                    {company.email}
                  </a>
                </div>
              )}
              {company?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-zinc-500" />
                  <a href={`tel:${company.phone}`} className="text-blue-600 hover:underline">
                    {company.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Internship Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {copy.internshipDetails}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">{copy.duration}</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    {internship.duration || copy.noData}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">{copy.startDate}</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    {internship.startDate
                      ? new Date(internship.startDate).toLocaleDateString()
                      : copy.noData}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">{copy.stipend}</p>
                  <p className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-zinc-500" />
                    {internship.stipend || copy.noData}
                  </p>
                </div>
                {internship.deadline && (
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">{copy.deadline}</p>
                    <p className="font-medium flex items-center gap-2 text-red-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(internship.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {internship.description && (
            <Card>
              <CardHeader>
                <CardTitle>{copy.description}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-700 whitespace-pre-line">
                  {internship.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {internship.responsibilities && internship.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{copy.responsibilities}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {internship.responsibilities.map((item, index) => (
                    <li key={index} className="text-zinc-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {internship.requirements && internship.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{copy.requirements}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {internship.requirements.map((item, index) => (
                    <li key={index} className="text-zinc-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skills & Tools */}
          <div className="grid gap-6 md:grid-cols-2">
            {internship.skillsRequired && internship.skillsRequired.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {copy.skillsRequired}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {internship.skillsRequired.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {internship.toolsRequired && internship.toolsRequired.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    {copy.toolsRequired}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {internship.toolsRequired.map((tool, index) => (
                      <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Apply Confirmation Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.confirmApply}</DialogTitle>
            <DialogDescription>{copy.confirmApplyText}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              {copy.cancel}
            </Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? copy.applying : copy.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.reportReason}</DialogTitle>
            <DialogDescription>
              Are you sure you want to report this listing as inappropriate?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              {copy.cancel}
            </Button>
            <Button variant="destructive" onClick={handleReport}>
              {copy.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
