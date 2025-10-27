import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,
  
  // Locale prefix strategy
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Next.js internals
  matcher: ['/', '/(da|en|sv)/:path*']
};
