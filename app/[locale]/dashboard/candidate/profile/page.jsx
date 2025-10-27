'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Save, 
  Eye, 
  Download, 
  Upload,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  User,
  GraduationCap,
  Code,
  Briefcase,
  Calendar,
  MapPin,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfilePreviewModal } from '@/components/candidate/ProfilePreviewModal';

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'en';
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPreview, setShowPreview] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    university: '',
    degree: '',
    major: '',
    graduationYear: new Date().getFullYear().toString(),
    skills: [],
    tools: [],
    languages: [],
    experience: '',
    workMode: [],
    weeklyHours: '0',
    internshipDuration: '0',
    availability: {
      startDate: '',
    },
    portfolio: '',
    linkedIn: '',
    cv: '',
    profileCompletion: 0,
    canApply: false,
  });

  const [skillInput, setSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [languageInput, setLanguageInput] = useState({ language: '', proficiency: '' });

  const copy = locale === 'da' ? {
    title: 'Profil',
    subtitle: 'Administrer din profil for at forbedre matching med praktikpladser',
    completion: 'Profil Fuldstændighed',
    canApply: 'Du kan ansøge om praktikpladser',
    cannotApply: 'Mindst 80% profil fuldstændighed krævet for at ansøge',
    personalInfo: 'Personlige Oplysninger',
    education: 'Uddannelse',
    skills: 'Færdigheder',
    tools: 'Værktøjer / Software',
    languages: 'Sprog',
    experience: 'Erfaring',
    availability: 'Tilgængelighed',
    workMode: 'Foretrukken Arbejdstilstand',
    links: 'Portfolio & Links',
    save: 'Gem Ændringer',
    preview: 'Forhåndsvisning',
    download: 'Download PDF',
    uploading: 'Uploader...',
    saving: 'Gemmer...',
  } : {
    title: 'Profile',
    subtitle: 'Manage your profile to improve matching with internships',
    completion: 'Profile Completion',
    canApply: 'You can apply for internships',
    cannotApply: 'At least 80% profile completion required to apply',
    personalInfo: 'Personal Information',
    education: 'Education',
    skills: 'Skills',
    tools: 'Tools / Software',
    languages: 'Languages',
    experience: 'Experience',
    availability: 'Availability',
    workMode: 'Preferred Work Mode',
    links: 'Portfolio & Links',
    save: 'Save Changes',
    preview: 'Preview Profile',
    download: 'Download PDF',
    uploading: 'Uploading...',
    saving: 'Saving...',
  };

  useEffect(() => {
    if (!user || user.role !== 'candidate') {
      router.push(`/${locale}/auth/login`);
      return;
    }
    fetchProfile();
  }, [user, locale, router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/candidate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('📋 Profile data received:', data);
        
        setProfile({
          ...profile,
          ...data.profile,
          // Ensure email is populated from user data if not in profile
          email: data.profile?.email || data.user?.email || user?.email || '',
          // Ensure graduationYear is string for input field
          graduationYear: data.profile?.graduationYear?.toString() || new Date().getFullYear().toString(),
          // weeklyHours and internshipDuration are already strings from Select dropdowns
          weeklyHours: data.profile?.weeklyHours || '0',
          internshipDuration: data.profile?.internshipDuration || '0',
          // Ensure arrays are properly initialized
          skills: Array.isArray(data.profile?.skills) ? data.profile.skills : [],
          tools: Array.isArray(data.profile?.tools) ? data.profile.tools : [],
          languages: Array.isArray(data.profile?.languages) ? data.profile.languages : [],
          workMode: Array.isArray(data.profile?.workMode) ? data.profile.workMode : [],
          availability: {
            startDate: data.profile?.availability?.startDate 
              ? new Date(data.profile.availability.startDate).toISOString().split('T')[0] 
              : '',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const handleAddTool = () => {
    if (toolInput.trim() && !profile.tools.includes(toolInput.trim())) {
      setProfile(prev => ({
        ...prev,
        tools: [...prev.tools, toolInput.trim()],
      }));
      setToolInput('');
    }
  };

  const handleRemoveTool = (tool) => {
    setProfile(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t !== tool),
    }));
  };

  const handleAddLanguage = () => {
    if (languageInput.language && languageInput.proficiency) {
      const exists = profile.languages.some(l => l.language === languageInput.language);
      if (!exists) {
        setProfile(prev => ({
          ...prev,
          languages: [...prev.languages, { ...languageInput }],
        }));
        setLanguageInput({ language: '', proficiency: '' });
      }
    }
  };

  const handleRemoveLanguage = (language) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l.language !== language),
    }));
  };

  const handleWorkModeToggle = (mode) => {
    setProfile(prev => ({
      ...prev,
      workMode: prev.workMode.includes(mode)
        ? prev.workMode.filter(m => m !== mode)
        : [...prev.workMode, mode],
    }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile/candidate/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        handleInputChange(type === 'cv' ? 'cv' : 'profilePhoto', data.url);
        setMessage({ type: 'success', text: 'File uploaded successfully!' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload file' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare profile data with proper types
      const profileData = {
        ...profile,
        // Convert graduationYear to number
        graduationYear: parseInt(profile.graduationYear) || new Date().getFullYear(),
        // Keep weeklyHours and internshipDuration as strings (they use Select dropdowns with enum values)
        // Ensure arrays are properly formatted
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        tools: Array.isArray(profile.tools) ? profile.tools : [],
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        workMode: Array.isArray(profile.workMode) ? profile.workMode : [],
      };
      
      console.log('💾 Saving profile:', profileData);
      
      const res = await fetch('/api/profile/candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({
          ...prev,
          profileCompletion: data.profileCompletion,
          canApply: data.canApply,
        }));
        setMessage({ 
          type: 'success', 
          text: `Profile saved! Completion: ${data.profileCompletion}%` 
        });
      } else {
        const errorData = await res.json();
        console.error('❌ Save failed:', errorData);
        throw new Error(errorData.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    // TODO: Generate and download PDF
    console.log('Download PDF:', profile);
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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{copy.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {copy.title}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              {copy.subtitle}
            </p>
          </div>

          {/* Profile Completion */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{copy.completion}</CardTitle>
                  <CardDescription>
                    {profile.profileCompletion}% complete
                  </CardDescription>
                </div>
                <div className="text-4xl font-bold text-blue-600">
                  {profile.profileCompletion}%
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={profile.profileCompletion} className="h-3" />
              {profile.canApply ? (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {copy.canApply}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-amber-500 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    {copy.cannotApply}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

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

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {copy.personalInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-zinc-50 cursor-not-allowed"
                  placeholder="john@example.com"
                />
                <p className="text-xs text-zinc-500">Email cannot be changed here</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+45 12 34 56 78"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Copenhagen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={profile.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Denmark"
                />
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {copy.education}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="university">University *</Label>
                <Input
                  id="university"
                  value={profile.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  placeholder="University of Copenhagen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Degree *</Label>
                <Select value={profile.degree} onValueChange={(val) => handleInputChange('degree', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="vocational">Vocational</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major / Field of Study *</Label>
                <Input
                  id="major"
                  value={profile.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year *</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={profile.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  placeholder="2025"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {copy.skills}
              </CardTitle>
              <CardDescription>Add skills used for auto-matching (e.g., React, Marketing, Excel)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Type a skill and press Enter"
                />
                <Button onClick={handleAddSkill} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tools / Software */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {copy.tools}
              </CardTitle>
              <CardDescription>Technical tools you know (e.g., Figma, Python, Adobe XD)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTool()}
                  placeholder="Type a tool and press Enter"
                />
                <Button onClick={handleAddTool} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.tools.map((tool) => (
                  <Badge key={tool} variant="secondary" className="gap-1">
                    {tool}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTool(tool)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle>{copy.languages}</CardTitle>
              <CardDescription>Select known languages and proficiency levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-3">
                <Input
                  value={languageInput.language}
                  onChange={(e) => setLanguageInput(prev => ({ ...prev, language: e.target.value }))}
                  placeholder="Language (e.g., English)"
                />
                <Select
                  value={languageInput.proficiency}
                  onValueChange={(val) => setLanguageInput(prev => ({ ...prev, proficiency: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="fluent">Fluent</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddLanguage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {profile.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{lang.language}</span>
                    <div className="flex items-center gap-2">
                      <Badge>{lang.proficiency}</Badge>
                      <X
                        className="h-4 w-4 cursor-pointer text-red-600"
                        onClick={() => handleRemoveLanguage(lang.language)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {copy.experience}
              </CardTitle>
              <CardDescription>Optional: Brief description or bullet points of your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profile.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="• Worked as intern at XYZ Company&#10;• Led project on ABC&#10;• Experience with DEF"
                rows={6}
                maxLength={2000}
              />
              <p className="text-sm text-zinc-500 mt-2">
                {profile.experience?.length || 0} / 2000 characters
              </p>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {copy.availability}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={profile.availability.startDate}
                  onChange={(e) => handleInputChange('availability', { startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyHours">Weekly Hours *</Label>
                <Select value={profile.weeklyHours} onValueChange={(val) => handleInputChange('weeklyHours', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8-15">8-15 hours</SelectItem>
                    <SelectItem value="16-20">16-20 hours</SelectItem>
                    <SelectItem value="21-30">21-30 hours</SelectItem>
                    <SelectItem value="31-37">31-37 hours</SelectItem>
                    <SelectItem value="full-time">Full-time (37+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Internship Duration *</Label>
                <Select value={profile.internshipDuration} onValueChange={(val) => handleInputChange('internshipDuration', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3 months">1-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="12+ months">12+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Work Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {copy.workMode}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['onsite', 'remote', 'hybrid'].map((mode) => (
                  <Button
                    key={mode}
                    variant={profile.workMode.includes(mode) ? 'default' : 'outline'}
                    onClick={() => handleWorkModeToggle(mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume / CV *
              </CardTitle>
              <CardDescription>Upload your resume (PDF, DOC, DOCX - Max 5MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'cv')}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('cv-upload')?.click()}
                  disabled={uploading}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? copy.uploading : 'Upload Resume'}
                </Button>
                {profile.cv && (
                  <a
                    href={profile.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View Current Resume
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                {copy.links}
              </CardTitle>
              <CardDescription>Optional: Add your LinkedIn and portfolio links</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn</Label>
                <Input
                  id="linkedIn"
                  value={profile.linkedIn}
                  onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio</Label>
                <Input
                  id="portfolio"
                  value={profile.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-end">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              {copy.preview}
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              {copy.download}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? copy.saving : copy.save}
            </Button>
          </div>
        </div>
      </main>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        profile={profile}
        locale={locale}
      />
    </>
  );
}
