import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import StoreProvider from '@/store/StoreProvider';
import '../globals.css';

export const metadata = {
  title: 'Praktikplats — Danish companies meet Swedish interns',
  description: 'Handpicked Swedish interns for Danish teams with a fast, transparent matching flow.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages({ locale });

  return (
    <StoreProvider>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </StoreProvider>
  );
}
