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
import { ArrowLeft, Building2, User, Globe, Lock, AlertCircle, Save, Edit } from 'lucide-react';

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
      router.push(`/${locale}/login`);
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
      } else {
        const errorData = await res.json();
        if (res.status === 401) {
          setError('Session expired. Please log in again.');
          setTimeout(() => {
            router.push(`/${locale}/login`);
          }, 2000);
        } else {
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
        method: 'PATCH',
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
        method: 'PATCH',
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
        method: 'PATCH',
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
          <p className="mt-4 text-zinc-600">{copy.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}/dashboard/company`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {copy.back}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">{copy.title}</h1>
          <p className="text-zinc-600">{copy.subtitle}</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-900 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Settings Cards */}
        <div className="grid gap-6">
          {/* Company Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {copy.companyInfo}
                  </CardTitle>
                  <CardDescription>Company details and business information</CardDescription>
                </div>
                <Button onClick={() => setIsCompanyModalOpen(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {copy.edit}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.companyName}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{companyInfo.companyName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.website}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{companyInfo.website || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.cvr}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{companyInfo.cvr || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.city}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{companyInfo.city || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.country}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{companyInfo.country || '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {copy.contactInfo}
                  </CardTitle>
                  <CardDescription>Primary contact details</CardDescription>
                </div>
                <Button onClick={() => setIsContactModalOpen(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {copy.edit}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.contactName}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{contactInfo.name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.title}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{contactInfo.title || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.email}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{contactInfo.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.phone}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">{contactInfo.phone || '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {copy.preferences}
                  </CardTitle>
                  <CardDescription>Language and notification settings</CardDescription>
                </div>
                <Button onClick={() => setIsPreferencesModalOpen(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {copy.edit}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-zinc-500">{copy.language}</dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {preferences.language === 'da' ? 'Dansk (Danish)' : 
                     preferences.language === 'en' ? 'English' : 
                     'Svenska (Swedish)'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    {copy.security}
                  </CardTitle>
                  <CardDescription>Password and account security</CardDescription>
                </div>
                <Button onClick={() => setIsPasswordModalOpen(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {copy.changePassword}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Click the button above to change your password
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Info Modal */}
        <Modal
          isOpen={isCompanyModalOpen}
          onClose={() => setIsCompanyModalOpen(false)}
          title={copy.companyInfo}
          size="md"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{copy.companyName}</Label>
              <Input
                value={companyInfo.companyName}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.website}</Label>
              <Input
                type="url"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.cvr}</Label>
              <Input
                value={companyInfo.cvr}
                onChange={(e) => setCompanyInfo({ ...companyInfo, cvr: e.target.value })}
                placeholder="12345678"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{copy.city}</Label>
                <Input
                  value={companyInfo.city}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>{copy.country}</Label>
                <Input
                  value={companyInfo.country}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, country: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCompanyModalOpen(false)}
                disabled={loading}
              >
                {copy.cancel}
              </Button>
              <ActionButton
                icon={Save}
                onClick={handleSaveCompanyInfo}
                loading={loading}
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
          title={copy.contactInfo}
          size="md"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{copy.contactName}</Label>
              <Input
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.title}</Label>
              <Input
                value={contactInfo.title}
                onChange={(e) => setContactInfo({ ...contactInfo, title: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.email}</Label>
              <Input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.phone}</Label>
              <Input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsContactModalOpen(false)}
                disabled={loading}
              >
                {copy.cancel}
              </Button>
              <ActionButton
                icon={Save}
                onClick={handleSaveContactInfo}
                loading={loading}
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
          title={copy.preferences}
          size="md"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{copy.language}</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="da">Dansk (Danish)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sv">Svenska (Swedish)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPreferencesModalOpen(false)}
                disabled={loading}
              >
                {copy.cancel}
              </Button>
              <ActionButton
                icon={Save}
                onClick={handleSavePreferences}
                loading={loading}
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
          title={copy.changePassword}
          size="md"
        >
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>{copy.currentPassword}</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.newPassword}</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>{copy.confirmPassword}</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={loading}
              >
                {copy.cancel}
              </Button>
              <ActionButton
                icon={Lock}
                onClick={handleChangePassword}
                loading={loading}
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
