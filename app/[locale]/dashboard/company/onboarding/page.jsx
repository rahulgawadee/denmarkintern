'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Upload,
  Download,
  CheckCircle,
  Calendar,
  User,
  Building,
  FileCheck,
  Clock
} from 'lucide-react';
import { SkeletonCard } from '@/components/ui/skeleton';

export default function OnboardingPage() {
  const { locale } = useParams();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    supervisorName: '',
    supervisorEmail: '',
    supervisorPhone: '',
    supervisorPosition: '',
    workLocation: '',
    department: '',
    notes: ''
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [documentType, setDocumentType] = useState('internship_agreement');

  const copy = locale === 'da' ? {
    title: 'Onboarding & Dokumentation',
    subtitle: 'Håndter onboarding-processen for nye praktikanter',
    candidate: 'Kandidat',
    role: 'Rolle',
    status: 'Status',
    startDate: 'Startdato',
    actions: 'Handlinger',
    noOnboardings: 'Ingen onboardings endnu',
    noOnboardingsDesc: 'Onboardings oprettes automatisk, når kandidater accepteres',
    // Status
    pending: 'Afventer',
    in_progress: 'I gang',
    completed: 'Afsluttet',
    cancelled: 'Annulleret',
    // Actions
    viewDetails: 'Se detaljer',
    markComplete: 'Marker som afsluttet',
    // Modal
    onboardingDetails: 'Onboarding detaljer',
    downloadTemplate: 'Download aftale skabelon',
    uploadAgreement: 'Upload underskrevet aftale',
    uploadOtherDocs: 'Upload andre dokumenter',
    startDateLabel: 'Startdato',
    endDateLabel: 'Slutdato',
    supervisorInfo: 'Vejleder information',
    supervisorName: 'Navn',
    supervisorEmail: 'Email',
    supervisorPhone: 'Telefon',
    supervisorPosition: 'Stilling',
    workLocation: 'Arbejdsplacering',
    department: 'Afdeling',
    additionalNotes: 'Yderligere noter',
    save: 'Gem',
    cancel: 'Annuller',
    saving: 'Gemmer...',
    loading: 'Indlæser...',
    selectFile: 'Vælg fil',
    upload: 'Upload',
    uploading: 'Uploader...',
    documents: 'Dokumenter',
    noDocuments: 'Ingen dokumenter uploadet',
    // Document types
    internship_agreement: 'Praktikaftale',
    nda: 'Fortrolighedsaftale',
    code_of_conduct: 'Adfærdskodeks',
    other: 'Andet',
    // Success
    saved: 'Ændringer gemt',
    uploaded: 'Dokument uploadet',
    completed: 'Onboarding afsluttet',
    error: 'Der opstod en fejl',
  } : {
    title: 'Onboarding & Documentation',
    subtitle: 'Manage the onboarding process for new interns',
    candidate: 'Candidate',
    role: 'Role',
    status: 'Status',
    startDate: 'Start Date',
    actions: 'Actions',
    noOnboardings: 'No onboardings yet',
    noOnboardingsDesc: 'Onboardings are created automatically when candidates are accepted',
    // Status
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    // Actions
    viewDetails: 'View Details',
    markComplete: 'Mark Complete',
    // Modal
    onboardingDetails: 'Onboarding Details',
    downloadTemplate: 'Download Agreement Template',
    uploadAgreement: 'Upload Signed Agreement',
    uploadOtherDocs: 'Upload Other Documents',
    startDateLabel: 'Start Date',
    endDateLabel: 'End Date',
    supervisorInfo: 'Supervisor Information',
    supervisorName: 'Name',
    supervisorEmail: 'Email',
    supervisorPhone: 'Phone',
    supervisorPosition: 'Position',
    workLocation: 'Work Location',
    department: 'Department',
    additionalNotes: 'Additional Notes',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    loading: 'Loading...',
    selectFile: 'Select File',
    upload: 'Upload',
    uploading: 'Uploading...',
    documents: 'Documents',
    noDocuments: 'No documents uploaded',
    // Document types
    internship_agreement: 'Internship Agreement',
    nda: 'NDA',
    code_of_conduct: 'Code of Conduct',
    other: 'Other',
    // Success
    saved: 'Changes saved',
    uploaded: 'Document uploaded',
    completed: 'Onboarding completed',
    error: 'An error occurred',
  };

  useEffect(() => {
    if (token) {
      fetchOnboardings();
    }
  }, [token]);

  const fetchOnboardings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/onboarding', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOnboardings(data.onboardings || []);
      }
    } catch (error) {
      console.error('Error fetching onboardings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (onboarding) => {
    setSelectedOnboarding(onboarding);
    setFormData({
      startDate: onboarding.startDate ? new Date(onboarding.startDate).toISOString().split('T')[0] : '',
      endDate: onboarding.endDate ? new Date(onboarding.endDate).toISOString().split('T')[0] : '',
      supervisorName: onboarding.supervisor?.name || '',
      supervisorEmail: onboarding.supervisor?.email || '',
      supervisorPhone: onboarding.supervisor?.phone || '',
      supervisorPosition: onboarding.supervisor?.position || '',
      workLocation: onboarding.workLocation || '',
      department: onboarding.department || '',
      notes: onboarding.companyNotes || ''
    });
    setDetailsModalOpen(true);
  };

  const handleSaveDetails = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/onboarding/${selectedOnboarding._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate,
          supervisor: {
            name: formData.supervisorName,
            email: formData.supervisorEmail,
            phone: formData.supervisorPhone,
            position: formData.supervisorPosition,
          },
          workLocation: formData.workLocation,
          department: formData.department,
          companyNotes: formData.notes,
          status: selectedOnboarding.status === 'pending' ? 'in_progress' : selectedOnboarding.status,
        })
      });

      if (response.ok) {
        alert(copy.saved);
        setDetailsModalOpen(false);
        fetchOnboardings();
      } else {
        alert(copy.error);
      }
    } catch (error) {
      console.error('Error saving details:', error);
      alert(copy.error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) return;

    setActionLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', uploadFile);
      formDataToSend.append('onboardingId', selectedOnboarding._id);
      formDataToSend.append('documentType', documentType);

      const response = await fetch('/api/onboarding/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (response.ok) {
        alert(copy.uploaded);
        setUploadFile(null);
        fetchOnboardings();
        // Refresh modal data
        const updatedOnboarding = onboardings.find(o => o._id === selectedOnboarding._id);
        if (updatedOnboarding) {
          setSelectedOnboarding(updatedOnboarding);
        }
      } else {
        alert(copy.error);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(copy.error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async (onboardingId) => {
    if (!confirm(locale === 'da' ? 
      'Er du sikker på, at du vil markere onboarding som afsluttet?' : 
      'Are you sure you want to mark onboarding as completed?'
    )) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/onboarding/${onboardingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        alert(copy.completed);
        setDetailsModalOpen(false);
        fetchOnboardings();
      } else {
        alert(copy.error);
      }
    } catch (error) {
      console.error('Error marking complete:', error);
      alert(copy.error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: copy.pending },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: copy.in_progress },
      completed: { color: 'bg-green-100 text-green-800', label: copy.completed },
      cancelled: { color: 'bg-red-100 text-red-800', label: copy.cancelled }
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(locale === 'da' ? 'da-DK' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <TopNavigation activeTab="onboarding" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-zinc-200 rounded animate-pulse" />
            <div className="mt-2 h-4 w-48 bg-zinc-200 rounded animate-pulse" />
          </div>

          {/* List skeletons */}
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <TopNavigation activeTab="onboarding" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">{copy.title}</h1>
          <p className="text-zinc-600">{copy.subtitle}</p>
        </div>

        {/* Onboardings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              {copy.title}
            </CardTitle>
            <CardDescription>
              {onboardings.length} {locale === 'da' ? 'onboardings' : 'onboardings'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {onboardings.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">{copy.noOnboardings}</h3>
                <p className="text-zinc-500">{copy.noOnboardingsDesc}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {onboardings.map((onboarding) => {
                  const statusInfo = getStatusBadge(onboarding.status);
                  
                  return (
                    <div key={onboarding._id} className="border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-lg">
                              {onboarding.candidateId?.userId?.name?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-zinc-900">
                              {onboarding.candidateId?.userId?.name || 'Unknown'}
                            </h3>
                            <p className="text-sm text-zinc-600">
                              {onboarding.internshipId?.title || 'N/A'}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <Calendar className="w-3 h-3" />
                                {formatDate(onboarding.startDate)}
                              </div>
                              {onboarding.supervisor?.name && (
                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                  <User className="w-3 h-3" />
                                  {onboarding.supervisor.name}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(onboarding)}
                          >
                            {copy.viewDetails}
                          </Button>
                          {onboarding.status !== 'completed' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkComplete(onboarding._id)}
                              disabled={actionLoading}
                              className="gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {copy.markComplete}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{copy.onboardingDetails}</DialogTitle>
            <DialogDescription>
              {selectedOnboarding?.candidateId?.userId?.name} - {selectedOnboarding?.internshipId?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Download Template */}
            <div className="border border-zinc-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                {copy.downloadTemplate}
              </h3>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>

            {/* Upload Documents */}
            <div className="border border-zinc-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {copy.uploadAgreement}
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx"
                  />
                  <Button 
                    onClick={handleUploadDocument} 
                    disabled={!uploadFile || actionLoading}
                    size="sm"
                  >
                    {actionLoading ? copy.uploading : copy.upload}
                  </Button>
                </div>
              </div>
            </div>

            {/* Documents List */}
            {selectedOnboarding?.documents && selectedOnboarding.documents.length > 0 && (
              <div className="border border-zinc-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {copy.documents}
                </h3>
                <div className="space-y-2">
                  {selectedOnboarding.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 px-3 bg-zinc-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost">View</Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start Date & Supervisor Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{copy.startDateLabel}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label>{copy.endDateLabel}</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">{copy.supervisorInfo}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{copy.supervisorName}</Label>
                  <Input
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({...formData, supervisorName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{copy.supervisorEmail}</Label>
                  <Input
                    type="email"
                    value={formData.supervisorEmail}
                    onChange={(e) => setFormData({...formData, supervisorEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{copy.supervisorPhone}</Label>
                  <Input
                    type="tel"
                    value={formData.supervisorPhone}
                    onChange={(e) => setFormData({...formData, supervisorPhone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{copy.supervisorPosition}</Label>
                  <Input
                    value={formData.supervisorPosition}
                    onChange={(e) => setFormData({...formData, supervisorPosition: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{copy.workLocation}</Label>
                <Input
                  value={formData.workLocation}
                  onChange={(e) => setFormData({...formData, workLocation: e.target.value})}
                />
              </div>
              <div>
                <Label>{copy.department}</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>{copy.additionalNotes}</Label>
              <Textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)} disabled={actionLoading}>
              {copy.cancel}
            </Button>
            <Button onClick={handleSaveDetails} disabled={actionLoading}>
              {actionLoading ? copy.saving : copy.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
