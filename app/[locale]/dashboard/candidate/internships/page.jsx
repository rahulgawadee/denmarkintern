'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Mail, MapPin, Clock, CheckCircle, XCircle, Trash2, Loader2, Building, Briefcase, Eye, DollarSign, AlertCircle } from 'lucide-react';

export default function CandidateBrowseInternshipsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const token = useSelector((state) => state.auth.token);

  const [invitations, setInvitations] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invitations');
  
  const [respondModal, setRespondModal] = useState({ open: false, invitation: null, action: null });
  const [candidateResponse, setCandidateResponse] = useState('');
  const [responding, setResponding] = useState(false);
  
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [viewModal, setViewModal] = useState(false);

  useEffect(() => {
    fetchInvitations();
    fetchInternships();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/invitations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations?.filter(inv => inv.status === 'pending') || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/internships', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setInternships(data.internships || []);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToInvitation = async () => {
    if (!respondModal.invitation || !respondModal.action) return;

    try {
      setResponding(true);
      const res = await fetch(`/api/invitations/${respondModal.invitation._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          response: respondModal.action,
          candidateResponse,
        }),
      });

      if (res.ok) {
        if (respondModal.action === 'accepted') {
          alert(copy.acceptSuccess);
          // Redirect to interviews page to see the scheduled interview
          setTimeout(() => {
            router.push(`/${locale}/dashboard/candidate/interviews`);
          }, 1500);
        } else {
          alert(copy.rejectSuccess);
        }
        
        setRespondModal({ open: false, invitation: null, action: null });
        setCandidateResponse('');
        fetchInvitations();
      } else {
        const error = await res.json();
        alert(error.error || copy.respondFailed);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert(copy.respondFailed);
    } finally {
      setResponding(false);
    }
  };

  const handleIgnoreInvitation = async (invitationId) => {
    if (!confirm(copy.confirmIgnore)) return;

    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        alert(copy.ignoreSuccess);
        fetchInvitations();
      }
    } catch (error) {
      console.error('Error ignoring invitation:', error);
    }
  };

  const copy = locale === 'da' ? {
    title: 'Gennemse praktikopslag',
    subtitle: 'Se dine invitationer og tilgængelige praktikopslag',
    back: 'Tilbage til dashboard',
    invitationsTab: 'Mine Invitationer',
    browseTab: 'Gennemse Praktikker',
    company: 'Virksomhed',
    role: 'Rolle',
    location: 'Placering',
    duration: 'Varighed',
    accept: 'Accepter',
    reject: 'Afvis',
    ignore: 'Ignorer',
    viewDetails: 'Se Detaljer',
    noInvitations: 'Ingen invitationer',
    noInvitationsDesc: 'Du har ingen ventende invitationer endnu. Virksomheder vil invitere dig baseret på din profil.',
    noInternships: 'Ingen praktikopslag',
    noInternshipsDesc: 'Der er ingen praktikopslag tilgængelige lige nu.',
    respondModalTitle: 'Besvar invitation',
    message: 'Besked fra virksomheden',
    yourResponse: 'Din besked (valgfri)',
    responsePlaceholder: 'Skriv en besked til virksomheden...',
    send: 'Send',
    cancel: 'Annuller',
    acceptSuccess: '✅ Invitation accepteret! Du kan nu se den i "Mine ansøgninger" og "Samtaler". Omdirigerer...',
    rejectSuccess: 'Invitation afvist',
    respondFailed: 'Kunne ikke besvare invitation',
    confirmIgnore: 'Er du sikker på at du vil ignorere denne invitation?',
    ignoreSuccess: 'Invitation ignoreret',
    sentOn: 'Sendt',
    expiresOn: 'Udløber',
    salary: 'Løn',
    requirements: 'Krav',
    description: 'Beskrivelse',
    responsibilities: 'Ansvarsområder',
    viewOnlyNote: 'Du kan ikke ansøge direkte. Optimér din profil for at øge chancerne for at modtage invitationer.',
    profileTip: '💡 Tip: Opdater din profil med relevante færdigheder for at matche disse praktikker',
  } : {
    title: 'Browse Internships',
    subtitle: 'View your invitations and available internships',
    back: 'Back to dashboard',
    invitationsTab: 'My Invitations',
    browseTab: 'Browse Internships',
    company: 'Company',
    role: 'Role',
    location: 'Location',
    duration: 'Duration',
    accept: 'Accept',
    reject: 'Reject',
    ignore: 'Ignore',
    viewDetails: 'View Details',
    noInvitations: 'No invitations',
    noInvitationsDesc: 'You have no pending invitations yet. Companies will invite you based on your profile.',
    noInternships: 'No internships',
    noInternshipsDesc: 'There are no internships available right now.',
    respondModalTitle: 'Respond to Invitation',
    message: 'Message from company',
    yourResponse: 'Your message (optional)',
    responsePlaceholder: 'Write a message to the company...',
    send: 'Send',
    cancel: 'Cancel',
    acceptSuccess: '✅ Invitation accepted! You can now see it in "My Applications" and "Interviews". Redirecting...',
    rejectSuccess: 'Invitation rejected',
    respondFailed: 'Failed to respond to invitation',
    confirmIgnore: 'Are you sure you want to ignore this invitation?',
    ignoreSuccess: 'Invitation ignored',
    sentOn: 'Sent On',
    expiresOn: 'Expires On',
    salary: 'Salary',
    requirements: 'Requirements',
    description: 'Description',
    responsibilities: 'Responsibilities',
    viewOnlyNote: 'You cannot apply directly. Optimize your profile to increase chances of receiving invitations.',
    profileTip: '💡 Tip: Update your profile with relevant skills to match these internships',
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
          onClick={() => router.push(`/${locale}/dashboard/candidate`)}
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
          <TabsList className="mb-6">
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {copy.invitationsTab}
              {invitations.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">{invitations.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {copy.browseTab}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: My Invitations */}
          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  {copy.invitationsTab}
                </CardTitle>
                <CardDescription>
                  {invitations.length === 0 ? copy.noInvitationsDesc : `${invitations.length} pending invitation${invitations.length === 1 ? '' : 's'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noInvitations}</h3>
                    <p className="text-sm text-zinc-500">{copy.noInvitationsDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div key={invitation._id} className="border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                <Building className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold text-zinc-900">
                                {invitation.internshipId?.title}
                              </h3>
                              <p className="text-sm text-zinc-600">{invitation.companyId?.companyName}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {typeof invitation.internshipId?.location === 'string' 
                                    ? invitation.internshipId.location 
                                    : invitation.internshipId?.location?.city || invitation.internshipId?.location?.address || 'N/A'}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {invitation.internshipId?.duration} months
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Invitation</Badge>
                        </div>

                        {invitation.message && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                            <p className="text-sm font-medium text-blue-900 mb-1">{copy.message}:</p>
                            <p className="text-sm text-blue-800">{invitation.message}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                          <span>{copy.sentOn}: {new Date(invitation.sentAt).toLocaleDateString()}</span>
                          <span className="text-orange-600">
                            {copy.expiresOn}: {new Date(invitation.expiresAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => setRespondModal({ open: true, invitation, action: 'accepted' })}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {copy.accept}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setRespondModal({ open: true, invitation, action: 'rejected' })}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {copy.reject}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleIgnoreInvitation(invitation._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Browse All Internships (VIEW ONLY) */}
          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  {copy.browseTab}
                </CardTitle>
                <CardDescription>
                  {internships.length === 0 ? copy.noInternshipsDesc : `${internships.length} internship${internships.length === 1 ? '' : 's'} available`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Profile Optimization Tip */}
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-1">{copy.profileTip}</p>
                      <p className="text-sm text-amber-700">{copy.viewOnlyNote}</p>
                    </div>
                  </div>
                </div>

                {internships.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noInternships}</h3>
                    <p className="text-sm text-zinc-500">{copy.noInternshipsDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {internships.map((internship) => (
                      <div key={internship._id} className="border border-zinc-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              <Building className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-zinc-900">{internship.title}</h3>
                            <p className="text-sm text-zinc-600">{internship.companyId?.companyName}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-zinc-600">
                            <MapPin className="h-4 w-4 mr-2 text-zinc-400" />
                            {typeof internship.location === 'string' 
                              ? internship.location 
                              : internship.location?.city || internship.location?.address || 'N/A'}
                          </div>
                          <div className="flex items-center text-sm text-zinc-600">
                            <Clock className="h-4 w-4 mr-2 text-zinc-400" />
                            {internship.duration} months
                          </div>
                          {internship.stipend && (
                            <div className="flex items-center text-sm text-zinc-600">
                              <DollarSign className="h-4 w-4 mr-2 text-zinc-400" />
                              {typeof internship.stipend === 'string' 
                                ? internship.stipend 
                                : internship.stipend?.amount 
                                  ? `${internship.stipend.amount} DKK/${locale === 'da' ? 'md' : 'month'}` 
                                  : 'N/A'}
                            </div>
                          )}
                        </div>

                        {internship.requirements && internship.requirements.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-zinc-700 mb-2">{copy.requirements}:</p>
                            <div className="flex flex-wrap gap-1">
                              {internship.requirements.slice(0, 3).map((req, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{req}</Badge>
                              ))}
                              {internship.requirements.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{internship.requirements.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setSelectedInternship(internship);
                            setViewModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {copy.viewDetails}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Respond to Invitation Modal */}
        <Modal
          isOpen={respondModal.open}
          onClose={() => setRespondModal({ open: false, invitation: null, action: null })}
          title={copy.respondModalTitle}
          size="md"
        >
          <div className="space-y-4">
            <div className={`${respondModal.action === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
              <p className="text-sm font-medium">
                {respondModal.action === 'accepted' ? (
                  <span className="text-green-900">You are accepting this invitation</span>
                ) : (
                  <span className="text-red-900">You are rejecting this invitation</span>
                )}
              </p>
              <p className="text-sm text-zinc-700 mt-2">
                <strong>{copy.role}:</strong> {respondModal.invitation?.internshipId?.title}
              </p>
              <p className="text-sm text-zinc-600">
                <strong>{copy.company}:</strong> {respondModal.invitation?.companyId?.companyName}
              </p>
            </div>

            <div>
              <Label>{copy.yourResponse}</Label>
              <Textarea
                value={candidateResponse}
                onChange={(e) => setCandidateResponse(e.target.value)}
                placeholder={copy.responsePlaceholder}
                rows={4}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setRespondModal({ open: false, invitation: null, action: null })}
              disabled={responding}
            >
              {copy.cancel}
            </Button>
            <Button
              onClick={handleRespondToInvitation}
              disabled={responding}
              variant={respondModal.action === 'accepted' ? 'default' : 'destructive'}
            >
              {responding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                copy.send
              )}
            </Button>
          </div>
        </Modal>

        {/* View Internship Details Modal */}
        <Modal
          isOpen={viewModal}
          onClose={() => {
            setViewModal(false);
            setSelectedInternship(null);
          }}
          title={selectedInternship?.title || copy.viewDetails}
          size="lg"
        >
          {selectedInternship && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    <Building className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedInternship.companyId?.companyName}</h3>
                  <p className="text-zinc-600">{selectedInternship.companyId?.industry}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-700">{copy.location}</p>
                  <p className="text-zinc-900">
                    {typeof selectedInternship.location === 'string' 
                      ? selectedInternship.location 
                      : selectedInternship.location?.city && selectedInternship.location?.address
                        ? `${selectedInternship.location.city}, ${selectedInternship.location.address}`
                        : selectedInternship.location?.city || selectedInternship.location?.address || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700">{copy.duration}</p>
                  <p className="text-zinc-900">{selectedInternship.duration} months</p>
                </div>
                {selectedInternship.stipend && (
                  <div>
                    <p className="text-sm font-medium text-zinc-700">{copy.salary}</p>
                    <p className="text-zinc-900">
                      {typeof selectedInternship.stipend === 'string' 
                        ? selectedInternship.stipend 
                        : selectedInternship.stipend?.amount 
                          ? `${selectedInternship.stipend.amount} DKK/${locale === 'da' ? 'md' : 'month'}` 
                          : 'N/A'}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-medium text-zinc-700 mb-2">{copy.description}</p>
                <p className="text-zinc-900 whitespace-pre-wrap text-sm">{selectedInternship.description}</p>
              </div>

              {/* Requirements */}
              {selectedInternship.requirements && selectedInternship.requirements.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-2">{copy.requirements}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInternship.requirements.map((req, idx) => (
                      <Badge key={idx} variant="outline">{req}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {selectedInternship.responsibilities && (
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-2">{copy.responsibilities}</p>
                  <p className="text-zinc-900 whitespace-pre-wrap text-sm">{selectedInternship.responsibilities}</p>
                </div>
              )}

              {/* Profile Tip */}
              <div className="pt-4 border-t bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">💡 {copy.profileTip}</p>
                <p className="text-xs text-blue-700">{copy.viewOnlyNote}</p>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t">
                <Button onClick={() => setViewModal(false)} className="w-full" variant="outline">
                  {locale === 'da' ? 'Luk' : 'Close'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
