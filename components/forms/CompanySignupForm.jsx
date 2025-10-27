'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export function CompanySignupForm({ locale = 'da' }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    employerFullName: '',
    companyName: '',
    employerEmail: '',
    companyEmail: '',
    password: '',
    confirmPassword: '',
    position: '',
    website: '',
    country: 'Denmark',
    city: '',
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = locale === 'da'
    ? {
        submit: 'Opret virksomhedsprofil',
        errors: {
          passwordMatch: 'Adgangskoderne matcher ikke.',
          passwordLength: 'Adgangskoden skal være mindst 8 tegn.',
          email: 'Angiv en gyldig e-mail.',
        },
      }
    : {
        submit: 'Create company account',
        errors: {
          passwordMatch: 'Passwords do not match.',
          passwordLength: 'Password must be at least 8 characters.',
          email: 'Please enter a valid email.',
        },
      };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
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
          position: formData.position,
          website: formData.website,
          country: formData.country,
          city: formData.city,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      router.push(`/${locale}/auth/login?success=signup`);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="employerFullName">
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employerEmail">
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyEmail">
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">
          {locale === 'da' ? 'Rolle/Position (valgfri)' : 'Role/Position (optional)'}
        </Label>
        <Input
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder={locale === 'da' ? 'f.eks. HR Manager' : 'e.g. HR Manager'}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">
          {locale === 'da' ? 'Hjemmeside (valgfri)' : 'Company Website (optional)'}
        </Label>
        <Input
          id="website"
          name="website"
          type="url"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://company.com"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">
            {locale === 'da' ? 'Land (valgfri)' : 'Country (optional)'}
          </Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Denmark"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">
            {locale === 'da' ? 'By (valgfri)' : 'City (optional)'}
          </Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder={locale === 'da' ? 'København' : 'Copenhagen'}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{locale === 'da' ? 'Adgangskode' : 'Password'}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={loading}
        />
        <p className="text-xs text-zinc-500">
          {locale === 'da' ? 'Mindst 8 tegn' : 'Minimum 8 characters'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
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
        />
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="agreeToTerms"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          disabled={loading}
        />
        <Label htmlFor="agreeToTerms" className="text-sm font-normal leading-tight cursor-pointer">
          {locale === 'da' 
            ? 'Jeg accepterer vilkår og betingelser' 
            : 'I agree to the terms and conditions'}
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {locale === 'da' ? 'Opretter konto...' : 'Creating account...'}
          </>
        ) : (
          copy.submit
        )}
      </Button>
    </form>
  );
}
