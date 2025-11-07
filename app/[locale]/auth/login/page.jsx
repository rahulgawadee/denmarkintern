'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleTabs } from '@/components/ui/role-tabs';
import { CompanyLoginForm } from '@/components/forms/CompanyLoginForm';
import { StudentLoginForm } from '@/components/forms/StudentLoginForm';
import { BackButton } from '@/components/ui/back-button';
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
        backButton: 'Tilbage',
      }
    : {
        title: 'Welcome back',
        subtitle: 'Choose your role to sign in',
        signupPrompt: 'Don\'t have an account?',
        signupLink: 'Sign up here',
        backButton: 'Back',
      };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Back Button - Fixed Position */}
      <div className="fixed left-4 top-4 z-50">
        <BackButton 
          href={`/${locale}`}
          variant="ghost"
          className="bg-white/80 backdrop-blur-sm shadow-sm hover:bg-[#f5f5f5] hover:shadow-md transition-all duration-200 text-[#2b2b2b] hover:text-[#525252]"
        >
          {copy.backButton}
        </BackButton>
      </div>

      <div className="mx-auto flex max-w-2xl items-center justify-center py-12 px-4">
        <Card className="w-full shadow-xl border-2 border-[#d4d4d4] bg-white/95 backdrop-blur">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2b2b2b] shadow-lg">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-[#2b2b2b]">
                {copy.title}
              </CardTitle>
              <CardDescription className="text-base text-[#737373]">
                {copy.subtitle}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <RoleTabs
              companyContent={<CompanyLoginForm locale={locale} />}
              studentContent={<StudentLoginForm locale={locale} />}
              defaultTab="student"
            />
            
            {/* Sign Up Link */}
            <div className="mt-8 pt-6 border-t border-[#d4d4d4]">
              <p className="text-center text-sm text-[#737373]">
                {copy.signupPrompt}{' '}
                <Link 
                  href={`/${locale}/auth/signup`} 
                  className="font-semibold text-[#2b2b2b] hover:text-[#525252] transition-colors underline-offset-4 hover:underline"
                >
                  {copy.signupLink}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
