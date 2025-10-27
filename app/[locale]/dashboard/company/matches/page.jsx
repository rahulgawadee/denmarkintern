'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/ui/action-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Eye, Send, UserCheck, GraduationCap, Mail, Phone, MapPin, Clock, CheckCircle, XCircle, Loader2, Building2, Calendar, FileText, ExternalLink, Download, Briefcase } from 'lucide-react';

export default function MatchesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const token = useSelector((state) => state.auth.token);

  const [view, setView] = useState('internships'); // 'internships' or 'candidates'
  const [selectedRole, setSelectedRole] = useState(null);
  const [internships, setInternships] = useState([]);
  const [matches, setMatches] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteModal, setInviteModal] = useState({ open: false, candidate: null, internshipId: null });
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    fetchInternships();
    fetchInvitations();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

  const fetchMatchesForRole = async (roleId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/matches?roleId=${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
        setSelectedRole(data.role);
        setView('candidates');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/invitations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setInvitations(data.invitations || []);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text:', text);
          setInvitations([]);
        }
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setInvitations([]);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteModal.candidate || !inviteModal.internshipId) return;

    try {
      setSendingInvite(true);
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          internshipId: inviteModal.internshipId,
          candidateId: inviteModal.candidate._id,
          message: inviteMessage,
        }),
      });

      if (res.ok) {
        alert(copy.invitationSent);
        setInviteModal({ open: false, candidate: null, internshipId: null });
        setInviteMessage('');
        fetchInvitations();
      } else {
        const error = await res.json();
        alert(error.error || copy.invitationFailed);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert(copy.invitationFailed);
    } finally {
      setSendingInvite(false);
    }
  };

  const openInviteModal = (candidate, internshipId) => {
    setInviteModal({ open: true, candidate, internshipId });
    setInviteMessage('');
  };

  const goBackToInternships = () => {
    setView('internships');
    setSelectedRole(null);
    setMatches([]);
  };

  const getInvitationStatusBadge = (status) => {
    const badges = {
      pending: <Badge className="bg-yellow-100 text-yellow-800">{copy.pending}</Badge>,
      accepted: <Badge className="bg-green-100 text-green-800">{copy.accepted}</Badge>,
      rejected: <Badge className="bg-red-100 text-red-800">{copy.rejected}</Badge>,
      expired: <Badge className="bg-gray-100 text-gray-800">{copy.expired}</Badge>,
    };
    return badges[status] || badges.pending;
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Under Review</Badge>
    );
  };

  const copy = locale === 'da' ? {
    title: 'Matchede kandidater',
    subtitle: 'Se kandidater der matcher dine praktikroller',
    back: 'Tilbage til dashboard',
    backToRoles: 'Tilbage til praktikroller',
    internshipTitle: 'Praktikrol',
    matchesFound: 'Matches fundet',
    postedOn: 'Oprettet',
    status: 'Status',
    actions: 'Handlinger',
    viewMatches: 'Se matches',
    noInternships: 'Ingen praktikroller endnu',
    noInternshipsDesc: 'Opret praktikroller for at begynde at modtage kandidat-matches',
    candidate: 'Kandidat',
    skills: 'Færdigheder',
    match: 'Match',
    education: 'Uddannelse',
    city: 'By',
    viewProfile: 'Se profil',
    sendInvite: 'Send invitation',
    invite: 'Inviter',
    noMatches: 'Ingen matches endnu',
    noMatchesDesc: 'Der er ingen kandidater, der matcher denne rolle endnu',
    role: 'Rolle',
    location: 'Placering',
    availability: 'Tilgængelighed',
    close: 'Luk',
    invitationSent: 'Invitation sendt!',
    invitationFailed: 'Kunne ikke sende invitation',
    matchesTab: 'Matchede kandidater',
    invitationsTab: 'Anmodede kandidater',
    inviteModalTitle: 'Send interview invitation',
    inviteMessage: 'Besked (valgfri)',
    inviteMessagePlaceholder: 'Skriv en personlig besked til kandidaten...',
    send: 'Send invitation',
    cancel: 'Annuller',
    pending: 'Afventer',
    accepted: 'Accepteret',
    rejected: 'Afvist',
    expired: 'Udløbet',
    sentOn: 'Sendt',
    respondedOn: 'Besvaret',
    noInvitations: 'Ingen invitationer sendt endnu',
    noInvitationsDesc: 'Send invitationer til matchede kandidater',
    university: 'Universitet',
    fieldOfStudy: 'Studieretning',
    phone: 'Telefon',
    email: 'E-mail',
    department: 'Afdeling',
    matchedCandidatesFor: 'Matchede kandidater for',
    profileDetails: 'Profil detaljer',
    resume: 'CV',
    portfolio: 'Portfolio',
    languages: 'Sprog',
    download: 'Download',
    openLink: 'Åbn link',
    invitationStatus: 'Invitationsstatus',
    confirmInvite: 'Er du sikker på, at du vil invitere',
    for: 'til',
  } : {
    title: 'Matched Candidates',
    subtitle: 'View candidates matching your internship roles',
    back: 'Back to dashboard',
    backToRoles: 'Back to Internship Roles',
    internshipTitle: 'Internship Title',
    matchesFound: 'Matches Found',
    postedOn: 'Posted On',
    status: 'Status',
    actions: 'Actions',
    viewMatches: 'View Matches',
    noInternships: 'No internships yet',
    noInternshipsDesc: 'Create internship roles to start receiving candidate matches',
    candidate: 'Candidate',
    skills: 'Skills',
    match: 'Match %',
    education: 'Education',
    city: 'City',
    viewProfile: 'View',
    sendInvite: 'Send Invite',
    invite: 'Invite',
    noMatches: 'No matches yet',
    noMatchesDesc: 'There are no candidates matching this role yet',
    role: 'Role',
    location: 'Location',
    availability: 'Availability',
    close: 'Close',
    invitationSent: 'Invitation sent successfully!',
    invitationFailed: 'Failed to send invitation',
    matchesTab: 'Matched Candidates',
    invitationsTab: 'Requested Candidates',
    inviteModalTitle: 'Send Interview Invitation',
    inviteMessage: 'Message (optional)',
    inviteMessagePlaceholder: 'Write a personal message to the candidate...',
    send: 'Send Invitation',
    cancel: 'Cancel',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    expired: 'Expired',
    sentOn: 'Sent On',
    respondedOn: 'Responded On',
    noInvitations: 'No invitations sent yet',
    noInvitationsDesc: 'Send invitations to matched candidates',
    university: 'University',
    fieldOfStudy: 'Field of Study',
    phone: 'Phone',
    email: 'Email',
    department: 'Department',
    matchedCandidatesFor: 'Matched Candidates for',
    profileDetails: 'Profile Details',
    resume: 'Resume',
    portfolio: 'Portfolio',
    languages: 'Languages',
    download: 'Download',
    openLink: 'Open Link',
    invitationStatus: 'Invitation Status',
    confirmInvite: 'Are you sure you want to invite',
    for: 'for',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600">{locale === 'da' ? 'Indlæser...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => view === 'candidates' ? goBackToInternships() : router.push(`/${locale}/dashboard/company`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {view === 'candidates' ? copy.backToRoles : copy.back}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            {view === 'candidates' && selectedRole 
              ? `${copy.matchedCandidatesFor} ${selectedRole.title}`
              : copy.title
            }
          </h1>
          <p className="text-zinc-600">
            {view === 'candidates' 
              ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'} found`
              : copy.subtitle
            }
          </p>
        </div>

        {/* Internships List View */}
        {view === 'internships' && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="matches">{copy.matchesTab}</TabsTrigger>
              <TabsTrigger value="invitations">
                {copy.invitationsTab}
                {invitations.length > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">{invitations.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* All Internships Tab */}
            <TabsContent value="matches">
              <Card>
                <CardHeader>
                  <CardTitle>{copy.matchesTab}</CardTitle>
                  <CardDescription>
                    {internships.length === 0 
                      ? copy.noInternshipsDesc 
                      : `${internships.length} internship${internships.length === 1 ? '' : 's'} posted`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {internships.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                      <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noInternships}</h3>
                      <p className="text-sm text-zinc-500">{copy.noInternshipsDesc}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-zinc-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.internshipTitle}
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.matchesFound}
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.postedOn}
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.status}
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.actions}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {internships.map((internship) => (
                            <tr key={internship._id} className="border-b border-zinc-100 hover:bg-zinc-50">
                              <td className="py-4 px-4">
                                <div>
                                  <p className="text-sm font-medium text-zinc-900">{internship.title}</p>
                                  <p className="text-xs text-zinc-500">{internship.department}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge className="bg-blue-100 text-blue-800 text-base px-3 py-1">
                                  {internship.matchesFound}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center text-sm text-zinc-600">
                                  <Calendar className="h-4 w-4 mr-1.5 text-zinc-400" />
                                  {new Date(internship.postedOn).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {getStatusBadge(internship.status)}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex justify-end">
                                  <ActionButton
                                    variant="default"
                                    size="sm"
                                    icon={Eye}
                                    onClick={() => fetchMatchesForRole(internship._id)}
                                    disabled={internship.matchesFound === 0}
                                  >
                                    {copy.viewMatches}
                                  </ActionButton>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Requested Candidates Tab */}
            <TabsContent value="invitations">
              <Card>
                <CardHeader>
                  <CardTitle>{copy.invitationsTab}</CardTitle>
                  <CardDescription>
                    {invitations.length === 0 
                      ? copy.noInvitationsDesc 
                      : `${invitations.length} invitation${invitations.length === 1 ? '' : 's'} sent`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {invitations.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                      <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noInvitations}</h3>
                      <p className="text-sm text-zinc-500">{copy.noInvitationsDesc}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-zinc-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.candidate}
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.role}
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.invitationStatus}
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.sentOn}
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.respondedOn}
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-zinc-700">
                              {copy.actions}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {invitations.map((invitation) => (
                            <tr key={invitation._id} className="border-b border-zinc-100 hover:bg-zinc-50">
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10 mr-3">
                                    <AvatarFallback>
                                      {invitation.candidateId?.firstName?.[0]}{invitation.candidateId?.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium text-zinc-900">
                                      {invitation.candidateId?.firstName} {invitation.candidateId?.lastName}
                                    </p>
                                    <p className="text-xs text-zinc-500">{invitation.candidateId?.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <p className="text-sm text-zinc-900">{invitation.internshipId?.title}</p>
                              </td>
                              <td className="py-4 px-4">
                                {getInvitationStatusBadge(invitation.status)}
                              </td>
                              <td className="py-4 px-4">
                                <p className="text-sm text-zinc-600">
                                  {new Date(invitation.sentAt).toLocaleDateString()}
                                </p>
                              </td>
                              <td className="py-4 px-4">
                                <p className="text-sm text-zinc-600">
                                  {invitation.respondedAt 
                                    ? new Date(invitation.respondedAt).toLocaleDateString()
                                    : '—'}
                                </p>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCandidate(invitation.candidateId)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    {copy.viewProfile}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Matched Candidates View for Selected Role */}
        {view === 'candidates' && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{copy.matchedCandidatesFor}</CardTitle>
                  <CardDescription className="mt-2">
                    <strong>{selectedRole?.title}</strong> • {selectedRole?.department}
                  </CardDescription>
                </div>
                {matches.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                    {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 mb-2">{copy.noMatches}</h3>
                  <p className="text-sm text-zinc-500">{copy.noMatchesDesc}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                          {copy.candidate}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                          {copy.match}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                          {copy.skills}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                          {copy.education}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-700">
                          {copy.city}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-zinc-700">
                          {copy.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((match) => (
                        <tr key={match._id} className="border-b border-zinc-100 hover:bg-zinc-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>
                                  {match.candidate?.firstName?.[0]}{match.candidate?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-zinc-900">
                                  {match.candidate?.firstName} {match.candidate?.lastName}
                                </p>
                                <p className="text-xs text-zinc-500">{match.candidate?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={`${getMatchColor(match.matchPercentage)} text-base px-3 py-1`}>
                              {match.matchPercentage}%
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {match.matchedSkills?.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {match.matchedSkills?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{match.matchedSkills.length - 3}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-sm text-zinc-600">
                              <GraduationCap className="h-4 w-4 mr-1.5 text-zinc-400" />
                              {match.candidate?.education}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-sm text-zinc-600">
                              <MapPin className="h-4 w-4 mr-1.5 text-zinc-400" />
                              {match.candidate?.location?.city || match.candidate?.location?.address || match.candidate?.city || '-'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCandidate(match.candidate)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    {copy.viewProfile}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl">
                                      {match.candidate?.firstName} {match.candidate?.lastName}
                                    </DialogTitle>
                                    <DialogDescription className="flex items-center gap-4 mt-2">
                                      <span className="flex items-center">
                                        <Mail className="h-4 w-4 mr-1" />
                                        {match.candidate?.email}
                                      </span>
                                      {match.candidate?.phone && (
                                        <span className="flex items-center">
                                          <Phone className="h-4 w-4 mr-1" />
                                          {match.candidate?.phone}
                                        </span>
                                      )}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6 mt-4">
                                    {/* Match Score */}
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-zinc-700">Match Score</span>
                                        <Badge className={`${getMatchColor(match.matchPercentage)} text-lg px-4 py-1`}>
                                          {match.matchPercentage}%
                                        </Badge>
                                      </div>
                                    </div>

                                    {/* Education */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-semibold text-zinc-700 mb-1">{copy.education}</p>
                                        <p className="text-sm text-zinc-600">{match.candidate?.education}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-zinc-700 mb-1">{copy.university}</p>
                                        <p className="text-sm text-zinc-600">{match.candidate?.university}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-sm font-semibold text-zinc-700 mb-1">{copy.fieldOfStudy}</p>
                                      <p className="text-sm text-zinc-600">{match.candidate?.fieldOfStudy}</p>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                      <h4 className="text-sm font-semibold mb-3">{copy.skills}</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {match.candidate?.skills?.map((skill, idx) => (
                                          <Badge 
                                            key={idx}
                                            className={match.matchedSkills?.includes(skill) ? 'bg-green-100 text-green-800' : ''}
                                          >
                                            {skill}
                                            {match.matchedSkills?.includes(skill) && ' ✓'}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Location & Availability */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-semibold text-zinc-700 mb-1">{copy.location}</p>
                                        <p className="text-sm text-zinc-600 flex items-center">
                                          <MapPin className="h-4 w-4 mr-1" />
                                          {match.candidate?.location?.city || match.candidate?.location?.address || match.candidate?.city || '-'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-zinc-700 mb-1">{copy.availability}</p>
                                        <p className="text-sm text-zinc-600">
                                          {match.candidate?.availability} days/week
                                        </p>
                                      </div>
                                    </div>

                                    {/* Languages */}
                                    {match.candidate?.languages?.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-semibold mb-2">{copy.languages}</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {match.candidate.languages.map((lang, idx) => (
                                            <Badge key={idx} variant="outline">
                                              {typeof lang === 'string' ? lang : `${lang.language} (${lang.proficiency})`}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Resume & Portfolio */}
                                    <div className="flex gap-3">
                                      {match.candidate?.resume && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(match.candidate.resume, '_blank')}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          {copy.download} {copy.resume}
                                        </Button>
                                      )}
                                      {match.candidate?.portfolio && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(match.candidate.portfolio, '_blank')}
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          {copy.openLink} {copy.portfolio}
                                        </Button>
                                      )}
                                    </div>

                                    {/* Bio */}
                                    {match.candidate?.bio && (
                                      <div>
                                        <h4 className="text-sm font-semibold mb-2">About</h4>
                                        <p className="text-sm text-zinc-600 leading-relaxed">
                                          {match.candidate.bio}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {(() => {
                                // Check if invitation already sent for this candidate and internship
                                const existingInvitation = invitations.find(
                                  inv => inv.candidateId?._id === match.candidate._id && 
                                         inv.internshipId?._id === selectedRole._id
                                );

                                if (existingInvitation) {
                                  return (
                                    <div className="flex items-center gap-2">
                                      {getInvitationStatusBadge(existingInvitation.status)}
                                      {existingInvitation.status === 'pending' && (
                                        <span className="text-xs text-zinc-500">
                                          {copy.sentOn}: {new Date(existingInvitation.sentAt).toLocaleDateString()}
                                        </span>
                                      )}
                                      {existingInvitation.status === 'accepted' && (
                                        <span className="text-xs text-green-600 font-medium">
                                          ✓ {copy.accepted}
                                        </span>
                                      )}
                                      {existingInvitation.status === 'rejected' && (
                                        <span className="text-xs text-red-600">
                                          {copy.rejected}
                                        </span>
                                      )}
                                    </div>
                                  );
                                }

                                return (
                                  <ActionButton
                                    variant="default"
                                    size="sm"
                                    icon={Send}
                                    onClick={() => openInviteModal(match.candidate, selectedRole._id)}
                                  >
                                    {copy.invite}
                                  </ActionButton>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invite Modal */}
        <Modal
          isOpen={inviteModal.open}
          onClose={() => setInviteModal({ open: false, candidate: null, internshipId: null })}
          title={copy.inviteModalTitle}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">
                {copy.confirmInvite} <strong>{inviteModal.candidate?.firstName} {inviteModal.candidate?.lastName}</strong>
              </p>
              <p className="text-sm text-blue-700">
                {copy.for} <strong>{selectedRole?.title || 'this role'}</strong>?
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <p className="text-sm text-zinc-700">
                <Mail className="h-4 w-4 inline mr-1" />
                {inviteModal.candidate?.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {copy.inviteMessage}
              </label>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder={copy.inviteMessagePlaceholder}
                rows={4}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setInviteModal({ open: false, candidate: null, internshipId: null })}
              disabled={sendingInvite}
            >
              {copy.cancel}
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={sendingInvite}
            >
              {sendingInvite ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {copy.send}
                </>
              )}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
