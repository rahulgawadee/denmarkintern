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
      <div className="flex items-center justify-center min-h-screen bg-linear-to-b from-[#fdf5e6] to-white">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-linear-to-r from-[#ffa07a] to-[#fa8072] rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-[#ffe4b5] border-t-[#fa8072] mx-auto mb-4"></div>
          </div>
          <p className="text-[#6b5444] font-medium">{locale === 'da' ? 'Indlæser...' : 'Loading...'}</p>
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
              <BreadcrumbPage className="text-[#4a3728] font-semibold">{copy.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-linear-to-b from-[#fdf5e6] to-white overflow-auto">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#ffe4b5] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-[#4a3728] to-[#6b5444] bg-clip-text text-transparent mb-2">
                  {copy.title}
                </h1>
                <p className="text-[#6b5444] text-sm lg:text-base">
                  {copy.subtitle}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="border-2 border-[#ffe4b5] hover:bg-[#ffefd5] hover:border-[#fa8072] text-[#4a3728] font-semibold"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {copy.preview}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="border-2 border-[#ffe4b5] hover:bg-[#ffefd5] hover:border-[#fa8072] text-[#4a3728] font-semibold"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {copy.download}
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <Card className="border-2 border-[#ffe4b5] shadow-lg overflow-hidden">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-[#4a3728] text-xl sm:text-2xl">{copy.completion}</CardTitle>
                  <CardDescription className="text-[#6b5444] text-sm sm:text-base">
                    {profile.profileCompletion}% complete
                  </CardDescription>
                </div>
                <div className="relative">
                  <div className="text-5xl sm:text-6xl font-bold bg-linear-to-r from-[#ffa07a] to-[#fa8072] bg-clip-text text-transparent">
                    {profile.profileCompletion}%
                  </div>
                  {profile.profileCompletion >= 80 && (
                    <CheckCircle2 className="absolute -top-2 -right-2 h-8 w-8 text-green-500 animate-bounce" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="relative">
                <Progress value={profile.profileCompletion} className="h-4 bg-[#ffe4b5]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#4a3728] mix-blend-difference">
                    {profile.profileCompletion}%
                  </span>
                </div>
              </div>
              {profile.canApply ? (
                <Alert className="border-2 border-green-500 bg-linear-to-r from-green-50 to-emerald-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-semibold">
                    ✨ {copy.canApply}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-2 border-amber-500 bg-linear-to-r from-amber-50 to-orange-50">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800 font-semibold">
                    ⚠️ {copy.cannotApply}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Message Alert */}
          {message.text && (
            <Alert className={`border-2 ${message.type === 'success' ? 'border-green-500 bg-linear-to-r from-green-50 to-emerald-50' : 'border-red-500 bg-linear-to-r from-red-50 to-rose-50'} animate-in slide-in-from-top-5`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <AlertDescription className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'} font-semibold`}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="flex items-center gap-2 text-[#4a3728] text-lg sm:text-xl">
                <div className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                {copy.personalInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:gap-6 md:grid-cols-2 pt-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#4a3728] font-semibold">First Name *</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#4a3728] font-semibold">Last Name *</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#4a3728] font-semibold">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-[#fdf5e6] cursor-not-allowed border-2 border-[#ffe4b5]"
                  placeholder="john@example.com"
                />
                <p className="text-xs text-[#8b7355] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Email cannot be changed here
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#4a3728] font-semibold">Phone *</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+45 12 34 56 78"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[#4a3728] font-semibold">City *</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Copenhagen"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-[#4a3728] font-semibold">Country *</Label>
                <Input
                  id="country"
                  value={profile.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Denmark"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="flex items-center gap-2 text-[#4a3728] text-lg sm:text-xl">
                <div className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] p-2 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                {copy.education}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:gap-6 md:grid-cols-2 pt-6">
              <div className="space-y-2">
                <Label htmlFor="university" className="text-[#4a3728] font-semibold">University *</Label>
                <Input
                  id="university"
                  value={profile.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  placeholder="University of Copenhagen"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree" className="text-[#4a3728] font-semibold">Degree *</Label>
                <Select value={profile.degree} onValueChange={(val) => handleInputChange('degree', val)}>
                  <SelectTrigger className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]">
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
                <Label htmlFor="major" className="text-[#4a3728] font-semibold">Major / Field of Study *</Label>
                <Input
                  id="major"
                  value={profile.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  placeholder="Computer Science"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear" className="text-[#4a3728] font-semibold">Graduation Year *</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={profile.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  placeholder="2025"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="flex items-center gap-2 text-[#4a3728] text-lg sm:text-xl">
                <div className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] p-2 rounded-lg">
                  <Code className="h-5 w-5 text-white" />
                </div>
                {copy.skills}
              </CardTitle>
              <CardDescription className="text-[#6b5444]">
                Add skills used for auto-matching (e.g., React, Marketing, Excel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Type a skill and press Enter"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
                <Button 
                  onClick={handleAddSkill} 
                  size="icon"
                  className="bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#ffa07a] text-white shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.length === 0 ? (
                  <p className="text-sm text-[#8b7355] italic">No skills added yet. Add your first skill!</p>
                ) : (
                  profile.skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      className="gap-1 bg-linear-to-r from-[#ffefd5] to-[#ffe4b5] text-[#4a3728] border border-[#ffa07a] hover:from-[#ffe4b5] hover:to-[#ffefd5] px-3 py-1.5 text-sm font-medium"
                    >
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-[#fa8072]"
                        onClick={() => handleRemoveSkill(skill)}
                      />
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tools / Software */}
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="flex items-center gap-2 text-[#4a3728] text-lg sm:text-xl">
                <div className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] p-2 rounded-lg">
                  <Code className="h-5 w-5 text-white" />
                </div>
                {copy.tools}
              </CardTitle>
              <CardDescription className="text-[#6b5444]">
                Technical tools you know (e.g., Figma, Python, Adobe XD)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-2">
                <Input
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTool()}
                  placeholder="Type a tool and press Enter"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
                <Button 
                  onClick={handleAddTool} 
                  size="icon"
                  className="bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#ffa07a] text-white shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.tools.length === 0 ? (
                  <p className="text-sm text-[#8b7355] italic">No tools added yet. Add your first tool!</p>
                ) : (
                  profile.tools.map((tool) => (
                    <Badge 
                      key={tool} 
                      className="gap-1 bg-linear-to-r from-[#ffefd5] to-[#ffe4b5] text-[#4a3728] border border-[#ffa07a] hover:from-[#ffe4b5] hover:to-[#ffefd5] px-3 py-1.5 text-sm font-medium"
                    >
                      {tool}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-[#fa8072]"
                        onClick={() => handleRemoveTool(tool)}
                      />
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="text-[#4a3728] text-lg sm:text-xl">{copy.languages}</CardTitle>
              <CardDescription className="text-[#6b5444]">
                Select known languages and proficiency levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  value={languageInput.language}
                  onChange={(e) => setLanguageInput(prev => ({ ...prev, language: e.target.value }))}
                  placeholder="Language (e.g., English)"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
                <Select
                  value={languageInput.proficiency}
                  onValueChange={(val) => setLanguageInput(prev => ({ ...prev, proficiency: val }))}
                >
                  <SelectTrigger className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]">
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
                <Button 
                  onClick={handleAddLanguage}
                  className="bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#ffa07a] text-white shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {profile.languages.length === 0 ? (
                  <p className="text-sm text-[#8b7355] italic">No languages added yet. Add your first language!</p>
                ) : (
                  profile.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-2 border-[#ffe4b5] rounded-lg bg-[#fdf5e6] hover:bg-[#ffefd5] transition-colors">
                      <span className="font-medium text-[#4a3728]">{lang.language}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-linear-to-r from-[#ffefd5] to-[#ffe4b5] text-[#4a3728] border border-[#ffa07a]">
                          {lang.proficiency}
                        </Badge>
                        <X
                          className="h-4 w-4 cursor-pointer text-[#fa8072] hover:text-[#ff6347]"
                          onClick={() => handleRemoveLanguage(lang.language)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="flex items-center gap-2 text-[#4a3728] text-lg sm:text-xl">
                <div className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] p-2 rounded-lg">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                {copy.experience}
              </CardTitle>
              <CardDescription className="text-[#6b5444]">
                Optional: Brief description or bullet points of your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={profile.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="• Worked as intern at XYZ Company&#10;• Led project on ABC&#10;• Experience with DEF"
                rows={6}
                maxLength={2000}
                className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072] min-h-[150px]"
              />
              <p className="text-sm text-[#8b7355] mt-2">
                {profile.experience?.length || 0} / 2000 characters
              </p>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="flex items-center gap-2 text-[#4a3728] text-lg sm:text-xl">
                <div className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                {copy.availability}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 pt-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-[#4a3728] font-medium">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={profile.availability.startDate}
                  onChange={(e) => handleInputChange('availability', { startDate: e.target.value })}
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyHours" className="text-[#4a3728] font-medium">Weekly Hours *</Label>
                <Select value={profile.weeklyHours} onValueChange={(val) => handleInputChange('weeklyHours', val)}>
                  <SelectTrigger className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]">
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
                <Label htmlFor="duration" className="text-[#4a3728] font-medium">Internship Duration *</Label>
                <Select value={profile.internshipDuration} onValueChange={(val) => handleInputChange('internshipDuration', val)}>
                  <SelectTrigger className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]">
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
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="flex items-center gap-2 text-[#4a3728] text-lg sm:text-xl">
                <div className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                {copy.workMode}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {['onsite', 'remote', 'hybrid'].map((mode) => (
                  <Button
                    key={mode}
                    variant={profile.workMode.includes(mode) ? 'default' : 'outline'}
                    onClick={() => handleWorkModeToggle(mode)}
                    className={
                      profile.workMode.includes(mode)
                        ? 'bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#ffa07a] text-white shadow-md hover:shadow-lg border-0'
                        : 'border-2 border-[#ffe4b5] text-[#4a3728] hover:bg-[#ffefd5] hover:border-[#ffa07a]'
                    }
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="flex items-center gap-2 text-[#4a3728] text-lg sm:text-xl">
                <div className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Resume / CV *
              </CardTitle>
              <CardDescription className="text-[#6b5444]">
                Upload your resume (PDF, DOC, DOCX - Max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                  className="border-2 border-[#ffe4b5] text-[#4a3728] hover:bg-[#ffefd5] hover:border-[#ffa07a]"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? copy.uploading : 'Upload Resume'}
                </Button>
                {profile.cv && (
                  <a
                    href={profile.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#fa8072] hover:text-[#ff6347] hover:underline flex items-center gap-1 font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    View Current Resume
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="bg-linear-to-r from-[#fdf5e6] to-[#ffefd5] border-b border-[#ffe4b5]">
              <CardTitle className="flex items-center gap-2 text-[#4a3728] text-lg sm:text-xl">
                <div className="bg-linear-to-br from-[#ffa07a] to-[#fa8072] p-2 rounded-lg">
                  <LinkIcon className="h-5 w-5 text-white" />
                </div>
                {copy.links}
              </CardTitle>
              <CardDescription className="text-[#6b5444]">
                Optional: Add your LinkedIn and portfolio links
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 pt-6">
              <div className="space-y-2">
                <Label htmlFor="linkedIn" className="text-[#4a3728] font-medium">LinkedIn</Label>
                <Input
                  id="linkedIn"
                  value={profile.linkedIn}
                  onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio" className="text-[#4a3728] font-medium">Portfolio</Label>
                <Input
                  id="portfolio"
                  value={profile.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="border-2 border-[#ffe4b5] focus:border-[#fa8072] focus:ring-[#fa8072]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-end">
            <Button 
              variant="outline" 
              onClick={handlePreview}
              className="border-2 border-[#ffe4b5] text-[#4a3728] hover:bg-[#ffefd5] hover:border-[#ffa07a] shadow-sm hover:shadow-md"
            >
              <Eye className="h-4 w-4 mr-2" />
              {copy.preview}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF}
              className="border-2 border-[#ffe4b5] text-[#4a3728] hover:bg-[#ffefd5] hover:border-[#ffa07a] shadow-sm hover:shadow-md"
            >
              <Download className="h-4 w-4 mr-2" />
              {copy.download}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#ffa07a] text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
