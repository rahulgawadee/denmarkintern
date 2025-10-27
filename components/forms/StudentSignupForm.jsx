'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function StudentSignupForm({ locale = 'da' }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    degree: '',
    yearOfStudy: '',
    city: '',
    country: '',
    languagePreference: locale || 'da',
    acceptedTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = locale === 'da'
    ? {
        fullName: 'Fulde navn',
        email: 'E-mail (Skole / Personlig)',
        password: 'Adgangskode',
        confirmPassword: 'Bekræft adgangskode',
        university: 'Universitet / Højskole',
        degree: 'Grad / Program',
        yearOfStudy: 'Studieår',
        country: 'Land',
        city: 'By',
        languagePreference: 'Sprogpræference',
        termsAndConditions: 'Jeg accepterer vilkår og betingelser',
        submit: 'Opret kandidatkonto',
        yearOptions: {
          1: '1. år',
          2: '2. år',
          3: '3. år',
          4: '4. år',
          masters: 'Kandidat',
          phd: 'Ph.d.',
        },
        langOptions: {
          en: 'English',
          da: 'Dansk',
          sv: 'Svenska',
        },
        errors: {
          passwordMatch: 'Adgangskoderne matcher ikke.',
          passwordLength: 'Adgangskoden skal være mindst 8 tegn.',
          termsRequired: 'Du skal acceptere vilkår og betingelser.',
        },
      }
    : {
        fullName: 'Full Name',
        email: 'Email (School / Personal)',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        university: 'University / College',
        degree: 'Degree / Program',
        yearOfStudy: 'Year of Study',
        country: 'Country',
        city: 'City',
        languagePreference: 'Language Preference',
        termsAndConditions: 'I accept the terms and conditions',
        submit: 'Create student account',
        yearOptions: {
          1: '1st Year',
          2: '2nd Year',
          3: '3rd Year',
          4: '4th Year',
          masters: 'Masters',
          phd: 'PhD',
        },
        langOptions: {
          en: 'English',
          da: 'Dansk',
          sv: 'Svenska',
        },
        errors: {
          passwordMatch: 'Passwords do not match.',
          passwordLength: 'Password must be at least 8 characters.',
          termsRequired: 'You must accept the terms and conditions.',
        },
      };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

    if (!formData.acceptedTerms) {
      setError(copy.errors.termsRequired);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'candidate',
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          university: formData.university,
          degree: formData.degree,
          yearOfStudy: formData.yearOfStudy,
          city: formData.city,
          country: formData.country,
          languagePreference: formData.languagePreference,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Redirect to dashboard on success
      router.push(`/${locale}/dashboard/candidate?welcome=true`);
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

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">{copy.fullName} *</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder={locale === 'da' ? 'Dit fulde navn' : 'Your full name'}
          required
          disabled={loading}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">{copy.email} *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@university.edu"
          required
          disabled={loading}
        />
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">{copy.password} *</Label>
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
          <Label htmlFor="confirmPassword">{copy.confirmPassword} *</Label>
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
      </div>

      {/* University & Degree */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="university">{copy.university} *</Label>
          <Input
            id="university"
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder={locale === 'da' ? 'Københavns Universitet' : 'University of Copenhagen'}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="degree">{copy.degree} *</Label>
          <Input
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            placeholder={locale === 'da' ? 'Datalogi' : 'Computer Science'}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Year of Study */}
      <div className="space-y-2">
        <Label htmlFor="yearOfStudy">{copy.yearOfStudy}</Label>
        <Select
          value={formData.yearOfStudy}
          onValueChange={(value) => handleSelectChange('yearOfStudy', value)}
          disabled={loading}
        >
          <SelectTrigger id="yearOfStudy">
            <SelectValue placeholder={locale === 'da' ? 'Vælg studieår' : 'Select year'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{copy.yearOptions[1]}</SelectItem>
            <SelectItem value="2">{copy.yearOptions[2]}</SelectItem>
            <SelectItem value="3">{copy.yearOptions[3]}</SelectItem>
            <SelectItem value="4">{copy.yearOptions[4]}</SelectItem>
            <SelectItem value="masters">{copy.yearOptions.masters}</SelectItem>
            <SelectItem value="phd">{copy.yearOptions.phd}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Country & City */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">{copy.country}</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder={locale === 'da' ? 'Danmark' : 'Denmark'}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{copy.city}</Label>
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

      {/* Language Preference */}
      <div className="space-y-2">
        <Label htmlFor="languagePreference">{copy.languagePreference}</Label>
        <Select
          value={formData.languagePreference}
          onValueChange={(value) => handleSelectChange('languagePreference', value)}
          disabled={loading}
        >
          <SelectTrigger id="languagePreference">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{copy.langOptions.en}</SelectItem>
            <SelectItem value="da">{copy.langOptions.da}</SelectItem>
            <SelectItem value="sv">{copy.langOptions.sv}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="acceptedTerms"
          name="acceptedTerms"
          checked={formData.acceptedTerms}
          onChange={(e) => 
            setFormData((prev) => ({ ...prev, acceptedTerms: e.target.checked }))
          }
          disabled={loading}
        />
        <Label
          htmlFor="acceptedTerms"
          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {copy.termsAndConditions} *
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
