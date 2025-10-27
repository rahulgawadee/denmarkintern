'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ViewModal } from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Calendar, CheckCircle, TrendingUp, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ActiveInternsPage() {
  const { locale } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [activeInterns, setActiveInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const copy = locale === 'da' ? {
    title: 'Aktive Praktikanter',
    subtitle: 'Spor fremskridt og administrer aktive praktikophold',
    candidate: 'Kandidat',
    role: 'Rolle',
    startDate: 'Startdato',
    endDate: 'Slutdato',
    progress: 'Fremskridt',
    status: 'Status',
    actions: 'Handlinger',
    noInterns: 'Ingen aktive praktikanter',
    noInternsDesc: 'Praktikanter vises her, når onboarding er afsluttet',
    viewDetails: 'Se detaljer',
    markCompleted: 'Marker som afsluttet',
    loading: 'Indlæser...',
    // Status
    active: 'Aktiv',
    completed: 'Afsluttet',
    on_hold: 'På hold',
    // Modal
    internDetails: 'Praktikant detaljer',
    completed: 'Praktikophold markeret som afsluttet',
    error: 'Der opstod en fejl',
  } : {
    title: 'Active Interns',
    subtitle: 'Track progress and manage active internships',
    candidate: 'Candidate',
    role: 'Role',
    startDate: 'Start Date',
    endDate: 'End Date',
    progress: 'Progress',
    status: 'Status',
    actions: 'Actions',
    noInterns: 'No active interns',
    noInternsDesc: 'Interns will appear here once onboarding is completed',
    viewDetails: 'View Details',
    markCompleted: 'Mark Completed',
    loading: 'Loading...',
    // Status
    active: 'Active',
    completed: 'Completed',
    on_hold: 'On Hold',
    // Modal
    internDetails: 'Intern Details',
    completed: 'Internship marked as completed',
    error: 'An error occurred',
  };

  useEffect(() => {
    if (token) {
      fetchActiveInterns();
    }
  }, [token]);

  const fetchActiveInterns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/active-interns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setActiveInterns(data.interns || []);
      }
    } catch (error) {
      console.error('Error fetching active interns:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.round((elapsed / total) * 100);
  };

  const handleViewDetails = (intern) => {
    setSelectedIntern(intern);
    setViewModalOpen(true);
  };

  const getViewData = () => {
    if (!selectedIntern) return [];
    
    const progress = calculateProgress(selectedIntern.startDate, selectedIntern.endDate);
    
    return [
      { label: copy.candidate, value: selectedIntern.candidateId?.userId?.name || 'N/A' },
      { label: 'Email', value: selectedIntern.candidateId?.userId?.email || 'N/A' },
      { label: copy.role, value: selectedIntern.internshipId?.title || 'N/A' },
      { label: copy.startDate, value: formatDate(selectedIntern.startDate) },
      { label: copy.endDate, value: formatDate(selectedIntern.endDate) },
      { label: copy.progress, value: `${progress}%` },
      { label: 'Supervisor', value: selectedIntern.supervisor?.name || '—' },
      { label: 'Department', value: selectedIntern.department || '—' },
      { label: 'Work Location', value: selectedIntern.workLocation || '—' },
      { label: copy.status, value: selectedIntern.status || 'Active' },
    ];
  };

  const handleMarkCompleted = async (internId) => {
    if (!confirm(locale === 'da' ? 
      'Er du sikker på, at du vil markere dette praktikophold som afsluttet?' : 
      'Are you sure you want to mark this internship as completed?'
    )) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/active-interns/${internId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        alert(copy.completed);
        fetchActiveInterns();
      } else {
        alert(copy.error);
      }
    } catch (error) {
      console.error('Error marking completed:', error);
      alert(copy.error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { color: 'bg-green-100 text-green-800', label: copy.active },
      completed: { color: 'bg-blue-100 text-blue-800', label: copy.completed },
      on_hold: { color: 'bg-yellow-100 text-yellow-800', label: copy.on_hold }
    };
    return statusMap[status] || statusMap.active;
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
        <TopNavigation activeTab="active-interns" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-zinc-600">{copy.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <TopNavigation activeTab="active-interns" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">{copy.title}</h1>
          <p className="text-zinc-600">{copy.subtitle}</p>
        </div>

        {/* Active Interns Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {copy.title}
            </CardTitle>
            <CardDescription>
              {activeInterns.length} {locale === 'da' ? 'aktive praktikanter' : 'active interns'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeInterns.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">{copy.noInterns}</h3>
                <p className="text-zinc-500">{copy.noInternsDesc}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{copy.candidate}</TableHead>
                      <TableHead>{copy.role}</TableHead>
                      <TableHead>{copy.startDate}</TableHead>
                      <TableHead>{copy.endDate}</TableHead>
                      <TableHead>{copy.progress}</TableHead>
                      <TableHead>{copy.status}</TableHead>
                      <TableHead className="text-right">{copy.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeInterns.map((intern) => {
                      const statusInfo = getStatusBadge(intern.status || 'active');
                      const progress = calculateProgress(intern.startDate, intern.endDate);
                      
                      return (
                        <TableRow key={intern._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {intern.candidateId?.userId?.name?.charAt(0) || 'C'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-zinc-900">
                                  {intern.candidateId?.userId?.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {intern.candidateId?.userId?.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{intern.internshipId?.title || 'N/A'}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-zinc-600">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              {formatDate(intern.startDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-zinc-600">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              {formatDate(intern.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="w-20 h-2" />
                              <span className="text-sm font-medium text-zinc-700">{progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(intern)}
                                className="gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                {copy.viewDetails}
                              </Button>
                              {intern.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkCompleted(intern._id)}
                                  disabled={actionLoading}
                                  className="gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {copy.markCompleted}
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
      </div>

      {/* View Details Modal */}
      <ViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={copy.internDetails}
        data={getViewData()}
      />
    </div>
  );
}
