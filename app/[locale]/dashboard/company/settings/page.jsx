'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActionButton } from '@/components/ui/action-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Building2, User, Globe, Lock, AlertCircle, Save, Edit, Settings, Home, ChevronRight, Shield, Mail, Phone, MapPin, Globe2 } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    website: '',
    cvr: '',
    city: '',
    country: 'Denmark',
  });

  const [contactInfo, setContactInfo] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
  });

  const [preferences, setPreferences] = useState({
    language: 'da',
    notifications: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!token || !user) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    
    // Check if user is a company
    if (user.role !== 'company') {
      router.push(`/${locale}/dashboard/candidate`);
      return;
    }
    
    fetchSettings();
  }, [token, user]);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      
      if (!token) {
        setError('No authentication token found');
        setFetching(false);
        return;
      }
      
      const res = await fetch('/api/profile/company', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        
        setCompanyInfo({
          companyName: profile.companyName || '',
          website: profile.website || '',
          cvr: profile.cvr || '',
          city: profile.address?.city || '',
          country: profile.address?.country || 'Denmark',
        });

        setContactInfo({
          name: profile.primaryContact?.name || '',
          title: profile.primaryContact?.title || '',
          email: profile.primaryContact?.email || '',
          phone: profile.primaryContact?.phone || '',
        });

        setPreferences({
          language: profile.languagePreference || 'da',
          notifications: true,
        });
      } else if (res.status === 404) {
        // Profile not found - this is OK for new users
        console.log('No profile found yet - using default values');
        setError('');
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
        if (res.status === 401) {
          setError('Session expired. Please log in again.');
          setTimeout(() => {
            router.push(`/${locale}/auth/login`);
          }, 2000);
        } else {
          console.error('Profile fetch error:', errorData);
          setError(errorData.error || 'Failed to fetch profile');
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to fetch profile: ' + error.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSaveCompanyInfo = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/profile/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: companyInfo.companyName,
          website: companyInfo.website,
          cvr: companyInfo.cvr,
          address: {
            city: companyInfo.city,
            country: companyInfo.country,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(copy.saved);
        setIsCompanyModalOpen(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      setError(err.message || copy.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContactInfo = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/profile/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          primaryContact: contactInfo,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(copy.saved);
        setIsContactModalOpen(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      setError(err.message || copy.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/profile/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          languagePreference: preferences.language,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(copy.saved);
        setIsPreferencesModalOpen(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      setError(err.message || copy.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError(copy.passwordLength);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(copy.passwordChanged);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsPasswordModalOpen(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError(err.message || copy.passwordError);
    } finally {
      setLoading(false);
    }
  };

  const copy = locale === 'da' ? {
    title: 'Indstillinger',
    subtitle: 'Administrer din virksomhedsprofil og præferencer',
    back: 'Tilbage til dashboard',
    companyInfo: 'Virksomhedsinfo',
    contactInfo: 'Kontaktinfo',
    preferences: 'Præferencer',
    security: 'Sikkerhed',
    companyName: 'Virksomhedsnavn',
    website: 'Hjemmeside',
    cvr: 'CVR nummer',
    city: 'By',
    country: 'Land',
    contactName: 'Kontaktperson',
    title: 'Titel',
    email: 'E-mail',
    phone: 'Telefon',
    language: 'Sprog',
    notifications: 'Notifikationer',
    currentPassword: 'Nuværende adgangskode',
    newPassword: 'Ny adgangskode',
    confirmPassword: 'Bekræft adgangskode',
    save: 'Gem ændringer',
    changePassword: 'Skift adgangskode',
    saved: 'Ændringer gemt!',
    error: 'Der opstod en fejl',
    passwordMismatch: 'Adgangskoderne matcher ikke',
    passwordLength: 'Adgangskoden skal være mindst 8 tegn',
    passwordChanged: 'Adgangskode ændret!',
    passwordError: 'Kunne ikke ændre adgangskode',
    edit: 'Rediger',
    loading: 'Indlæser...',
    viewDetails: 'Se detaljer',
    updateInfo: 'Opdater information',
    cancel: 'Annuller',
  } : {
    title: 'Settings',
    subtitle: 'Manage your company profile and preferences',
    back: 'Back to dashboard',
    companyInfo: 'Company Info',
    contactInfo: 'Contact Info',
    preferences: 'Preferences',
    security: 'Password & Security',
    companyName: 'Company Name',
    website: 'Website',
    cvr: 'CVR Number',
    city: 'City',
    country: 'Country',
    contactName: 'Contact Person',
    title: 'Title',
    email: 'Email',
    phone: 'Phone',
    language: 'Language',
    notifications: 'Notifications',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    save: 'Save Changes',
    changePassword: 'Change Password',
    saved: 'Changes saved!',
    error: 'An error occurred',
    passwordMismatch: 'Passwords do not match',
    passwordLength: 'Password must be at least 8 characters',
    passwordChanged: 'Password changed!',
    passwordError: 'Failed to change password',
    edit: 'Edit',
    loading: 'Loading...',
    viewDetails: 'View Details',
    updateInfo: 'Update information',
    cancel: 'Cancel',
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#d4d4d4] border-t-[#2b2b2b]"></div>
          <p className="mt-4 text-[#737373] font-medium">{copy.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <SidebarTrigger className="text-[#2b2b2b]" />
          <Separator orientation="vertical" className="h-6 bg-[#d4d4d4]" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${locale}/dashboard/company`} className="flex items-center gap-1 text-[#737373] hover:text-[#2b2b2b]">
                  <Home className="h-4 w-4" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4 text-[#737373]" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#2b2b2b] font-medium">{copy.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#2b2b2b] flex items-center justify-center shadow-lg">
              <Settings className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2b2b2b]">{copy.title}</h1>
              <p className="text-sm sm:text-base text-[#737373] mt-1">{copy.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6 border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-[#f5f5f5] text-[#2b2b2b] border-2 border-[#d4d4d4] shadow-md">
            <AlertDescription className="font-medium flex items-center gap-2">
              <Save className="h-4 w-4" />
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Company Info Card */}
          <Card className="border-2 border-[#d4d4d4] bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#2b2b2b] flex items-center justify-center shadow-md shrink-0">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-[#2b2b2b]">{copy.companyInfo}</CardTitle>
                    <CardDescription className="text-sm text-[#737373] mt-1">Company details and business information</CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsCompanyModalOpen(true)} 
                  size="sm"
                  className="shrink-0 bg-[#2b2b2b] hover:bg-[#1a1a1a] text-white shadow-md"
                >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{copy.edit}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                  <Building2 className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs font-medium text-[#737373] mb-1">{copy.companyName}</dt>
                    <dd className="text-sm font-semibold text-[#2b2b2b] truncate">{companyInfo.companyName || '-'}</dd>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                  <Globe2 className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs font-medium text-[#737373] mb-1">{copy.website}</dt>
                    <dd className="text-sm font-semibold text-[#2b2b2b] truncate">{companyInfo.website || '-'}</dd>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                    <Shield className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs font-medium text-[#737373] mb-1">{copy.cvr}</dt>
                      <dd className="text-sm font-semibold text-[#2b2b2b]">{companyInfo.cvr || '-'}</dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                    <MapPin className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs font-medium text-[#737373] mb-1">{copy.city}</dt>
                      <dd className="text-sm font-semibold text-[#2b2b2b]">{companyInfo.city || '-'}</dd>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                  <Globe className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs font-medium text-[#737373] mb-1">{copy.country}</dt>
                    <dd className="text-sm font-semibold text-[#2b2b2b]">{companyInfo.country || '-'}</dd>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card className="border-2 border-[#d4d4d4] bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#2b2b2b] flex items-center justify-center shadow-md shrink-0">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-[#2b2b2b]">{copy.contactInfo}</CardTitle>
                    <CardDescription className="text-sm text-[#737373] mt-1">Primary contact details</CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsContactModalOpen(true)} 
                  size="sm"
                  className="shrink-0 bg-[#2b2b2b] hover:bg-[#525252] text-white shadow-md"
                >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{copy.edit}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                  <User className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs font-medium text-[#737373] mb-1">{copy.contactName}</dt>
                    <dd className="text-sm font-semibold text-[#2b2b2b] truncate">{contactInfo.name || '-'}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                  <Building2 className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs font-medium text-[#737373] mb-1">{copy.title}</dt>
                    <dd className="text-sm font-semibold text-[#2b2b2b] truncate">{contactInfo.title || '-'}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                  <Mail className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs font-medium text-[#737373] mb-1">{copy.email}</dt>
                    <dd className="text-sm font-semibold text-[#2b2b2b] truncate">{contactInfo.email || '-'}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                  <Phone className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs font-medium text-[#737373] mb-1">{copy.phone}</dt>
                    <dd className="text-sm font-semibold text-[#2b2b2b] truncate">{contactInfo.phone || '-'}</dd>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="border-2 border-[#d4d4d4] bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#2b2b2b] flex items-center justify-center shadow-md shrink-0">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-[#2b2b2b]">{copy.preferences}</CardTitle>
                    <CardDescription className="text-sm text-[#737373] mt-1">Language and notification settings</CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsPreferencesModalOpen(true)} 
                  size="sm"
                  className="shrink-0 bg-[#2b2b2b] hover:bg-[#525252] text-white shadow-md"
                >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{copy.edit}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                <Globe className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <dt className="text-xs font-medium text-[#737373] mb-1">{copy.language}</dt>
                  <dd className="text-sm font-semibold text-[#2b2b2b]">
                    {preferences.language === 'da' ? 'Dansk (Danish)' : 
                     preferences.language === 'en' ? 'English' : 
                     'Svenska (Swedish)'}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="border-2 border-[#d4d4d4] bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#2b2b2b] flex items-center justify-center shadow-md shrink-0">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-[#2b2b2b]">{copy.security}</CardTitle>
                    <CardDescription className="text-sm text-[#737373] mt-1">Password and account security</CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsPasswordModalOpen(true)} 
                  size="sm"
                  className="shrink-0 bg-[#2b2b2b] hover:bg-[#525252] text-white shadow-md"
                >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{copy.edit}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f5f5f5]">
                <Lock className="h-5 w-5 text-[#2b2b2b] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <dt className="text-xs font-medium text-[#737373] mb-1">Password</dt>
                  <dd className="text-sm font-semibold text-[#2b2b2b]">Click "Edit" to change your password</dd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Info Modal */}
        <Modal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#2b2b2b] flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span>{copy.companyInfo}</span>
            </div>
          }
          size="md"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.companyName}</Label>
              <Input
                value={companyInfo.companyName}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.website}</Label>
              <Input
                type="url"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.cvr}</Label>
              <Input
                value={companyInfo.cvr}
                onChange={(e) => setCompanyInfo({ ...companyInfo, cvr: e.target.value })}
                placeholder="12345678"
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#2b2b2b] font-medium">{copy.city}</Label>
                <Input
                  value={companyInfo.city}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                  disabled={loading}
                  className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#2b2b2b] font-medium">{copy.country}</Label>
                <Input
                  value={companyInfo.country}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, country: e.target.value })}
                  disabled={loading}
                  className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#d4d4d4]">
              <Button
                variant="outline"
                onClick={() => setIsCompanyModalOpen(false)}
                disabled={loading}
                className="border-[#d4d4d4] hover:bg-[#f5f5f5] text-[#2b2b2b]"
              >
                {copy.cancel}
              </Button>
              <ActionButton
                icon={Save}
                onClick={handleSaveCompanyInfo}
                loading={loading}
                className="bg-[#2b2b2b] hover:bg-[#525252] text-white"
              >
                {copy.save}
              </ActionButton>
            </div>
          </div>
        </Modal>

        {/* Contact Info Modal */}
        <Modal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#2b2b2b] flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span>{copy.contactInfo}</span>
            </div>
          }
          size="md"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.contactName}</Label>
              <Input
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.title}</Label>
              <Input
                value={contactInfo.title}
                onChange={(e) => setContactInfo({ ...contactInfo, title: e.target.value })}
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
                placeholder="e.g., HR Manager"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.email}</Label>
              <Input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
                placeholder="contact@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.phone}</Label>
              <Input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
                placeholder="+45 12 34 56 78"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#d4d4d4]">
              <Button
                variant="outline"
                onClick={() => setIsContactModalOpen(false)}
                disabled={loading}
                className="border-[#d4d4d4] hover:bg-[#f5f5f5] text-[#2b2b2b]"
              >
                {copy.cancel}
              </Button>
              <ActionButton
                icon={Save}
                onClick={handleSaveContactInfo}
                loading={loading}
                className="bg-[#2b2b2b] hover:bg-[#525252] text-white"
              >
                {copy.save}
              </ActionButton>
            </div>
          </div>
        </Modal>

        {/* Preferences Modal */}
        <Modal
          isOpen={isPreferencesModalOpen}
          onClose={() => setIsPreferencesModalOpen(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#2b2b2b] flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span>{copy.preferences}</span>
            </div>
          }
          size="md"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.language}</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                disabled={loading}
              >
                <SelectTrigger className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="da">🇩🇰 Dansk (Danish)</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="sv">🇸🇪 Svenska (Swedish)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#d4d4d4]">
              <Button
                variant="outline"
                onClick={() => setIsPreferencesModalOpen(false)}
                disabled={loading}
                className="border-[#d4d4d4] hover:bg-[#f5f5f5] text-[#2b2b2b]"
              >
                {copy.cancel}
              </Button>
              <ActionButton
                icon={Save}
                onClick={handleSavePreferences}
                loading={loading}
                className="bg-[#2b2b2b] hover:bg-[#525252] text-white"
              >
                {copy.save}
              </ActionButton>
            </div>
          </div>
        </Modal>

        {/* Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title={
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#2b2b2b] flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <span>{copy.changePassword}</span>
            </div>
          }
          size="md"
        >
          <div className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.currentPassword}</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.newPassword}</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
                placeholder="••••••••"
              />
              <p className="text-xs text-[#737373]">At least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#2b2b2b] font-medium">{copy.confirmPassword}</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                disabled={loading}
                className="border-[#d4d4d4] focus:border-[#2b2b2b] focus:ring-[#2b2b2b]"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#d4d4d4]">
              <Button
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={loading}
                className="border-[#d4d4d4] hover:bg-[#f5f5f5] text-[#2b2b2b]"
              >
                {copy.cancel}
              </Button>
              <ActionButton
                icon={Lock}
                onClick={handleChangePassword}
                loading={loading}
                className="bg-[#2b2b2b] hover:bg-[#525252] text-white"
              >
                {copy.changePassword}
              </ActionButton>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
