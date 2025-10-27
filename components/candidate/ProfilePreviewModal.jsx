"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  GraduationCap,
  Code,
  Wrench,
  Languages,
  Briefcase,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Link as LinkIcon,
  FileText,
  Clock,
} from "lucide-react";

export function ProfilePreviewModal({ isOpen, onClose, profile, locale = 'en' }) {
  const copy = locale === 'da' ? {
    title: 'Profil Forhåndsvisning',
    subtitle: 'Sådan ser din profil ud for virksomheder',
    personalInfo: 'Personlige Oplysninger',
    education: 'Uddannelse',
    skills: 'Færdigheder',
    tools: 'Værktøjer',
    languages: 'Sprog',
    experience: 'Erfaring',
    availability: 'Tilgængelighed',
    workMode: 'Arbejdstilstand',
    links: 'Links',
    startDate: 'Startdato',
    weeklyHours: 'Timer/uge',
    duration: 'Varighed',
    noData: 'Ingen data',
  } : {
    title: 'Profile Preview',
    subtitle: 'This is how your profile looks to companies',
    personalInfo: 'Personal Information',
    education: 'Education',
    skills: 'Skills',
    tools: 'Tools',
    languages: 'Languages',
    experience: 'Experience',
    availability: 'Availability',
    workMode: 'Work Mode',
    links: 'Links',
    startDate: 'Start Date',
    weeklyHours: 'Weekly Hours',
    duration: 'Duration',
    noData: 'No data',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{copy.title}</DialogTitle>
          <DialogDescription>{copy.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">{copy.personalInfo}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Name</p>
                  <p className="font-medium">
                    {profile.firstName} {profile.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email || copy.noData}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {profile.phone || copy.noData}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Location</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profile.city && profile.country
                      ? `${profile.city}, ${profile.country}`
                      : copy.noData}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-lg">{copy.education}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">University:</span>
                  <span className="font-medium">{profile.university || copy.noData}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Degree:</span>
                  <span className="font-medium capitalize">{profile.degree || copy.noData}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Major:</span>
                  <span className="font-medium">{profile.major || copy.noData}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Graduation Year:</span>
                  <span className="font-medium">{profile.graduationYear || copy.noData}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-lg">{copy.skills}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tools */}
          {profile.tools && profile.tools.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-lg">{copy.tools}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.tools.map((tool, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {profile.languages && profile.languages.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">{copy.languages}</h3>
                </div>
                <div className="space-y-2">
                  {profile.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{lang.language}</span>
                      <Badge variant="outline" className="capitalize">
                        {lang.proficiency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.experience && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-lg">{copy.experience}</h3>
                </div>
                <p className="text-sm text-zinc-700 whitespace-pre-line">
                  {profile.experience}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Availability */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-teal-600" />
                <h3 className="font-semibold text-lg">{copy.availability}</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">{copy.startDate}</p>
                  <p className="font-medium">
                    {profile.availability?.startDate 
                      ? new Date(profile.availability.startDate).toLocaleDateString()
                      : copy.noData}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">{copy.weeklyHours}</p>
                  <p className="font-medium">{profile.weeklyHours || copy.noData}</p>
                </div>
                <div>
                  <p className="text-zinc-500">{copy.duration}</p>
                  <p className="font-medium">{profile.internshipDuration || copy.noData}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Mode */}
          {profile.workMode && profile.workMode.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-pink-600" />
                  <h3 className="font-semibold text-lg">{copy.workMode}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.workMode.map((mode, index) => (
                    <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-800 capitalize">
                      {mode}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {(profile.portfolio || profile.linkedIn || profile.cv) && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <LinkIcon className="h-5 w-5 text-cyan-600" />
                  <h3 className="font-semibold text-lg">{copy.links}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {profile.portfolio && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-zinc-500" />
                      <a
                        href={profile.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.portfolio}
                      </a>
                    </div>
                  )}
                  {profile.linkedIn && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-zinc-500" />
                      <a
                        href={profile.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.linkedIn}
                      </a>
                    </div>
                  )}
                  {profile.cv && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-500" />
                      <a
                        href={profile.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
