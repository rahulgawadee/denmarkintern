'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import {
  HomeHeader,
  HeroSection,
  InfoTabsSection,
  ContactSection,
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
    <div className="min-h-screen bg-white text-[#4a3728] antialiased">
      <HomeHeader locale={locale} brand={text.brand} navItems={text.nav} primaryCta={text.hero?.primaryCta} />
      <main className="relative">
        <HeroSection locale={locale} hero={text.hero} />
        <InfoTabsSection locale={locale} />
        <ContactSection locale={locale} contact={text.contact} briefTemplateHref={briefTemplateHref} />
      </main>
      <HomeFooter footer={text.footer} />
    </div>
  );
}
