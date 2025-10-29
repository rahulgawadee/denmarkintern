'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { HomeHeader } from '@/components/home';

export default function CompanySignupPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'da';

  const [formData, setFormData] = useState({
    employerFullName: '',
    companyName: '',
    employerEmail: '',
    companyEmail: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const copy = locale === 'da'
    ? {
        heading: 'Virksomhed – opret konto',
        description: 'Brug få oplysninger for at komme i gang. Udbyg profilen senere.',
        submit: 'Opret virksomhedsprofil',
        success: 'Kontoen er oprettet! Vi sender dig videre til login.',
        loginPrompt: 'Har du allerede en konto?',
        loginLink: 'Log ind',
        backToMain: 'Tilbage til hovedside',
        errors: {
          passwordMatch: 'Adgangskoderne matcher ikke.',
          passwordLength: 'Adgangskoden skal være mindst 8 tegn.',
          email: 'Angiv en gyldig e-mail.',
        },
      }
    : {
        heading: 'Company signup',
        description: 'Just the essentials to get started. You can enrich your profile later.',
        submit: 'Create company account',
        success: 'Account created! Redirecting you to login.',
        loginPrompt: 'Already have an account?',
        loginLink: 'Log in',
        backToMain: 'Back to home',
        errors: {
          passwordMatch: 'Passwords do not match.',
          passwordLength: 'Password must be at least 8 characters.',
          email: 'Please enter a valid email.',
        },
      };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(copy.errors.passwordMatch);
      return;
    }

    if (formData.password.length < 8) {
      setError(copy.errors.passwordLength);
      return;
    }

    if (!isValidEmail(formData.employerEmail) || !isValidEmail(formData.companyEmail)) {
      setError(copy.errors.email);
      return;
    }

    const trimmedName = formData.employerFullName.trim();
    const [firstName, ...rest] = trimmedName.split(' ');
    const lastName = rest.join(' ');

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'company',
          email: formData.employerEmail,
          password: formData.password,
          firstName: firstName || formData.employerFullName,
          lastName,
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          employerFullName: formData.employerFullName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/auth/login`);
      }, 2000);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <HomeHeader 
          locale={locale} 
          brand="Denmark Intern"
          navItems={[]}
          primaryCta={locale === 'da' ? 'Start nu' : 'Get started'}
        />
        <div className="min-h-screen bg-linear-to-br from-[#fdf5e6] via-[#ffefd5] to-[#ffe4b5] p-4 pt-24">
          <div className="mx-auto flex max-w-md items-center justify-center py-20">
            <Card className="w-full border-2 border-[#ffe4b5] shadow-xl bg-white">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#10b981] to-[#059669] shadow-lg">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-[#4a3728]">{locale === 'da' ? 'Konto oprettet' : 'Account ready'}</CardTitle>
                <CardDescription className="text-[#6b5444]">{copy.success}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HomeHeader 
        locale={locale} 
        brand="Denmark Intern"
        navItems={[]}
        primaryCta={locale === 'da' ? 'Start nu' : 'Get started'}
      />
      <div className="min-h-screen bg-linear-to-br from-[#fdf5e6] via-[#ffefd5] to-[#ffe4b5] p-4 pt-24">
        <div className="mx-auto flex max-w-lg items-center justify-center py-12">
          <Card className="w-full border-2 border-[#ffe4b5] shadow-xl bg-white/95 backdrop-blur">
            <CardHeader className="space-y-4 text-center pb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#ffa07a] to-[#fa8072] shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-[#4a3728]">{copy.heading}</CardTitle>
                <CardDescription className="text-base text-[#6b5444]">{copy.description}</CardDescription>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit} noValidate>
              <CardContent className="space-y-4 px-6">
                {error ? (
                  <Alert variant="destructive" className="border-red-300 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="employerFullName" className="text-[#4a3728] font-semibold">
                    {locale === 'da' ? 'Arbejdsgivers fulde navn' : 'Employer full name'}
                  </Label>
                  <Input
                    id="employerFullName"
                    name="employerFullName"
                    value={formData.employerFullName}
                    onChange={handleChange}
                    placeholder={locale === 'da' ? 'Fuldt navn' : 'Full name'}
                    required
                    disabled={loading}
                    className="border-2 border-[#ffe4b5] focus:border-[#fa8072]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-[#4a3728] font-semibold">
                    {locale === 'da' ? 'Virksomhedsnavn' : 'Company name'}
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder={locale === 'da' ? 'Virksomhedens navn' : 'Company name'}
                    required
                    disabled={loading}
                    className="border-2 border-[#ffe4b5] focus:border-[#fa8072]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerEmail" className="text-[#4a3728] font-semibold">
                    {locale === 'da' ? 'Arbejdsgivers e-mail' : 'Employer email'}
                  </Label>
                  <Input
                    id="employerEmail"
                    name="employerEmail"
                    type="email"
                    value={formData.employerEmail}
                    onChange={handleChange}
                    placeholder="name@company.dk"
                    required
                    disabled={loading}
                    className="border-2 border-[#ffe4b5] focus:border-[#fa8072]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-[#4a3728] font-semibold">
                    {locale === 'da' ? 'Virksomhedens e-mail (info@...)' : 'Company email'}
                  </Label>
                  <Input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    placeholder="info@company.dk"
                    required
                    disabled={loading}
                    className="border-2 border-[#ffe4b5] focus:border-[#fa8072]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#4a3728] font-semibold">{locale === 'da' ? 'Adgangskode' : 'Password'}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="border-2 border-[#ffe4b5] focus:border-[#fa8072]"
                  />
                  <p className="text-xs text-[#8b7355]">
                    {locale === 'da' ? 'Mindst 8 tegn' : 'Minimum 8 characters'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#4a3728] font-semibold">
                    {locale === 'da' ? 'Bekræft adgangskode' : 'Confirm password'}
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="border-2 border-[#ffe4b5] focus:border-[#fa8072]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 px-6 pb-8">
                <Button 
                  type="submit" 
                  className="w-full bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white font-bold shadow-lg hover:shadow-xl transition-all h-11" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {locale === 'da' ? 'Opretter konto...' : 'Creating account...'}
                    </>
                  ) : (
                    copy.submit
                  )}
                </Button>
                
                <div className="space-y-3 w-full">
                  <p className="text-center text-sm text-[#6b5444]">
                    {copy.loginPrompt}{' '}
                    <Link href={`/${locale}/auth/login`} className="font-semibold text-[#fa8072] hover:text-[#ffa07a] transition-colors underline-offset-4 hover:underline">
                      {copy.loginLink}
                    </Link>
                  </p>
                  <div className="pt-3 border-t border-[#ffe4b5]">
                    <Link 
                      href={`/${locale}`}
                      className="flex items-center justify-center gap-2 text-sm text-[#6b5444] hover:text-[#fa8072] transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {copy.backToMain}
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
