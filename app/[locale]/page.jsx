'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import {
  HomeHeader,
  HeroSection,
  ValuePropsSection,
  StorySection,
  RolesSection,
  ProcessSection,
  PricingSection,
  SocialProofSection,
  FaqSection,
  ContactSection,
  CheatSheetSection,
  HomeFooter,
} from '@/components/home';
import { homeContent, briefTemplateHref } from './home-content';

export default function HomePage() {
  const params = useParams();
  const locale = params?.locale || 'da';

  const text = useMemo(() => {
    if (locale === 'sv') {
      return homeContent.en;
    }

    return homeContent[locale] || homeContent.da;
  }, [locale]);

  if (!text) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fdf5e6] text-[#4a3728] antialiased">
      <HomeHeader locale={locale} brand={text.brand} navItems={text.nav} primaryCta={text.hero?.primaryCta} />
      <main className="relative">
        <HeroSection locale={locale} hero={text.hero} />
        <ValuePropsSection locale={locale} valueProps={text.valueProps} />
        <StorySection locale={locale} story={text.story} />
        <RolesSection locale={locale} roles={text.roles} />
        <ProcessSection locale={locale} process={text.process} />
        <PricingSection pricing={text.pricing} compliance={text.compliance} />
        <SocialProofSection testimonials={text.socialProof} />
        <FaqSection items={text.faq} />
        <ContactSection locale={locale} contact={text.contact} briefTemplateHref={briefTemplateHref} />
        <CheatSheetSection cheatSheet={text.cheatSheet} />
      </main>
      <HomeFooter footer={text.footer} />
    </div>
  );
}
