'use client';

import { Building2, UserCircle, FileText, Users, Calendar, CheckCircle, Search, MessageSquare, ArrowRight, Sparkles, UserCheck, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HowItWorksSection({ locale = 'da' }) {
  const copy = locale === 'da' ? {
    title: 'Sådan Fungerer Platformen',
    subtitle: 'Fra tilmelding til ansættelse - en enkel proces for alle',
    companyFlow: 'Virksomhedsflow',
    studentFlow: 'Studentflow',
    matchingProcess: 'Smart Matching Proces',
    companySteps: [
      {
        icon: Building2,
        title: 'Opret Virksomhedsprofil',
        description: 'Registrer din virksomhed med grundlæggende oplysninger og verifikation',
        highlight: 'Gratis tilmelding',
      },
      {
        icon: FileText,
        title: 'Opslå Praktikroller',
        description: 'Definer rollebeskrivelse, krav, kompensation og ønskede færdigheder',
        highlight: 'Ubegrænsede opslag',
      },
      {
        icon: Sparkles,
        title: 'Automatisk Matching',
        description: 'Vores AI matcher kvalificerede kandidater baseret på dine krav',
        highlight: 'AI-drevet',
      },
      {
        icon: Users,
        title: 'Gennemgå Kandidater',
        description: 'Se matchede profiler med færdigheder, uddannelse og tilgængelighed',
        highlight: 'Detaljerede profiler',
      },
      {
        icon: MessageSquare,
        title: 'Send Invitationer',
        description: 'Inviter relevante kandidater og start samtaler direkte på platformen',
        highlight: 'Indbygget beskedgivning',
      },
      {
        icon: Calendar,
        title: 'Planlæg Interviews',
        description: 'Arranger møder med kandidater og træf den rigtige beslutning',
        highlight: 'Video interviews',
      },
      {
        icon: UserCheck,
        title: 'Ansæt & Onboard',
        description: 'Accepter kandidat og begynd onboarding-processen problemfrit',
        highlight: 'Hurtig start',
      },
    ],
    studentSteps: [
      {
        icon: UserCircle,
        title: 'Opret Profil',
        description: 'Tilmeld dig med din e-mail og grundlæggende universitetsoplysninger',
        highlight: 'Gratis for studerende',
      },
      {
        icon: FileText,
        title: 'Fuldfør Din Profil',
        description: 'Tilføj færdigheder, uddannelse, CV, portfolio og præferencer',
        highlight: '80%+ for bedste matches',
      },
      {
        icon: Sparkles,
        title: 'Modtag Auto-Matches',
        description: 'Algoritmen finder passende praktikpladser baseret på din profil',
        highlight: 'Daglige matches',
      },
      {
        icon: Search,
        title: 'Søg Praktikpladser',
        description: 'Gennemse tilgængelige roller og filtrer efter præferencer',
        highlight: 'Avancerede filtre',
      },
      {
        icon: MessageSquare,
        title: 'Modtag Invitationer',
        description: 'Virksomheder kan invitere dig direkte til relevante roller',
        highlight: 'Få tilbud',
      },
      {
        icon: Calendar,
        title: 'Deltag i Interviews',
        description: 'Deltag i virtuelle eller personlige interviews med virksomheder',
        highlight: 'Fleksibel planlægning',
      },
      {
        icon: Briefcase,
        title: 'Start Din Praktik',
        description: 'Accepter tilbud og begynd din professionelle rejse',
        highlight: 'Karrierestart',
      },
    ],
    matchingSteps: [
      {
        title: 'Profil Analyse',
        description: 'Systemet analyserer virksomhedskrav og studentfærdigheder',
      },
      {
        title: 'Smart Matching',
        description: 'AI-algoritme matcher baseret på færdigheder, placering og præferencer',
      },
      {
        title: 'Notifikationer',
        description: 'Begge parter modtager øjeblikkelige notifikationer om matches',
      },
      {
        title: 'Forbindelse',
        description: 'Direkte kommunikation muliggør hurtig beslutningstagning',
      },
    ],
  } : {
    title: 'How The Platform Works',
    subtitle: 'From signup to hire - a simple process for everyone',
    companyFlow: 'Company Flow',
    studentFlow: 'Student Flow',
    matchingProcess: 'Smart Matching Process',
    companySteps: [
      {
        icon: Building2,
        title: 'Create Company Profile',
        description: 'Register your company with basic information and verification',
        highlight: 'Free signup',
      },
      {
        icon: FileText,
        title: 'Post Internship Roles',
        description: 'Define role description, requirements, compensation, and desired skills',
        highlight: 'Unlimited postings',
      },
      {
        icon: Sparkles,
        title: 'Automatic Matching',
        description: 'Our AI matches qualified candidates based on your requirements',
        highlight: 'AI-powered',
      },
      {
        icon: Users,
        title: 'Review Candidates',
        description: 'View matched profiles with skills, education, and availability',
        highlight: 'Detailed profiles',
      },
      {
        icon: MessageSquare,
        title: 'Send Invitations',
        description: 'Invite relevant candidates and start conversations directly on platform',
        highlight: 'Built-in messaging',
      },
      {
        icon: Calendar,
        title: 'Schedule Interviews',
        description: 'Arrange meetings with candidates and make the right decision',
        highlight: 'Video interviews',
      },
      {
        icon: UserCheck,
        title: 'Hire & Onboard',
        description: 'Accept candidate and begin onboarding process seamlessly',
        highlight: 'Quick start',
      },
    ],
    studentSteps: [
      {
        icon: UserCircle,
        title: 'Create Profile',
        description: 'Sign up with your email and basic university information',
        highlight: 'Free for students',
      },
      {
        icon: FileText,
        title: 'Complete Your Profile',
        description: 'Add skills, education, CV, portfolio, and preferences',
        highlight: '80%+ for best matches',
      },
      {
        icon: Sparkles,
        title: 'Receive Auto-Matches',
        description: 'Algorithm finds suitable internships based on your profile',
        highlight: 'Daily matches',
      },
      {
        icon: Search,
        title: 'Browse Internships',
        description: 'Explore available roles and filter by your preferences',
        highlight: 'Advanced filters',
      },
      {
        icon: MessageSquare,
        title: 'Receive Invitations',
        description: 'Companies can invite you directly to relevant roles',
        highlight: 'Get offers',
      },
      {
        icon: Calendar,
        title: 'Attend Interviews',
        description: 'Participate in virtual or in-person interviews with companies',
        highlight: 'Flexible scheduling',
      },
      {
        icon: Briefcase,
        title: 'Start Your Internship',
        description: 'Accept offer and begin your professional journey',
        highlight: 'Career launch',
      },
    ],
    matchingSteps: [
      {
        title: 'Profile Analysis',
        description: 'System analyzes company requirements and student skills',
      },
      {
        title: 'Smart Matching',
        description: 'AI algorithm matches based on skills, location, and preferences',
      },
      {
        title: 'Notifications',
        description: 'Both parties receive instant notifications about matches',
      },
      {
        title: 'Connection',
        description: 'Direct communication enables quick decision making',
      },
    ],
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-[#ffefd5] border-y-2 border-[#ffe4b5]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-12 lg:mb-16">
          <Badge variant="secondary" className="mb-3 sm:mb-4 border border-[#ffe4b5] bg-white text-[#fa8072] font-semibold px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm">
            {copy.subtitle}
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#4a3728] mb-4 px-4">
            {copy.title}
          </h2>
        </div>

        {/* Two Column Flow - Company & Student */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16 lg:mb-20">
          
          {/* Company Flow */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:sticky lg:top-4 bg-[#ffefd5] py-3 z-10">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-linear-to-br from-[#ffa07a] to-[#fa8072] flex items-center justify-center shadow-lg shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#4a3728]">
                {copy.companyFlow}
              </h3>
            </div>

            {copy.companySteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connecting Line */}
                {index < copy.companySteps.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-linear-to-b from-[#ffa07a] to-[#fa8072]/20 z-0" />
                )}
                
                <Card className="border-2 border-[#ffe4b5] hover:border-[#ffa07a] transition-all duration-300 hover:shadow-lg bg-white relative z-10">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Number Badge */}
                      <div className="shrink-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-linear-to-br from-[#ffa07a] to-[#fa8072] flex items-center justify-center shadow-md">
                          <span className="text-base sm:text-lg font-bold text-white">{index + 1}</span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pt-0.5 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <step.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#fa8072] shrink-0" />
                            <h4 className="text-base sm:text-lg font-bold text-[#4a3728] truncate">{step.title}</h4>
                          </div>
                          <Badge className="bg-[#ffefd5] text-[#fa8072] border border-[#ffe4b5] text-[10px] sm:text-xs whitespace-nowrap shrink-0 w-fit">
                            {step.highlight}
                          </Badge>
                        </div>
                        <p className="text-[#6b5444] leading-relaxed text-xs sm:text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Student Flow */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:sticky lg:top-4 bg-[#ffefd5] py-3 z-10">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-linear-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-lg shrink-0">
                <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#4a3728]">
                {copy.studentFlow}
              </h3>
            </div>

            {copy.studentSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connecting Line */}
                {index < copy.studentSteps.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-linear-to-b from-[#10b981] to-[#10b981]/20 z-0" />
                )}
                
                <Card className="border-2 border-[#ffe4b5] hover:border-[#10b981] transition-all duration-300 hover:shadow-lg bg-white relative z-10">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Number Badge */}
                      <div className="shrink-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-linear-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-md">
                          <span className="text-base sm:text-lg font-bold text-white">{index + 1}</span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pt-0.5 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <step.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#10b981] shrink-0" />
                            <h4 className="text-base sm:text-lg font-bold text-[#4a3728] truncate">{step.title}</h4>
                          </div>
                          <Badge className="bg-[#d1fae5] text-[#059669] border border-[#a7f3d0] text-[10px] sm:text-xs whitespace-nowrap shrink-0 w-fit">
                            {step.highlight}
                          </Badge>
                        </div>
                        <p className="text-[#6b5444] leading-relaxed text-xs sm:text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

        </div>

        {/* Matching Process Section */}
        <div className="mt-12 sm:mt-16">
          <Card className="border-2 border-[#ffe4b5] bg-white shadow-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-linear-to-br from-[#ffa07a] to-[#fa8072] shadow-lg mb-3 sm:mb-4">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#4a3728] mb-2">
                  {copy.matchingProcess}
                </h3>
                <p className="text-sm sm:text-base text-[#6b5444] px-4">
                  {locale === 'da' 
                    ? 'Vores AI-drevne system forbinder de rigtige kandidater med de rigtige roller'
                    : 'Our AI-powered system connects the right candidates with the right roles'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {copy.matchingSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center px-2">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-linear-to-br from-[#ffefd5] to-[#ffe4b5] border-2 border-[#ffa07a] flex items-center justify-center font-bold text-[#fa8072] mb-2 sm:mb-3">
                        {index + 1}
                      </div>
                      <h4 className="font-bold text-[#4a3728] mb-1 sm:mb-2 text-sm sm:text-base">{step.title}</h4>
                      <p className="text-xs sm:text-sm text-[#6b5444] leading-relaxed">{step.description}</p>
                    </div>
                    {index < copy.matchingSteps.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-4 sm:top-5 -right-3 sm:-right-4 h-5 w-5 sm:h-6 sm:w-6 text-[#ffa07a]" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 sm:mt-16 text-center px-4">
          <Card className="max-w-2xl mx-auto border-2 border-[#ffe4b5] bg-white shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-[#10b981] mx-auto mb-3 sm:mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-[#4a3728] mb-2 sm:mb-3">
                {locale === 'da' ? 'Klar til at Komme I Gang?' : 'Ready to Get Started?'}
              </h3>
              <p className="text-[#6b5444] text-base sm:text-lg mb-4 sm:mb-6">
                {locale === 'da' 
                  ? 'Tilmeld dig i dag og oplev den nemmeste måde at finde praktikpladser eller talenter på'
                  : 'Join today and experience the easiest way to find internships or talents'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a
                  href={`/${locale}/auth/signup`}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  {locale === 'da' ? 'Til Virksomheder' : 'For Companies'}
                </a>
                <a
                  href={`/${locale}/auth/signup`}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-linear-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <UserCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  {locale === 'da' ? 'Til Studerende' : 'For Students'}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
