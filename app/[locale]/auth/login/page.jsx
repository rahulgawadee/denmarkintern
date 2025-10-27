'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleTabs } from '@/components/ui/role-tabs';
import { CompanyLoginForm } from '@/components/forms/CompanyLoginForm';
import { StudentLoginForm } from '@/components/forms/StudentLoginForm';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const params = useParams();
  const locale = params?.locale || 'da';

  const copy = locale === 'da'
    ? {
        title: 'Velkommen tilbage',
        subtitle: 'Vælg din rolle og log ind',
        signupPrompt: 'Har du ikke en konto?',
        signupLink: 'Opret konto her',
      }
    : {
        title: 'Welcome back',
        subtitle: 'Choose your role to sign in',
        signupPrompt: 'Don\'t have an account?',
        signupLink: 'Sign up here',
      };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="mx-auto flex max-w-2xl items-center justify-center py-12">
        <Card className="w-full">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
              <LogIn className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-semibold text-zinc-900">{copy.title}</CardTitle>
            <CardDescription>{copy.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleTabs
              companyContent={<CompanyLoginForm locale={locale} />}
              studentContent={<StudentLoginForm locale={locale} />}
              defaultTab="student"
            />
            <p className="mt-6 text-center text-xs text-zinc-500">
              {copy.signupPrompt}{' '}
              <Link href={`/${locale}/auth/signup`} className="font-medium text-blue-600">
                {copy.signupLink}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
