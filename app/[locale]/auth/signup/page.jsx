'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleTabs } from '@/components/ui/role-tabs';
import { CompanySignupForm } from '@/components/forms/CompanySignupForm';
import { StudentSignupForm } from '@/components/forms/StudentSignupForm';
import { Sparkles } from 'lucide-react';

export default function SignupPage() {
  const params = useParams();
  const locale = params?.locale || 'da';

  const copy = locale === 'da'
    ? {
        title: 'Opret konto',
        subtitle: 'Vælg din rolle og kom i gang',
        loginPrompt: 'Har du allerede en konto?',
        loginLink: 'Log ind her',
      }
    : {
        title: 'Create account',
        subtitle: 'Choose your role to get started',
        loginPrompt: 'Already have an account?',
        loginLink: 'Log in here',
      };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="mx-auto flex max-w-2xl items-center justify-center py-12">
        <Card className="w-full">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-semibold text-zinc-900">{copy.title}</CardTitle>
            <CardDescription>{copy.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleTabs
              companyContent={<CompanySignupForm locale={locale} />}
              studentContent={<StudentSignupForm locale={locale} />}
              defaultTab="student"
            />
            <p className="mt-6 text-center text-xs text-zinc-500">
              {copy.loginPrompt}{' '}
              <Link href={`/${locale}/auth/login`} className="font-medium text-blue-600">
                {copy.loginLink}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
